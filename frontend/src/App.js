import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AdminRoute } from './routes/AdminRoutes';

// Pages
import AdminDashboard from './pages/admin_pages/AdminDashboard';
import Adoption from './pages/users_pages/Adoption';
import Home from './pages/users_pages/Home';
import ProductDetail from './pages/users_pages/Product';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/users_pages/Profile';
import Pets from './pages/users_pages/pets';
import Vet from './pages/users_pages/vet';
import ResetPassword from './pages/ResetPassword';
import Accueil from './pages/Accueil'; // Import de la page d'accueil

// Admin Components
import AdminProduct from './pages/admin_pages/AdminProduct';
import AdminUsers from './pages/admin_pages/AdminUsers';
import AdminPosts from './pages/admin_pages/AdminPosts';
import AdminStats from './pages/admin_pages/AdminStats';
import AdminOrders from './pages/admin_pages/AdminOrders';
import AdminSettings from './pages/admin_pages/AdminSettings';
import AdminReports from './pages/admin_pages/AdminReports';
import AdminVets from './pages/admin_pages/AdminVets';

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin routes */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/product"
          element={
            <AdminRoute>
              <AdminProduct />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/vets"
          element={
            <AdminRoute>
              <AdminVets />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/posts"
          element={
            <AdminRoute>
              <AdminPosts />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/stats"
          element={
            <AdminRoute>
              <AdminStats />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <AdminOrders />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AdminRoute>
              <AdminSettings />
            </AdminRoute>
          }
        />
        
        <Route
          path="/admin/reports"
          element={
            <AdminRoute>
              <AdminReports />
            </AdminRoute>
          }
        />

        {/* Public routes */}
        <Route path="/" element={<Accueil />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/home" element={<Home />} />
        <Route path="/product" element={<ProductDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/pets" element={<Pets />} />
        <Route path="/vet" element={<Vet />} />
        <Route path="/adoption" element={<Adoption />} />
      </Routes>
    </Router>
  );
}

export default App;