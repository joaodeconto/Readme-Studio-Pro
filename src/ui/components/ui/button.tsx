"use client";
import React from 'react';
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline';
}
export default function Button({
  children,
  variant = 'default',
  ...props
}: React.PropsWithChildren<ButtonProps>) {
  const base = 'px-3 py-1 rounded';
  const styles: Record<string, string> = {
    default: 'bg-accent text-white',
    secondary: 'bg-subtle text-base',
    outline: 'border border-accent text-accent',
  };
  return (
    <button className={`${base} ${styles[variant] ?? styles.default}`} {...props}>
      {children}
    </button>
  );
}
