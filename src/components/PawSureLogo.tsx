// PawSure 宠诺 logo. The mark is the approved custom SVG (paw + shield + check);
// the lockup pairs it with the wordmark in the brand fonts/colors.

export function PawSureMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 256 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="PawSure logo mark"
    >
      <ellipse cx="72" cy="84" rx="23" ry="30" fill="#6FAF98" />
      <ellipse cx="118" cy="58" rx="24" ry="32" fill="#6FAF98" />
      <ellipse cx="164" cy="58" rx="24" ry="32" fill="#6FAF98" />
      <ellipse cx="207" cy="84" rx="23" ry="30" fill="#6FAF98" />
      <path
        d="M60 161C60 116.8 94.8 95 137 95C179.2 95 214 116.8 214 161C214 202.5 181.8 225 137 225C92.2 225 60 202.5 60 161Z"
        fill="#6FAF98"
      />
      <path
        d="M94 155C94 145.6 101.6 138 111 138H164C173.4 138 181 145.6 181 155V172.3C181 193.8 166.6 212.7 145.9 218.4L137.5 220.7L129.1 218.4C108.4 212.7 94 193.8 94 172.3V155Z"
        fill="#FFF8EF"
      />
      <path
        d="M112 172.5L130.5 191L166 154"
        stroke="#24594C"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Mark inside a rounded paper tile — for headers, avatars and badges.
export function PawSureMarkTile({
  className = "h-10 w-10",
}: {
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-2xl bg-paper shadow-soft ring-1 ring-inset ring-border ${className}`}
    >
      <PawSureMark className="h-[72%] w-[72%]" />
    </span>
  );
}

export function PawSureLogo({
  variant = "horizontal",
  showTagline = false,
  className = "",
}: {
  variant?: "horizontal" | "wordmark";
  showTagline?: boolean;
  className?: string;
}) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`} aria-label="PawSure 宠诺">
      {variant === "horizontal" && <PawSureMarkTile className="h-11 w-11 shrink-0" />}
      <div className="leading-none">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold tracking-[-0.03em] text-forest">
            PawSure
          </span>
          <span className="font-cn text-xl font-bold text-forest">宠诺</span>
        </div>
        {showTagline && (
          <p className="mt-1.5 text-xs font-medium text-muted">
            Every pet comes with confidence.
          </p>
        )}
      </div>
    </div>
  );
}
