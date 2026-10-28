import type { LucideIcon } from "lucide-react";

interface NavbarItemProps {
  text: string;
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
}

const NavbarItem = ({ text, icon: Icon, active, onClick }: NavbarItemProps) => {
  return (
    <li className="flex h-full">
      <button
        type="button"
        onClick={onClick}
        aria-current={active ? "page" : undefined}
        className={`relative flex h-full items-center gap-2 px-3.5 text-sm font-medium transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 ${
          active
            ? "bg-white/[0.06] text-white"
            : "text-white/60 hover:bg-white/[0.06] hover:text-white"
        }`}
      >
        <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
        <span>{text}</span>
        {active && (
          <span
            className="absolute inset-x-2.5 bottom-0 h-0.5 rounded-full bg-brand-500"
            aria-hidden="true"
          />
        )}
      </button>
    </li>
  );
};

export default NavbarItem;
