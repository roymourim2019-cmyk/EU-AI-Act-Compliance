# Deployment Guide — EU AI Act Compliance

Frontend → **Vercel** · Backend → **Railway** · Database → **MongoDB Atlas**

---

## 1 · MongoDB Atlas (5 min · free forever)

1. Sign up at https://cloud.mongodb.com
2. Build Database → **M0 Free** cluster → pick a region near your users (AWS Mumbai `ap-south-1` if India-heavy)
3. **Database Access** → Add User → username `aiact_user`, generate strong password (save it)
4. **Network Access** → Add IP → `0.0.0.0/0` (Allow from anywhere) — Railway's IPs are dynamic
5. **Connect** → Drivers → copy the connection string, replacing `<password>` with the real password:
   ```
   mongodb+srv://aiact_user:REALPASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

---

## 2 · Push to GitHub

Click **"Save to GitHub"** in the Emergent chat input → pick repo name `eu-ai-act-compliance`.

---

## 3 · Backend on Railway (5 min)

1. https://railway.app → sign in with GitHub
2. **New Project** → **Deploy from GitHub repo** → pick the repo
3. Click the service → **Settings**:
   - **Root Directory**: `backend`
   - **Start Command**: leave blank (Procfile handles it)
4. **Variables** tab → add these (copy-paste from the template below):

```
MONGO_URL=mongodb+srv://aiact_user:REALPASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
DB_NAME=aiact_production
CORS_ORIGINS=https://your-vercel-domain.vercel.app
RAZORPAY_KEY_ID=rzp_test_SgwujOF5a9TiRy
RAZORPAY_KEY_SECRET=CrpmK7aDVXGV1ezwHgz382Xy
```

> Leave `CORS_ORIGINS` as a placeholder for now — you'll update it in step 5 once Vercel gives you a URL.

5. **Settings → Networking → Generate Domain** → copy the URL (e.g. `https://eu-ai-act-backend.up.railway.app`)
6. Smoke test in browser: `https://eu-ai-act-backend.up.railway.app/api/` should return `{"message":"EU AI Act Compliance Scorecard API"}`

---

## 4 · Frontend on Vercel (5 min)

1. https://vercel.com → **Add New → Project** → import the GitHub repo
2. Configuration:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend` (click Edit if it shows `./`)
   - **Build Command**: `yarn build` (default)
   - **Output Directory**: `build` (default)
3. **Environment Variables**:

```
REACT_APP_BACKEND_URL=https://eu-ai-act-backend.up.railway.app
```

   (Railway URL from step 3.5 — **no trailing slash**)

4. **Deploy** → wait ~2 min → you get `https://your-app.vercel.app`

---

## 5 · Lock CORS to your Vercel domain

Back in Railway → Variables tab → edit `CORS_ORIGINS`:

```
CORS_ORIGINS=https://your-app.vercel.app,https://your-custom-domain.com
```

(Comma-separated if multiple. Railway auto-redeploys.)

---

## 6 · Razorpay KYC (when ready for real payments)

1. https://dashboard.razorpay.com → complete KYC (PAN, bank, website = your Vercel URL)
2. Approval in 1–3 business days
3. Settings → API Keys → Generate **Live** Key
4. Railway → Variables → swap:
   ```
   RAZORPAY_KEY_ID=rzp_live_xxxxx
   RAZORPAY_KEY_SECRET=your_live_secret
   ```
5. Done. Zero code change.

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Frontend loads, no API calls work (CORS error in console) | `CORS_ORIGINS` on Railway must exactly match Vercel URL — no trailing slash, include `https://` |
| Razorpay checkout button says "mock checkout" | Env vars `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` missing on Railway |
| `502 Bad Gateway` on Railway | Check logs — usually a missing env var or MongoDB connection failure |
| Mongo connects in browser but Railway can't | Atlas Network Access must allow `0.0.0.0/0` |
| Vercel build fails on `yarn build` | Check Vercel's Node version is ≥ 18; set via env `NODE_VERSION=20` |

---

## Monthly cost

- MongoDB Atlas M0: **$0** (512MB)
- Railway Hobby: **$5/mo** (500h, auto-sleeps when idle)
- Vercel Hobby: **$0** (100GB bandwidth)
- Razorpay: **2% per transaction** (Indian cards), 3% international

**Total baseline: $5/mo** until traction.
