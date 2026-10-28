<<<<<<< HEAD
import type { LucideIcon } from "lucide-react";

interface NavbarItemProps {
  text: string;
  icon: LucideIcon;
=======
interface NavbarItemProps {
  text: string;
  image: string;
>>>>>>> origin/main
  active: boolean;
  onClick: () => void;
}

// Presentational nav item: the Navbar owns the navigation/active logic and
// just tells each item its label, icon, active state and click handler.
<<<<<<< HEAD
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
=======
const NavbarItem = ({ text, image, active, onClick }: NavbarItemProps) => {
  return (
    <li
      onClick={onClick}
      className={`flex flex-row items-center transition-transform hover:scale-110 hover:bg-black hover:invert px-3 py-3 w-40 rounded-lg cursor-pointer ${active ? "bg-black invert scale-90" : ""}`}
    >
      <img className="size-6 invert" src={image} alt={text} />
      <a href="#" className="flex items-center gap-2 px-4 text-white">
        {text}
      </a>
>>>>>>> origin/main
    </li>
  );
};

export default NavbarItem;
