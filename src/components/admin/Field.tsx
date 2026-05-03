import * as React from "react";

const inputCls =
  "mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-slate-100";

export function Field({
  label, name, defaultValue, type = "text", required, placeholder, hint, autoComplete,
}: {
  label: string; name: string;
  defaultValue?: string | number | null;
  type?: string; required?: boolean;
  placeholder?: string; hint?: string; autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-600">*</span>}
      </label>
      <input
        id={name} name={name} type={type} defaultValue={defaultValue ?? undefined}
        required={required} placeholder={placeholder} autoComplete={autoComplete}
        className={inputCls}
      />
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function TextArea({
  label, name, defaultValue, rows = 4, required, placeholder, hint,
}: {
  label: string; name: string;
  defaultValue?: string | null;
  rows?: number; required?: boolean;
  placeholder?: string; hint?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-600">*</span>}
      </label>
      <textarea
        id={name} name={name} rows={rows} defaultValue={defaultValue ?? undefined}
        required={required} placeholder={placeholder}
        className={inputCls + " font-mono text-xs"}
      />
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function Toggle({
  label, name, defaultChecked, hint,
}: { label: string; name: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox" name={name} defaultChecked={defaultChecked}
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        {label}
      </label>
      {hint && <p className="ml-6 mt-0.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function Select({
  label, name, defaultValue, options, required, hint,
}: {
  label: string; name: string; defaultValue?: string | null;
  options: { value: string; label: string }[];
  required?: boolean; hint?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-600">*</span>}
      </label>
      <select id={name} name={name} defaultValue={defaultValue ?? undefined} required={required} className={inputCls}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function FormFooter({
  saveLabel = "Αποθήκευση", deleteAction, deleteLabel = "Διαγραφή", deleteConfirm = "Σίγουρα διαγραφή;",
}: {
  saveLabel?: string;
  deleteAction?: () => void | Promise<void>;
  deleteLabel?: string;
  deleteConfirm?: string;
}) {
  return (
    <div className="flex items-center justify-between border-t border-slate-200 pt-4">
      <button
        type="submit"
        className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
      >
        {saveLabel}
      </button>
      {deleteAction && (
        <form action={deleteAction}>
          <button
            type="submit"
            className="text-sm text-red-700 hover:text-red-900"
            data-confirm={deleteConfirm}
          >
            {deleteLabel}
          </button>
        </form>
      )}
    </div>
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      {message}
    </div>
  );
}

export function FormOk({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
      ✓ {message}
    </div>
  );
}
