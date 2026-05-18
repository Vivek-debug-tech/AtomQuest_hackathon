export function PageTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-4">
      {eyebrow ? (
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
          {eyebrow}
        </p>
      ) : null}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-base leading-8 text-slate-600">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}