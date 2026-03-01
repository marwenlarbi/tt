import React from "react";
import { Link, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-[#8657ff] text-white p-6">
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
        <nav className="space-y-4">
          <Link to="/admin/users" className="block hover:text-gray-300">
            👤 Gestion des utilisateurs
          </Link>
          <Link to="/admin/product" className="block hover:text-gray-300">
            📝 Gestion des produits
          </Link>
          <Link to="/admin/stats" className="block hover:text-gray-300">
            📊 Statistiques
          </Link>
          <Link to="/" className="block text-red-300 hover:text-red-200">
            🔓 Déconnexion
          </Link>
        </nav>
      </aside>

      {/* Main content will be injected here */}
      <main className="flex-1 p-10">
        <Outlet />
      </main>
    </div>
  );
}
