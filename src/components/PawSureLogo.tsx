// PawSure 宠诺 logo — raster mark (squircle paw + heart check) from public/brand/.

const MARK_SRC = "/brand/app-icon-512.png";

export function PawSureMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- sized via className across many layouts
    <img
      src={MARK_SRC}
      alt="PawSure logo mark"
      className={className}
      width={512}
      height={512}
      decoding="async"
    />
  );
}

// App-icon squircle already includes the paper tile — no extra wrapper needed.
export function PawSureMarkTile({
  className = "h-10 w-10",
}: {
  className?: string;
}) {
  return <PawSureMark className={className} />;
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
