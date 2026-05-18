import React from "react";

export function FormField({
  label,
  description,
  children,
  error,
}: {
  label?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  error?: React.ReactNode;
}) {
  return (
    <div>
      {label ? <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label> : null}
      {description ? <p className="mb-2 text-xs text-slate-500">{description}</p> : null}
      <div>{children}</div>
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}

export default FormField;
