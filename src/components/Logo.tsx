/** The GHOST wordmark, tinted with currentColor via a CSS mask. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Ghost"
      className={`logo-mask inline-block aspect-[1422/471] ${className}`}
      style={{ maskImage: "url(/brand/logo-wordmark.png)", WebkitMaskImage: "url(/brand/logo-wordmark.png)" }}
    />
  );
}

export function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 0C12.6 6.6 14.4 9.6 24 12 14.4 14.4 12.6 17.4 12 24 11.4 17.4 9.6 14.4 0 12 9.6 9.6 11.4 6.6 12 0Z"
        fill="currentColor"
      />
    </svg>
  );
}
