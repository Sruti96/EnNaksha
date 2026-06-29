"use client";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  href?: string;
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  href,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-inter font-semibold px-6 py-3 rounded-lg transition-all duration-200 text-base cursor-pointer";

  const variants: Record<string, string> = {
    primary:
      "bg-warm-brown text-ivory hover:bg-opacity-90 hover:shadow-lg active:scale-95",
    secondary:
      "border-2 border-warm-brown text-warm-brown hover:bg-warm-brown hover:text-ivory active:scale-95",
    ghost:
      "border border-charcoal text-charcoal hover:bg-charcoal hover:text-ivory active:scale-95",
  };

  const cls = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}
