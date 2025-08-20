"use client";
import { useState } from 'react';
import Button from '../ui/button';

export interface InlineField {
  name: string;
  label?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  validate?: (value: string) => string | undefined;
}

export interface InlineFormProps {
  fields: InlineField[];
  submitLabel?: string;
  onSubmit: (values: Record<string, string>) => Promise<void> | void;
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}

export default function InlineForm({
  fields,
  submitLabel = 'Save',
  onSubmit,
  onSuccess,
  onError,
}: InlineFormProps) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, '']))
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const handleChange = (name: string, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
  };

  const validateFields = () => {
    const errs: Record<string, string> = {};
    for (const f of fields) {
      const val = values[f.name]?.trim();
      if (f.required && !val) {
        errs[f.name] = 'Required';
      } else if (f.validate) {
        const res = f.validate(val);
        if (res) errs[f.name] = res;
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields()) return;
    try {
      setBusy(true);
      await onSubmit(values);
      setBusy(false);
      onSuccess?.();
    } catch (err) {
      setBusy(false);
      onError?.(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="inline-flex items-start gap-2">
      {fields.map((f) => (
        <div key={f.name} className="flex flex-col">
          {f.label && (
            <label htmlFor={f.name} className="text-xs text-muted mb-1">
              {f.label}
            </label>
          )}
          <input
            id={f.name}
            type={f.type ?? 'text'}
            placeholder={f.placeholder}
            required={f.required}
            value={values[f.name] ?? ''}
            onChange={(e) => handleChange(f.name, e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
          {errors[f.name] && (
            <span className="text-xs text-red-500">{errors[f.name]}</span>
          )}
        </div>
      ))}
      <Button type="submit" disabled={busy}>
        {submitLabel}
      </Button>
    </form>
  );
}
