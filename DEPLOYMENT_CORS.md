# Production Deployment — CORS Hardening at the Edge

The FastAPI backend (`server.py`) already restricts `CORS_ORIGINS` via `.env`.
However, in the Emergent **preview** environment, the managed Kubernetes ingress
overwrites the `Access-Control-Allow-Origin` header to `*`, which masks the
backend's lock-down. This is fine for previewing but **must be tightened when
you deploy to production**.

Here are the canonical configs for each common target — copy the one matching
your host and set `ALLOWED_ORIGIN` to your production domain(s).

---

## 1. Kubernetes (nginx-ingress)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: aiact-scorecard
  annotations:
    nginx.ingress.kubernetes.io/enable-cors: "true"
    nginx.ingress.kubernetes.io/cors-allow-origin: "https://app.aiact-scorecard.eu"
    nginx.ingress.kubernetes.io/cors-allow-methods: "GET, POST, OPTIONS"
    nginx.ingress.kubernetes.io/cors-allow-headers: "Content-Type, Authorization"
    nginx.ingress.kubernetes.io/cors-allow-credentials: "false"
    nginx.ingress.kubernetes.io/cors-max-age: "600"
spec:
  rules:
    - host: api.aiact-scorecard.eu
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: backend
                port:
                  number: 8001
```

> Also remove `allow_origins=*` / `allow_credentials=True` combos from FastAPI
> when the edge handles CORS — otherwise `OPTIONS` responses will include
> duplicate/conflicting headers. Either let the ingress own CORS OR the app,
> not both.

---

## 2. Vercel (Serverless / Edge)

Create `vercel.json` at repo root:

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "https://app.aiact-scorecard.eu" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, POST, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" },
        { "key": "Access-Control-Max-Age", "value": "600" }
      ]
    }
  ]
}
```

---

## 3. Railway / Render / Fly.io

These platforms proxy unmodified, so FastAPI's `CORSMiddleware` is the only
layer — no action needed beyond setting `CORS_ORIGINS` in the service's env
vars. Already correctly configured in `.env`.

---

## 4. Cloudflare (in front of any origin)

Add a Transform Rule → "Modify Response Header":

```
When:
  Hostname: api.aiact-scorecard.eu
Action:
  Set static: Access-Control-Allow-Origin = https://app.aiact-scorecard.eu
```

---

## 5. Nginx (self-managed VPS)

```nginx
location /api/ {
    if ($http_origin = "https://app.aiact-scorecard.eu") {
        add_header Access-Control-Allow-Origin  $http_origin always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
        add_header Access-Control-Max-Age 600 always;
    }
    if ($request_method = OPTIONS) { return 204; }

    proxy_pass http://127.0.0.1:8001;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Real-IP $remote_addr;
}
```

---

## Verifying

From any non-allowed origin:

```bash
curl -I -H "Origin: https://evil.example" https://api.aiact-scorecard.eu/api/
# Expect: NO Access-Control-Allow-Origin header in response
```

From allowed origin:

```bash
curl -I -H "Origin: https://app.aiact-scorecard.eu" https://api.aiact-scorecard.eu/api/
# Expect: Access-Control-Allow-Origin: https://app.aiact-scorecard.eu
```

## Checklist before go-live

- [ ] Pick **one** CORS layer (ingress OR FastAPI) — don't double-configure.
- [ ] Set production origin(s) in whichever layer you chose.
- [ ] Also tighten rate limits if you expect >20 quiz submits/min/IP from
      shared NATs (server.py `@limiter.limit("20/minute")`).
- [ ] Ensure `X-Forwarded-For` is set by the proxy (already the case for all
      platforms above) so the per-IP rate limit isn't keyed to the proxy IP.
