import { Link, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  MessageSquare,
  TrendingUp,
  Settings,

  LogOut,
  Stethoscope,
  ClipboardList,
} from "lucide-react";

const VetLayout = ({ children }) => {
  const location = useLocation();

  const menuItems = [
    { path: "/vet/dashboard",     icon: LayoutDashboard, label: "Tableau de bord", emoji: "📊" },
    { path: "/vet/appointments",  icon: Calendar,        label: "Rendez-vous",     emoji: "📅" },
    { path: "/vet/patients",      icon: Users,           label: "Mes patients",    emoji: "🐾" },
    { path: "/vet/consultations", icon: ClipboardList,   label: "Consultations",   emoji: "🩺" },
    { path: "/vet/prescriptions", icon: FileText,        label: "Ordonnances",     emoji: "📋" },
    { path: "/vet/messages",      icon: MessageSquare,   label: "Messages",        emoji: "💬" },
    { path: "/vet/stats",         icon: TrendingUp,      label: "Statistiques",    emoji: "📈" },
    { path: "/vet/settings",      icon: Settings,        label: "Paramètres",      emoji: "⚙️" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0e9f6e] text-white p-6 shadow-lg flex flex-col">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Stethoscope className="w-7 h-7 text-white" />
            <h2 className="text-2xl font-bold">Vet Panel</h2>
          </div>
          <p className="text-green-100 text-sm mt-1">Espace Vétérinaire</p>
        </div>

        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "bg-white bg-opacity-20 text-yellow-300 font-semibold"
                    : "text-white hover:bg-white hover:bg-opacity-10"
                }`}
              >
                <span className="text-lg">{item.emoji}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}

          <div className="border-t border-green-300 border-opacity-30 my-4"></div>

          <Link
            to="/"
            className="flex items-center gap-3 p-3 rounded-lg text-red-300 hover:bg-red-500 hover:bg-opacity-20 transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Déconnexion</span>
          </Link>
        </nav>

        <div className="pt-6 border-t border-green-300 border-opacity-30">
          <p className="text-green-100 text-xs">© 2026 Cheebo</p>
          <p className="text-green-100 text-xs">Espace Vétérinaire</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
};

export default VetLayout;