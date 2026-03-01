import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  ShoppingCart, 
  TrendingUp, 
  Settings,
  Stethoscope,
  AlertTriangle,
  LogOut
} from "lucide-react";

const AdminLayout = ({ children }) => {
  const location = useLocation();

  const menuItems = [
    {
      path: "/admin/dashboard",
      icon: LayoutDashboard,
      label: "Tableau de bord",
      emoji: "📊"
    },
    {
      path: "/admin/users",
      icon: Users,
      label: "Gestion des utilisateurs",
      emoji: "👤"
    },
    {
      path: "/admin/product",
      icon: Package,
      label: "Gestion des produits",
      emoji: "📦"
    },
    {
      path: "/admin/posts",
      icon: FileText,
      label: "Gestion des posts",
      emoji: "📄"
    },
    {
      path: "/admin/orders",
      icon: ShoppingCart,
      label: "Gestion des commandes",
      emoji: "🛒"
    },
    {
      path: "/admin/vets",
      icon: Stethoscope,
      label: "Gestion des vétérinaires",
      emoji: "🩺"
    },
    {
      path: "/admin/reports",
      icon: AlertTriangle,
      label: "Signalements",
      emoji: "⚠️"
    },
    {
      path: "/admin/stats",
      icon: TrendingUp,
      label: "Statistiques",
      emoji: "📈"
    },
    {
      path: "/admin/settings",
      icon: Settings,
      label: "Paramètres",
      emoji: "⚙️"
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-[#8657ff] text-white p-6 shadow-lg">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
          <p className="text-purple-200 text-sm mt-1">Cheebo Administration</p>
        </div>
        
        <nav className="space-y-2">
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
          
          {/* Séparateur */}
          <div className="border-t border-purple-300 border-opacity-30 my-4"></div>
          
          {/* Déconnexion */}
          <Link
            to="/"
            className="flex items-center gap-3 p-3 rounded-lg text-red-300 hover:bg-red-500 hover:bg-opacity-20 transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Déconnexion</span>
          </Link>
        </nav>
        
        {/* Footer sidebar */}
        <div className="mt-auto pt-6 border-t border-purple-300 border-opacity-30">
          <p className="text-purple-200 text-xs">© 2025 Cheebo</p>
          <p className="text-purple-200 text-xs">Version 1.0.0</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;