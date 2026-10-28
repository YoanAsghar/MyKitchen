import { BodyTabs } from "../models/BodyTabs";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ChefHat,
  History,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
} from "lucide-react";
import NavbarItem from "./NavbarItem";

interface SideBarProps {
  username: string;
  setTabChange: (tab: BodyTabs) => void;
  currentTab: BodyTabs;
  role: string;
  onLogout: () => void;
}

const actionClassName =
  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors duration-150 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 cursor-pointer";

// The active highlight is driven by `currentTab` (derived from the URL by the
// kitchen layout) instead of local click state, so it always matches the page
// you're on — including after a round-trip through /admin.
const Navbar = ({ role, username, setTabChange, onLogout, currentTab }: SideBarProps) => {
  const router = useRouter();

  function handleLogout() {
    onLogout();
    router.push("/");
  }

  return (
    <nav className="h-15 shrink-0 bg-night border-b border-night-line flex flex-row items-center">
      <div className="flex shrink-0 items-center gap-2.5 px-5">
        <ChefHat className="size-5 text-brand-500" strokeWidth={2} aria-hidden="true" />
        <span className="text-[15px] font-semibold tracking-tight text-white">
          MyKitchen
        </span>
      </div>

      <ul className="flex flex-1 flex-row items-stretch h-full pl-2">
        <NavbarItem
          text="Mesas"
          icon={LayoutGrid}
          active={currentTab === BodyTabs.mesas}
          onClick={() => setTabChange(BodyTabs.mesas)}
        />
        <NavbarItem
          text="Cocina"
          icon={ChefHat}
          active={currentTab === BodyTabs.cocina}
          onClick={() => setTabChange(BodyTabs.cocina)}
        />
        <NavbarItem
          text="Carta"
          icon={BookOpen}
          active={currentTab === BodyTabs.carta}
          onClick={() => setTabChange(BodyTabs.carta)}
        />
        <NavbarItem
          text="Órdenes"
          icon={History}
          active={currentTab === BodyTabs.ordenes}
          onClick={() => setTabChange(BodyTabs.ordenes)}
        />
      </ul>

      <div className="flex flex-row items-center gap-1 pr-3">
        {(role === "admin" || role === "owner") && (
          <button
            type="button"
            onClick={() => setTabChange(BodyTabs.admin)}
            className={actionClassName}
          >
            <LayoutDashboard className="size-4" strokeWidth={1.75} aria-hidden="true" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        )}
        <button type="button" onClick={handleLogout} className={actionClassName}>
          <span className="hidden max-w-[14ch] truncate sm:inline">
            {username.toUpperCase()}
          </span>
          <LogOut className="size-4" strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
