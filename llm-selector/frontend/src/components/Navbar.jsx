import { Link, useNavigate, useLocation } from "react-router-dom";
import { Bot, LayoutDashboard, Calculator, LogOut, Zap, FlaskConical, Scale } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { clsx } from "clsx";

const NAV = [
  { to: "/dashboard",    label: "Dashboard",  icon: LayoutDashboard },
  { to: "/requirements", label: "Recommend",  icon: Zap },
  { to: "/compare",      label: "Compare",    icon: Scale },
  { to: "/calculator",   label: "Calculator", icon: Calculator },
  { to: "/prompt-lab",   label: "Prompt Lab", icon: FlaskConical },
];

export default function Navbar() {
  const { email, logout } = useAuthStore();
  const navigate   = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-blue-400 text-lg">
          <Bot size={22} />
          <span>LLM Selector</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                pathname === to
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-gray-100 hover:bg-gray-800"
              )}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>

        {/* User */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 hidden sm:block">{email}</span>
          <button onClick={handleLogout} className="btn-ghost flex items-center gap-1.5 text-sm">
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
