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
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    const settleTimer = window.setTimeout(() => {
      setIsLoading(false);

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }, 0);

    return () => {
      window.clearTimeout(settleTimer);
    };
  }, [pathname, isLoading]);

  useEffect(() => {
    function startLoading() {
      setIsLoading(true);

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        setIsLoading(false);
        timeoutRef.current = null;
      }, 15000);
    }

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
        startLoading();
      }
    }

    function handleSubmit() {
      startLoading();
    }

    document.addEventListener("click", handleClick, true);
    document.addEventListener("submit", handleSubmit, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("submit", handleSubmit, true);
    };
  }, []);

  return (
    <>
      <div
        aria-hidden="true"
        className={`global-top-loader ${isLoading ? "is-active" : ""}`}
      />
      {isLoading ? (
        <div
          role="status"
          aria-live="polite"
          className="global-loading-chip"
        >
          <span className="global-loading-spinner" />
          처리 중...
        </div>
      ) : null}
    </>
  );
}
