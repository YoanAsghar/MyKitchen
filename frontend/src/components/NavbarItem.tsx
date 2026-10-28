interface NavbarItemProps {
  text: string;
  image: string;
  active: boolean;
  onClick: () => void;
}

// Presentational nav item: the Navbar owns the navigation/active logic and
// just tells each item its label, icon, active state and click handler.
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
    </li>
  );
};

export default NavbarItem;
