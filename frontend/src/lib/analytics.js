// Thin PostHog wrapper. Script is loaded in public/index.html.
// window.posthog is available globally.

const safe = (fn) => {
  try {
    if (typeof window !== "undefined" && window.posthog) fn(window.posthog);
  } catch {
    // no-op
  }
};

export const track = (event, properties = {}) => {
  safe((ph) => ph.capture(event, properties));
};

export const identify = (distinctId, props = {}) => {
  safe((ph) => ph.identify(distinctId, props));
};
