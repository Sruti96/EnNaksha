import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "terracotta" | "forest" | "warm-brown";
  className?: string;
}

export default function Badge({
  children,
  variant = "terracotta",
  className = "",
}: BadgeProps) {
  const variants: Record<string, string> = {
    terracotta: "bg-terracotta text-ivory",
    forest: "bg-forest text-ivory",
    "warm-brown": "bg-warm-brown text-ivory",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold font-inter uppercase tracking-wider ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
