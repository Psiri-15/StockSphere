import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { SocketProvider } from './context/SocketContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterSeller from './pages/RegisterSeller';
import About from './pages/About';
import Contact from './pages/Contact';

// Customer Pages
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import OrderTracking from './pages/OrderTracking';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerProfile from './pages/CustomerProfile';

// Seller Pages
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerProducts from './pages/seller/SellerProducts';
import AddProduct from './pages/seller/AddProduct';
import EditProduct from './pages/seller/EditProduct';
import SellerInventory from './pages/seller/SellerInventory';
import SellerOrders from './pages/seller/SellerOrders';
import SellerNotifications from './pages/seller/SellerNotifications';
import SellerReports from './pages/seller/SellerReports';
import SellerProfile from './pages/seller/SellerProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageSellers from './pages/admin/ManageSellers';
import SellerApprovals from './pages/admin/SellerApprovals';
import ManageCategories from './pages/admin/ManageCategories';
import ManageAllProducts from './pages/admin/ManageAllProducts';
import ManageAllOrders from './pages/admin/ManageAllOrders';
import Transactions from './pages/admin/Transactions';
import AdminAnalytics from './pages/admin/AdminAnalytics';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <SocketProvider>
              <Routes>
                {/* Public & Customer Storefront Routes */}
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Home />} />
                  <Route path="products" element={<Products />} />
                  <Route path="products/:id" element={<ProductDetails />} />
                  <Route path="about" element={<About />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="seller/register" element={<RegisterSeller />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="wishlist" element={<Wishlist />} />

                  {/* Checkout & Orders */}
                  <Route
                    path="checkout"
                    element={
                      <ProtectedRoute allowedRoles={['Customer']}>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="orders"
                    element={
                      <ProtectedRoute allowedRoles={['Customer']}>
                        <OrderHistory />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="orders/:id"
                    element={
                      <ProtectedRoute allowedRoles={['Customer', 'Seller', 'Admin']}>
                        <OrderTracking />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* Customer Dashboard Console */}
                <Route
                  path="/customer"
                  element={
                    <ProtectedRoute allowedRoles={['Customer']}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/customer/dashboard" replace />} />
                  <Route path="dashboard" element={<CustomerDashboard />} />
                  <Route path="profile" element={<CustomerProfile />} />
                </Route>

                {/* Seller Dashboard Console */}
                <Route
                  path="/seller"
                  element={
                    <ProtectedRoute allowedRoles={['Seller', 'Admin']}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/seller/dashboard" replace />} />
                  <Route path="dashboard" element={<SellerDashboard />} />
                  <Route path="products" element={<SellerProducts />} />
                  <Route path="products/new" element={<AddProduct />} />
                  <Route path="products/:id/edit" element={<EditProduct />} />
                  <Route path="inventory" element={<SellerInventory />} />
                  <Route path="orders" element={<SellerOrders />} />
                  <Route path="notifications" element={<SellerNotifications />} />
                  <Route path="reports" element={<SellerReports />} />
                  <Route path="profile" element={<SellerProfile />} />
                </Route>

                {/* Admin Dashboard Console */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="users" element={<ManageUsers />} />
                  <Route path="sellers" element={<ManageSellers />} />
                  <Route path="approvals" element={<SellerApprovals />} />
                  <Route path="products" element={<ManageAllProducts />} />
                  <Route path="categories" element={<ManageCategories />} />
                  <Route path="orders" element={<ManageAllOrders />} />
                  <Route path="transactions" element={<Transactions />} />
                </Route>

                {/* 404 Fallback */}
                <Route
                  path="*"
                  element={
                    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
                      <span className="text-5xl font-black text-slate-300">404</span>
                      <h2 className="text-xl font-bold text-slate-800 mt-2">Page Not Found</h2>
                      <p className="text-xs text-slate-500 mt-1">The resource you requested does not exist.</p>
                      <Link
                        to="/"
                        className="mt-4 px-4 py-2 bg-navy-900 text-white rounded-lg text-xs font-semibold hover:bg-royal-600 transition-colors"
                      >
                        Return Home
                      </Link>
                    </div>
                  }
                />
              </Routes>
            </SocketProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
