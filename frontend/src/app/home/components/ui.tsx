import type { ReactNode, CSSProperties } from "react";
import { colorPalette } from "../../../colorPallete";

export type MarketingPage = "landing" | "pricing" | "contact" | "registro" | "login";

export const marketingPath = (page: MarketingPage): string => {
  if (page === "login") return "/auth/login";
  if (page === "landing") return "/home";
  return `/home/${page}`;
};

export function PrimaryBtn({
  children,
  onClick,
  className = "",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:brightness-105 active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#d97757]/60 ${className}`}
      style={{ backgroundColor: colorPalette.Terracotta }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colorPalette.TerracottaHover)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colorPalette.Terracotta)}
    >
      {children}
    </button>
  );
}

export function GhostBtn({
  children,
  onClick,
  className = "",
  type = "button",
  variant = "light",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
  variant?: "light" | "dark";
}) {
  const light = variant === "light";
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#d97757]/40 ${
        light
          ? "text-[#2d2a26] border border-[#e7dfd7] bg-white hover:bg-[#faf7f5] hover:border-[#d6c9bf]"
          : "text-white border border-white/15 hover:bg-white/10"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function FieldInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  suffix,
}: {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: ReactNode;
}) {
  return (
    <div>
      <label className="block text-gray-500 text-xs font-semibold uppercase tracking-widest mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 text-sm outline-none transition-all border border-gray-200 bg-gray-50 focus:bg-white"
          onFocus={(e) => (e.target.style.borderColor = "rgba(34,197,94,0.6)")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(209,213,219,1)")}
        />
        {suffix && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">{suffix}</div>
        )}
      </div>
    </div>
  );
}