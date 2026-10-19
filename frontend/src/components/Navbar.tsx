import { BodyTabs } from "../models/BodyTabs";
import { useRouter } from "next/navigation";

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
          <li
            onClick={() => {
              setTabChange(BodyTabs.mesas);
            }}
            className={`flex flex-row items-center transition-transform hover:scale-110 hover:bg-black hover:invert px-3 py-3 w-40 rounded-lg cursor-pointer ${currentTab === BodyTabs.mesas ? "bg-black invert scale-90" : ""}`}
          >
            <img className="size-6 invert" src="/home_icon.png" alt="" />
            <a href="#" className="flex items-center gap-2 px-4 text-white">
              Mesas
            </a>
          </li>
          <li
            onClick={() => {
              setTabChange(BodyTabs.cocina);
            }}
            className={`flex flex-row items-center transition-transform hover:scale-110 hover:bg-black hover:invert px-3 py-3 w-40 rounded-lg cursor-pointer ${currentTab === BodyTabs.cocina ? "bg-black invert scale-90" : ""}`}
          >
            <img className="size-6 invert" src="/kitchen.png" alt="" />
            <a href="#" className="flex items-center gap-2 px-4 text-white">
              Cocina
            </a>
          </li>
          <li
            onClick={() => {
              setTabChange(BodyTabs.carta);
            }}
            className={`flex flex-row items-center transition-transform hover:scale-110 hover:bg-black hover:invert px-3 py-3 w-40 rounded-lg cursor-pointer ${currentTab === BodyTabs.carta ? "bg-black invert scale-90" : ""}`}
          >
            <img className="size-6 invert" src="/food.png" alt="" />
            <a href="#" className="flex items-center gap-2 px-4 text-white">
              Carta
            </a>
          </li>
          <li
            onClick={() => {
              setTabChange(BodyTabs.ordenes);
            }}
            className={`flex flex-row items-center transition-transform hover:scale-110 hover:bg-black hover:invert px-3 py-3 w-40 rounded-lg cursor-pointer ${currentTab === BodyTabs.ordenes ? "bg-black invert scale-90" : ""}`}
          >
            <img className="size-6 invert" src="/orders.png" alt="" />
            <a href="#" className="flex items-center gap-2 px-4 text-white ">
              Ordenes
            </a>
          </li>
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

