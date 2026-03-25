import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/utils/ScrollToTop";
import Home from "./pages/Home/Home";
import About from "./pages/Home/about";
import Shop from "./pages/Shop/Shop";
import Cart from "./pages/Cart/Cart";
import Login from "./pages/Login/Login";
import Signup from "./pages/Login/Signup";
import Contact from "./pages/Contact/Contact";
import Checkout from "./pages/Checkout/Checkout";
import Blog from "./pages/Blog/Blog";
import Profile from "./pages/Profile/Profile";
import Orders from "./pages/Profile/Orders";
import SavedAddresses from "./pages/Profile/SavedAddresses";
import PaymentMethods from "./pages/Profile/PaymentMethods";
import MushroomMarkers from "./pages/AR/MushroomMarkers";
import ScanProduct from "./pages/AR/ScanProduct";
import ProductDetails from "./pages/Shop/ProductDetails";
import ProductMarkers from "./pages/AR/ProductMarkers";
import ARSpaceProduct from "./pages/AR/ARSpaceProduct";
import ARSpaceMushroom from "./pages/AR/ARSpaceMushroom";

import { UserProvider } from "./context/UserContext";
import { AdminAuthProvider, AdminGuard } from "./context/AdminAuthContext";
import AdminLogin from "./pages/Admin/AdminLogin";
import DashboardHome from "./pages/Admin/DashboardHome";
import OrderRegistry from "./pages/Admin/OrderRegistry";
import ProductCatalog from "./pages/Admin/ProductCatalog";
import AdminSettings from "./pages/Admin/AdminSettings";
import InquiryRegistry from "./pages/Admin/InquiryRegistry";
import ARScanRegistry from "./pages/Admin/ARScanRegistry";
import ARAnalytics from "./pages/Admin/ARAnalytics";
import ARMarkerCatalog from "./pages/Admin/ARMarkerCatalog";

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ScrollToTop />
      <AdminAuthProvider>
        <UserProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/saved-addresses" element={<SavedAddresses />} />
            <Route path="/payment-methods" element={<PaymentMethods />} />
            {/* /scan-mushroom removed */}
            <Route path="/scan-product" element={<ScanProduct />} />
            <Route path="/mushroom-markers" element={<MushroomMarkers />} />
            {/* /product-markers removed */}
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/ar-space/product/:id" element={<ARSpaceProduct />} />
            <Route path="/ar-space/mushroom/:markerKey" element={<ARSpaceMushroom />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminGuard><DashboardHome /></AdminGuard>} />
            <Route path="/admin/orders" element={<AdminGuard><OrderRegistry /></AdminGuard>} />
            <Route path="/admin/catalog" element={<AdminGuard><ProductCatalog /></AdminGuard>} />
            <Route path="/admin/inquiries" element={<AdminGuard><InquiryRegistry /></AdminGuard>} />
            <Route path="/admin/ar-analytics" element={<AdminGuard><ARAnalytics /></AdminGuard>} />
            <Route path="/admin/ar-markers" element={<AdminGuard><ARMarkerCatalog /></AdminGuard>} />
            <Route path="/admin/ar-scans" element={<AdminGuard><ARScanRegistry /></AdminGuard>} />
            <Route path="/admin/settings" element={<AdminGuard><AdminSettings /></AdminGuard>} />
          </Routes>
        </UserProvider>
      </AdminAuthProvider>
    </Router >
  );
}

export default App;
