import { BodyTabs } from "../models/BodyTabs";
import { useRouter } from "next/navigation";
import NavbarItem from "./NavbarItem";

interface SideBarProps {
  username: string;
  setTabChange: (tab: BodyTabs) => void;
  currentTab: BodyTabs;
  role: string;
  onLogout: () => void;
}

// The active highlight is driven by `currentTab` (derived from the URL by the
// kitchen layout) instead of local click state, so it always matches the page
// you're on — including after a round-trip through /admin.
const Navbar = ({role, username, setTabChange, onLogout, currentTab} : SideBarProps) => {
  const router = useRouter();

  function handleLogout(){
    onLogout();
    router.push("/");
  }

  return (
    <nav
      className={`h-15 bg-[#22007c] border-r shadow-sm flex flex-row transition-all duration-300 items-center`}
    >
      {/* Logo / Header */}
      <div className="p-3 min-h-12">
        <img className="w-40" src="/logoipsum.png" alt="" />
      </div>
      {/* Menú */}
      <nav className="flex-1 py-2 pl-10">
        <ul className="space-y-0.5 flex flex-row">
          <NavbarItem
            text="Mesas"
            image="/home_icon.png"
            active={currentTab === BodyTabs.mesas}
            onClick={() => setTabChange(BodyTabs.mesas)}
          />
          <NavbarItem
            text="Cocina"
            image="/kitchen.png"
            active={currentTab === BodyTabs.cocina}
            onClick={() => setTabChange(BodyTabs.cocina)}
          />
          <NavbarItem
            text="Carta"
            image="/food.png"
            active={currentTab === BodyTabs.carta}
            onClick={() => setTabChange(BodyTabs.carta)}
          />
          <NavbarItem
            text="Ordenes"
            image="/orders.png"
            active={currentTab === BodyTabs.ordenes}
            onClick={() => setTabChange(BodyTabs.ordenes)}
          />
        </ul>
      </nav>

      {/* Footer */}
      <div className="flex flex-row">
        {role === "admin" || role === "owner" ? (
          <button
            onClick={() => {
              setTabChange(BodyTabs.admin);
            }}
            className="px-3 flex flex-row items-center cursor-pointer py-3 rounded-lg hover:bg-black hover:invert"
          >
            <img className="size-6 invert" src="/admin.png" alt="Admin" />
            <p className="text-sm px-4 text-white">Admin</p>
          </button>
        ) : (
          <></>
        )}
        <button
          onClick={handleLogout}
          className="px-3 flex flex-row items-center cursor-pointer py-3 rounded-lg hover:bg-black hover:invert"
        >
          <p className="text-sm px-4 text-white">{username.toUpperCase()}</p>
          <img
            src="/logout.png"
            alt="Cerrar sesion"
            className="size-6 invert"
          />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

