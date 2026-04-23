import { useEffect } from "react";

/**
 * Lightweight per-route SEO updater.
 * Writes <title>, <meta name="description">, canonical, and OG tags
 * without adding an external dependency.
 */
const set = (selector, attr, value) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(selector.startsWith("link") ? "link" : "meta");
    // rough selector → attribute hydration
    if (selector.startsWith("link")) {
      el.setAttribute("rel", selector.match(/rel="([^"]+)"/)?.[1] || "canonical");
    } else {
      const key = selector.match(/\[(name|property)="([^"]+)"\]/);
      if (key) el.setAttribute(key[1], key[2]);
    }
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
};

export default function useSeo({ title, description, canonical, ogImage, keywords }) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) {
      set('meta[name="description"]', "content", description);
      set('meta[property="og:description"]', "content", description);
      set('meta[name="twitter:description"]', "content", description);
    }
    if (title) {
      set('meta[property="og:title"]', "content", title);
      set('meta[name="twitter:title"]', "content", title);
    }
    if (canonical) {
      set('link[rel="canonical"]', "href", canonical);
      set('meta[property="og:url"]', "content", canonical);
    }
    if (ogImage) {
      set('meta[property="og:image"]', "content", ogImage);
      set('meta[name="twitter:image"]', "content", ogImage);
    }
    if (keywords) set('meta[name="keywords"]', "content", keywords);
  }, [title, description, canonical, ogImage, keywords]);
}
