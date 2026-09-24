import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* ==========================================
   PUBLIC PAGES
========================================== */

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import ForgotPassword from "./pages/ForgotPassword";
import VerifyReset from "./pages/VerifyReset";
import ResetPassword from "./pages/ResetPassword";
import VerifyLoginOTP from "./pages/VerifyLoginOTP";
/* ==========================================
   SELLER
========================================== */

import SellerDashboard from "./pages/SellerDashboard";
import Sell from "./pages/Sell";
import SellerProfile from "./pages/SellerProfile";

/* ==========================================
   PRODUCTS
========================================== */

import ProductDetails from "./pages/ProductDetails";
import EditProduct from "./pages/EditProduct";

/* ==========================================
   USER
========================================== */

import Profile from "./pages/Profile";
import Inbox from "./pages/Inbox";
import Chat from "./pages/Chat";
import Notifications from "./pages/Notifications";

import Promotions from "./pages/Promotions";
import PromotionSuccess from "./pages/PromotionSuccess";

import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";

/* ==========================================
   SUPPORT
========================================== */

import Support from "./pages/Support";
import MyTickets from "./pages/MyTickets";
import TicketDetails from "./pages/TicketDetails";

/* ==========================================
   ADMIN LAYOUT
========================================== */

import AdminLayout from "./layouts/AdminLayout";

/* ==========================================
   ADMIN PAGES
========================================== */

import DashboardHome from "./pages/admin/DashboardHome";
import Users from "./pages/admin/Users";

import Products from "./pages/admin/Products";
import Stores from "./pages/admin/Stores";

import AdminStoreDetails from "./pages/admin/AdminStoreDetails";
import AdminReviewProduct from "./pages/AdminReviewProduct";

import SubscriptionPlans from "./pages/admin/SubscriptionPlans";
import CreateSubscriptionPlan from "./pages/admin/CreateSubscriptionPlan";
import EditSubscription from "./pages/admin/EditSubscription";

import HomepageBuilder from "./pages/admin/HomepageBuilder";

import Advertisements from "./pages/admin/Advertisements";

import Payments from "./pages/admin/Payments";
import PaymentDetails from "./pages/admin/PaymentDetails";

import Reports from "./pages/admin/Reports";

import Settings from "./pages/admin/Settings/Settings";

import AdminNotifications from "./pages/admin/AdminNotifications";

import SupportTickets from "./pages/admin/SupportTickets";

import TicketSupport from "./pages/admin/TicketSupport";
import Wishlist from "./pages/Wishlist";

import SellerLeads from "./pages/SellerLeads";
import StorePage from "./pages/StorePage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Featured from "./pages/Featured";
import Trending from "./pages/Trending";
import Recommended from "./pages/Recommended";
import ContactMessages from "./pages/admin/ContactMessages";
import ViewUser from "./pages/admin/ViewUser";
import SecurityCenter from "./pages/admin/SecurityCenter";
import UserRoles from "./pages/admin/UserRoles";
import RolesPage from "./pages/admin/RolesPage";
import PermissionsPage from "./pages/admin/PermissionsPage";
import AuditLogs from "./pages/admin/AuditLogs";
import LoginHistory from "./pages/admin/LoginHistory";




function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* ==========================================
                    PUBLIC PAGES
                ========================================== */}

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                {/* ==========================================
                    PASSWORD RESET
                ========================================== */}

                <Route
                    path="/forgot-password"
                    element={<ForgotPassword />}
                />

                <Route
                    path="/verify-reset"
                    element={<VerifyReset />}
                />

                <Route
                    path="/reset-password"
                    element={<ResetPassword />}
                />
<Route
    path="/store/:storeSlug"
    element={<StorePage />}
/>

<Route
    path="/verify-login-otp"
    element={<VerifyLoginOTP />}
/>
                {/* ==========================================
                    SELLER
                ========================================== */}

                <Route
                    path="/dashboard"
                    element={<SellerDashboard />}
                />

                <Route
                    path="/sell"
                    element={<Sell />}
                />

                <Route
                    path="/seller/:id"
                    element={<SellerProfile />}
                />

                {/* ==========================================
                    PRODUCTS
                 ========================================== */}

                 <Route path="/store/:storeSlug" element={<StorePage />} />
<Route
    path="/seller/leads"
    element={<SellerLeads />}
/>
<Route path="/about" element={<About />} />
<Route path="/contact" element={<Contact />} />
<Route
    path="/privacy-policy"
    element={<PrivacyPolicy />}
/>
<Route

    path="/featured"

    element={<Featured />}

/>
<Route

    path="/trending"

    element={<Trending />}

/>
<Route

    path="/recommended"

    element={<Recommended />}

/>
<Route

    path="/admin/contact-messages"

    element={<ContactMessages />}

/>
<Route
    path="/admin/security"
    element={<SecurityCenter />}
