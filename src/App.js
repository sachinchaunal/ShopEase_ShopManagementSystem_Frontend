import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CustomerHome from './pages/customer/CustomerHome';
import ProductList from './pages/customer/ProductList';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import OrderConfirmation from './pages/customer/OrderConfirmation';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminAddProduct from './pages/admin/AdminAddProduct';
import AdminEditProduct from './pages/admin/AdminEditProduct';
import NotFound from './pages/NotFound';
import CustomerName from './pages/customer/CustomerName';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { CustomerProvider } from './context/CustomerContext';
import PrivateRoute from './components/routes/PrivateRoute';
import CustomerRoute from './components/routes/CustomerRoute';
function App() {
  return (
    <AuthProvider>
      <CustomerProvider>
        <CartProvider>
          <div className="d-flex flex-column min-vh-100">
            <Header />
            <main className="flex-grow-1 py-4">
              <div className="container">
                <Routes>
                  {/* Customer Routes */}
                  <Route path="/" element={<CustomerHome />} />
                  <Route path="/products" element={<ProductList />} />
                  <Route path="/customer-name" element={<CustomerName />} />
                  <Route 
                    path="/cart" 
                    element={
                      <CustomerRoute>
                        <Cart />
                      </CustomerRoute>
                    } 
                  />
                  <Route 
                    path="/checkout" 
                    element={
                      <CustomerRoute>
                        <Checkout />
                      </CustomerRoute>
                    } 
                  />
                  <Route 
                    path="/order-confirmation/:orderId" 
                    element={<OrderConfirmation />} 
                  />

                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route 
                    path="/admin/dashboard" 
                    element={
                      <PrivateRoute>
                        <AdminDashboard />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/admin/products" 
                    element={
                      <PrivateRoute>
                        <AdminProducts />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/admin/products/add" 
                    element={
                      <PrivateRoute>
                        <AdminAddProduct />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/admin/products/edit/:id" 
                    element={
                      <PrivateRoute>
                        <AdminEditProduct />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/admin/orders" 
                    element={
                      <PrivateRoute>
                        <AdminOrders />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/admin/orders/:id" 
                    element={
                      <PrivateRoute>
                        <AdminOrderDetail />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/admin/analytics" 
                    element={
                      <PrivateRoute>
                        <AdminAnalytics />
                      </PrivateRoute>
                    } 
                  />

                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </CustomerProvider>
    </AuthProvider>
  );
}

export default App; 
