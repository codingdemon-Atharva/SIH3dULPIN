"use client";

import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "dark" | "light" | "cream";
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Card({
  children,
  variant = "dark",
  title,
  subtitle,
  action,
  className = "",
  ...props
}: CardProps) {
  const variantStyles = {
    dark: "bg-[#0f2d21]/80 border-[#1f3a2f] text-[#f8faf8]",
    light: "bg-white border-[#e2dad0] text-[#162a21] shadow-sm",
    cream: "bg-[#fdfbf7] border-[#e2dad0] text-[#162a21] shadow-sm",
  };

  return (
    <div
      className={`rounded-2xl border p-5 transition-all duration-200 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between mb-4 border-b border-inherit/40 pb-3">
          <div>
            {title && (
              <h3 className="text-base font-bold tracking-tight">{title}</h3>
            )}
            {subtitle && (
              <p className="text-xs opacity-75 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: string;
}

export function StatCard({
  label,
  value,
  subtext,
  icon,
  trend,
}: StatCardProps) {
  return (
    <Card variant="dark" className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#a8c3b5]">
            {label}
          </span>
          <div className="text-2xl font-extrabold text-white mt-1">{value}</div>
          {subtext && (
            <p className="text-xs text-[#6c8a7b] mt-1">{subtext}</p>
          )}
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14382a] border border-[#255943] text-[#52b788]">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-[#52b788]">
          <span>↑</span>
          <span>{trend}</span>
        </div>
      )}
    </Card>
  );
}

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "gold";
  size?: "sm" | "md";
}

export function Badge({
  children,
  variant = "neutral",
  size = "sm",
}: BadgeProps) {
  const variantStyles = {
    success: "bg-[#133a27] text-[#6ee7b7] border-[#255943]",
    warning: "bg-[#422006] text-[#fde047] border-[#854d0e]",
    danger: "bg-[#450a0a] text-[#fca5a5] border-[#991b1b]",
    info: "bg-[#0c2a4a] text-[#93c5fd] border-[#1d4ed8]",
    neutral: "bg-[#14382a] text-[#a8c3b5] border-[#1f3a2f]",
    gold: "bg-[#3a2e14] text-[#c5a059] border-[#b8860b]",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-bold uppercase tracking-wider ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {children}
    </span>
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "gold";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  className = "",
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary: "bg-[#2d6a4f] text-white hover:bg-[#1b4332] shadow-sm border border-[#2d6a4f]",
    secondary: "bg-[#3d5a4c] text-white hover:bg-[#2d6a4f] border border-[#3d5a4c]",
    outline: "bg-white text-[#162a21] border border-[#e2dad0] hover:bg-[#f3efe6] hover:text-[#2d6a4f] shadow-sm",
    danger: "bg-[#881337] text-white hover:bg-[#450a0a] border border-[#991b1b]",
    gold: "bg-[#b8860b] text-white hover:bg-[#8c6607] border border-[#c5a059]",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
    md: "px-4 py-2 text-sm rounded-xl gap-2",
    lg: "px-5 py-2.5 text-base rounded-xl gap-2.5",
  };

  return (
    <button
      className={`inline-flex items-center justify-center font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

export interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: (term: string) => void;
}

export function SearchBar({
  placeholder = "Search ULPIN, property, or parcel...",
  value,
  onChange,
  onSearch,
}: SearchBarProps) {
  const [internalTerm, setInternalTerm] = React.useState("");
  const term = value !== undefined ? value : internalTerm;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (value === undefined) setInternalTerm(e.target.value);
    if (onChange) onChange(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearch) {
      onSearch(term);
    }
  };

  return (
    <div className="relative flex items-center w-full">
      <div className="absolute left-3.5 text-[#52b788] pointer-events-none">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={term}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#1f3a2f] bg-[#0f2d21] pl-10 pr-24 py-2.5 text-sm text-white placeholder-[#6c8a7b] outline-none transition focus:border-[#52b788] focus:ring-2 focus:ring-[#2d6a4f]/50"
      />
      <button
        type="button"
        onClick={() => onSearch && onSearch(term)}
        className="absolute right-2 rounded-lg bg-[#1b4332] px-3 py-1 text-xs font-semibold text-white hover:bg-[#255943] transition cursor-pointer border border-[#2d6a4f]"
      >
        Search
      </button>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-[#1f3a2f] bg-[#0f2d21]/40">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#14382a] text-[#52b788] mb-3">
        📍
      </div>
      <h4 className="text-base font-bold text-white">{title}</h4>
      {description && (
        <p className="text-xs text-[#a8c3b5] max-w-sm mt-1 mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}

export function LoadingState({ message = "Loading land records..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#52b788] border-t-transparent mb-3" />
      <span className="text-xs font-semibold text-[#a8c3b5]">{message}</span>
    </div>
  );
}