/>






                <Route
                    path="/product/:id"
                    element={<ProductDetails />}
                />

                <Route
                    path="/edit-product/:id"
                    element={<EditProduct />}
                />

                {/* ==========================================
                    PROFILE
                ========================================== */}

                <Route
                    path="/profile"
                    element={<Profile />}
                />

                {/* ==========================================
                    CHAT
                ========================================== */}

                <Route
                    path="/inbox"
                    element={<Inbox />}
                />

                <Route
                    path="/chat/:conversationId"
                    element={<Chat />}
                />

                {/* ==========================================
                    NOTIFICATIONS
                ========================================== */}

                <Route
                    path="/notifications"
                    element={<Notifications />}
                />

                {/* ==========================================
                    SUPPORT
                ========================================== */}

                <Route
                    path="/support"
                    element={<Support />}
                />

                <Route
                    path="/my-tickets"
                    element={<MyTickets />}
                />

                <Route
                    path="/my-tickets/:id"
                    element={<TicketDetails />}
                />

                {/* ==========================================
                    PROMOTIONS
                ========================================== */}

                <Route
                    path="/promotions"
                    element={<Promotions />}
                />

                <Route
                    path="/promotion-success"
                    element={<PromotionSuccess />}
                />

                {/* ==========================================
                    PAYMENTS
                ========================================== */}

                <Route
                    path="/payment-success"
                    element={<PaymentSuccess />}
                />

                <Route
                    path="/payment-failed"
                    element={<PaymentFailed />}
                />

                {/* ==========================================
                    ADMIN PANEL
                ========================================== */}
<Route

    path="/wishlist"

    element={<Wishlist />}

/>

                <Route
                    path="/admin"
                    element={<AdminLayout />}
                >

                    
                                    <Route
                        index
                        element={<Navigate to="dashboard" replace />}
                    />

                    {/* ==========================================
                        DASHBOARD
                    ========================================== */}



                    <Route
                        path="dashboard"
                        element={<DashboardHome />}
                    />

                    {/* ==========================================
                        USERS
                    ========================================== */}
<Route
    path="roles"
    element={<RolesPage />}
/>
<Route
    path="permissions"
    element={<PermissionsPage />}
/>
<Route
    path="user-roles"
    element={<UserRoles />}
/>
<Route
    path="audit-logs"
    element={<AuditLogs />}
/>

<Route
    path="users/:id"
    element={<ViewUser />}
/>

 <Route
        path="login-history"
        element={<LoginHistory />}
    />


                    {/* ==========================================
                        PRODUCTS
                    ========================================== */}
<Route
    path="users"
    element={<Users />}
/>
                    <Route
                        path="products"
                        element={<Products />}
                    />

                    <Route
                        path="product/:id"
                        element={<AdminReviewProduct />}
                    />

                    {/* ==========================================
                        STORES
                    ========================================== */}

                    <Route
                        path="stores"
                        element={<Stores />}
                    />

                    <Route
                        path="store/:id"
                        element={<AdminStoreDetails />}
                    />

                    {/* ==========================================
                        SUBSCRIPTIONS
                    ========================================== */}

                    <Route
                        path="subscriptions"
                        element={<SubscriptionPlans />}
                    />

                    <Route
                        path="subscriptions/new"
                        element={<CreateSubscriptionPlan />}
                    />

                    <Route
                        path="subscriptions/:id/edit"
                        element={<EditSubscription />}
                    />

                    {/* ==========================================
                        HOMEPAGE
                    ========================================== */}

                    <Route
                        path="homepage"
                        element={<HomepageBuilder />}
                    />

                    {/* ==========================================
                        ADVERTISEMENTS
                    ========================================== */}

                    <Route
                        path="advertisements"
                        element={<Advertisements />}
                    />

                    {/* ==========================================
                        PAYMENTS
                    ========================================== */}

                    <Route
                        path="payments"
                        element={<Payments />}
                    />

                    <Route
                        path="payments/:id"
                        element={<PaymentDetails />}
                    />

                    {/* ==========================================
                        REPORTS
                    ========================================== */}

                    <Route
                        path="reports"
                        element={<Reports />}
                    />

                    {/* ==========================================
                        SUPPORT
                    ========================================== */}

                    <Route
                        path="support"
                        element={<SupportTickets />}
                    />
                         <Route
    path="support/:id"
    element={<TicketSupport />}
/>

                    {/* ==========================================
                        NOTIFICATIONS
                    ========================================== */}

                    <Route
                        path="notifications"
                        element={<AdminNotifications />}
                    />

                    {/* ==========================================
                        SETTINGS
                    ========================================== */}

                    <Route
                        path="settings"
                        element={<Settings />}
                    />

                </Route>

            </Routes>

        </BrowserRouter>

    );

}

export default App;