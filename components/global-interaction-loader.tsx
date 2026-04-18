"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function isNavigableAnchor(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return false;
  }

  const anchor = target.closest("a[href]") as HTMLAnchorElement | null;

  if (!anchor) {
    return false;
  }

  if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
    return false;
  }

  const hrefAttr = anchor.getAttribute("href") ?? "";

  if (!hrefAttr || hrefAttr.startsWith("#")) {
    return false;
  }

  let url: URL;

  try {
    url = new URL(anchor.href, window.location.href);
  } catch {
    return false;
  }

  if (url.origin !== window.location.origin) {
    return false;
  }

  const nextUrl = `${url.pathname}${url.search}`;
  const currentUrl = `${window.location.pathname}${window.location.search}`;

  return nextUrl !== currentUrl;
}

export function GlobalInteractionLoader() {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);
  const pendingCountRef = useRef(0);
  const interactionCountRef = useRef(0);
  const interactionTimeoutRef = useRef<number | null>(null);
  const lastPathnameRef = useRef(pathname);

  const isLoading = pendingCount > 0;

  useEffect(() => {
    function syncPendingCount(value: number) {
      pendingCountRef.current = Math.max(0, value);
      setPendingCount(pendingCountRef.current);
    }

    function beginPending() {
      syncPendingCount(pendingCountRef.current + 1);
    }

    function endPending() {
      syncPendingCount(pendingCountRef.current - 1);
    }

    function beginInteractionPending() {
      interactionCountRef.current += 1;
      beginPending();

      if (interactionTimeoutRef.current) {
        window.clearTimeout(interactionTimeoutRef.current);
      }

      interactionTimeoutRef.current = window.setTimeout(() => {
        const interactionCount = interactionCountRef.current;
        interactionCountRef.current = 0;

        if (interactionCount > 0) {
          syncPendingCount(pendingCountRef.current - interactionCount);
        }

        interactionTimeoutRef.current = null;
      }, 20000);
    }

    function shouldTrackFetch(input: RequestInfo | URL, init?: RequestInit) {
      const method = (init?.method ?? "GET").toUpperCase();

      let url: URL;
      try {
        const raw = input instanceof Request ? input.url : String(input);
        url = new URL(raw, window.location.href);
      } catch {
        return false;
      }

      if (url.origin !== window.location.origin) {
        return false;
      }

      if (url.pathname.startsWith("/_next/")) {
        return false;
      }

      if (method !== "GET") {
        return true;
      }

      return url.pathname.startsWith("/api/");
    }

    function shouldTrackXhr(urlString: string, method: string) {
      let url: URL;

      try {
        url = new URL(urlString, window.location.href);
      } catch {
        return false;
      }

      if (url.origin !== window.location.origin) {
        return false;
      }

      if (url.pathname.startsWith("/_next/")) {
        return false;
      }

      if (method.toUpperCase() !== "GET") {
        return true;
      }

      return url.pathname.startsWith("/api/");
    }

    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const track = shouldTrackFetch(input, init);

      if (track) {
        beginPending();
      }

      try {
        return await originalFetch(input, init);
      } finally {
        if (track) {
          endPending();
        }
      }
    };

    const originalXhrOpen = XMLHttpRequest.prototype.open;
    const originalXhrSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (
      method: string,
      url: string | URL,
      async?: boolean,
      username?: string | null,
      password?: string | null,
    ) {
      (this as XMLHttpRequest & { __trackPendingRequest?: boolean }).__trackPendingRequest =
        shouldTrackXhr(String(url), method);
      return originalXhrOpen.call(this, method, url, async ?? true, username, password);
    };

    XMLHttpRequest.prototype.send = function (
      body?: Document | XMLHttpRequestBodyInit | null,
    ) {
      const shouldTrack = Boolean(
        (this as XMLHttpRequest & { __trackPendingRequest?: boolean })
          .__trackPendingRequest,
      );

      if (shouldTrack) {
        beginPending();
        this.addEventListener(
          "loadend",
          () => {
            endPending();
          },
          { once: true },
        );
      }

      return originalXhrSend.call(this, body);
    };

    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented) {
        return;
      }

      if (event.button !== 0) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      if (isNavigableAnchor(event.target)) {
        beginInteractionPending();
      }
    }

    function handleSubmit() {
      beginInteractionPending();
    }

    document.addEventListener("click", handleClick, true);
    document.addEventListener("submit", handleSubmit, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("submit", handleSubmit, true);

      if (interactionTimeoutRef.current) {
        window.clearTimeout(interactionTimeoutRef.current);
      }

      window.fetch = originalFetch;
      XMLHttpRequest.prototype.open = originalXhrOpen;
      XMLHttpRequest.prototype.send = originalXhrSend;
    };
  }, []);

  useEffect(() => {
    if (pathname !== lastPathnameRef.current) {
      const interactionCount = interactionCountRef.current;
      interactionCountRef.current = 0;

      if (interactionCount > 0) {
        pendingCountRef.current = Math.max(0, pendingCountRef.current - interactionCount);
        setPendingCount(pendingCountRef.current);
      }

      if (interactionTimeoutRef.current) {
        window.clearTimeout(interactionTimeoutRef.current);
        interactionTimeoutRef.current = null;
      }

      lastPathnameRef.current = pathname;
    }
  }, [pathname]);

  return (
    <>
      <div
        aria-hidden="true"
        className={`global-top-loader ${isLoading ? "is-active" : ""}`}
      />
      {isLoading ? (
        <>
          <div className="global-loading-overlay" aria-hidden="true" />
          <div role="status" aria-live="polite" className="global-loading-chip">
            <span className="global-loading-spinner" />
            Loading...
          </div>
        </>
      ) : null}
    </>
  );
}
