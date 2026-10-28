export default function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-white/40 max-w-xl">{description}</p>
      <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center">
        <p className="text-sm text-white/50">Próximamente</p>
      </div>
    </div>
  );
}