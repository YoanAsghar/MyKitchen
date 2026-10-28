export default function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-ink">{title}</h1>
        <p className="mt-1 text-sm text-muted max-w-xl">{description}</p>
      </div>
      <div className="rounded-2xl border border-line bg-surface p-8 text-center shadow-sm">
        <p className="text-sm text-muted">Próximamente</p>
      </div>
    </div>
  );
}