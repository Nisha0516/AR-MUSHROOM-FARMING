import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import About from "./pages/Home/about";
import Shop from "./pages/Shop/Shop";
import Cart from "./pages/Cart/Cart";
import Login from "./pages/Login/Login";
import Signup from "./pages/Login/Signup";
import Contact from "./pages/Contact/Contact";
import Checkout from "./pages/Checkout/Checkout";
import Blog from "./pages/Blog/Blog";
import Consultancy from "./pages/Consultancy/Consultancy";

import { AdminAuthProvider, AdminGuard } from "./context/AdminAuthContext";
import AdminLogin from "./pages/Admin/AdminLogin";
import DashboardHome from "./pages/Admin/DashboardHome";
import OrderRegistry from "./pages/Admin/OrderRegistry";
import ProductCatalog from "./pages/Admin/ProductCatalog";
import AdminSettings from "./pages/Admin/AdminSettings";

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AdminAuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/consultancy" element={<Consultancy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/blog" element={<Blog />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminGuard><DashboardHome /></AdminGuard>} />
          <Route path="/admin/orders" element={<AdminGuard><OrderRegistry /></AdminGuard>} />
          <Route path="/admin/catalog" element={<AdminGuard><ProductCatalog /></AdminGuard>} />
          <Route path="/admin/settings" element={<AdminGuard><AdminSettings /></AdminGuard>} />
        </Routes>
      </AdminAuthProvider>
    </Router >
  );
}

export default App;
