export function EmailVerifiedBanner({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
    >
      {message}
    </div>
  );
}
