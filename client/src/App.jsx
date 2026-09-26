import { useEffect } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import api from "./config/axios";

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

import Wishlist from "./pages/Wishlist";

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
   OTHER PUBLIC PAGES
========================================== */

import SellerLeads from "./pages/SellerLeads";
import StorePage from "./pages/StorePage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Featured from "./pages/Featured";
import Trending from "./pages/Trending";
import Recommended from "./pages/Recommended";

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

import ContactMessages from "./pages/admin/ContactMessages";

import ViewUser from "./pages/admin/ViewUser";

import SecurityCenter from "./pages/admin/SecurityCenter";

import UserRoles from "./pages/admin/UserRoles";
import RolesPage from "./pages/admin/RolesPage";
import PermissionsPage from "./pages/admin/PermissionsPage";

import AuditLogs from "./pages/admin/AuditLogs";
import LoginHistory from "./pages/admin/LoginHistory";


/* =========================================================
   DYNAMIC FAVICON
   ========================================================= */

function DynamicFavicon() {

    useEffect(() => {

        let cancelled = false;

        const loadFavicon = async () => {

            try {

                console.log(
                    "[FAVICON] Loading marketplace settings..."
                );

                const response = await api.get("/settings/public");

                console.log(
                    "[FAVICON] Settings response:",
                    response.data
                );

                /*
                 * Support several possible response structures.
                 */
                const settings =
                    response.data?.settings ||
                    response.data?.data?.settings ||
                    response.data?.data ||
                    response.data ||
                    {};

                /*
                 * Find favicon URL.
                 */
                const favicon =
                    settings.favicon ||
                    settings.faviconUrl ||
                    settings.branding?.favicon ||
                    settings.branding?.faviconUrl ||
                    "";

                if (!favicon) {

                    console.warn(
                        "[FAVICON] No favicon URL was returned."
                    );

                    return;
                }

                if (cancelled) {
                    return;
                }

                /*
                 * Find existing favicon link.
                 */
                let faviconLink =
                    document.querySelector(
                        'link[rel="icon"]'
                    );

                /*
                 * Create favicon link if it does not exist.
                 */
                if (!faviconLink) {

                    faviconLink =
                        document.createElement("link");

                    faviconLink.rel = "icon";

                    document.head.appendChild(
                        faviconLink
                    );
                }

                /*
                 * Determine favicon MIME type.
                 */
                let mimeType = "image/png";

                const lowerUrl =
                    favicon.toLowerCase();

                if (
                    lowerUrl.includes(".ico")
                ) {
                    mimeType = "image/x-icon";
                }

                if (
                    lowerUrl.includes(".svg")
                ) {
                    mimeType = "image/svg+xml";
                }

                if (
                    lowerUrl.includes(".jpg") ||
                    lowerUrl.includes(".jpeg")
                ) {
                    mimeType = "image/jpeg";
                }

                if (
                    lowerUrl.includes(".webp")
                ) {
                    mimeType = "image/webp";
                }

                if (
                    lowerUrl.includes(".gif")
                ) {
                    mimeType = "image/gif";
                }

                faviconLink.type = mimeType;

                /*
                 * Cache-busting.
                 *
                 * This is important because browsers cache
                 * favicons very aggressively.
                 */
                const separator =
                    favicon.includes("?")
                        ? "&"
                        : "?";

                faviconLink.href =
                    `${favicon}${separator}v=${Date.now()}`;

                /*
                 * Remove old shortcut favicon.
                 */
                const shortcutIcon =
                    document.querySelector(
                        'link[rel="shortcut icon"]'
                    );

                if (shortcutIcon) {
                    shortcutIcon.remove();
                }

                /*
                 * Also remove any duplicate icon links
                 * except the active one.
                 */
                const allIcons =
                    document.querySelectorAll(
                        'link[rel="icon"]'
                    );

                allIcons.forEach((icon) => {

                    if (icon !== faviconLink) {
                        icon.remove();
                    }

                });

                console.log(
                    "[FAVICON] Active favicon:",
                    faviconLink.href
                );

            } catch (error) {

                console.error(
                    "[FAVICON] Failed to load favicon:",
                    error.response?.data ||
                    error.message ||
                    error
                );

            }
        };

        loadFavicon();

        return () => {
            cancelled = true;
        };

    }, []);

    return null;
}


/* =========================================================
   APP
   ========================================================= */

function App() {

    return (

        <>
            {/* ==========================================
                DYNAMIC MARKETPLACE FAVICON
            ========================================== */}

            <DynamicFavicon />


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
                        path="/verify-login-otp"
                        element={<VerifyLoginOTP />}
                    />


                    {/* ==========================================
                        STORE
                    ========================================== */}

                    <Route
                        path="/store/:storeSlug"
                        element={<StorePage />}
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

                    <Route
                        path="/seller/leads"
                        element={<SellerLeads />}
                    />


                    {/* ==========================================
                        PRODUCTS
                    ========================================== */}

                    <Route
                        path="/product/:id"
                        element={<ProductDetails />}
                    />

                    <Route
                        path="/edit-product/:id"
                        element={<EditProduct />}
                    />


                    {/* ==========================================
                        PUBLIC INFORMATION
                    ========================================== */}

                    <Route
                        path="/about"
                        element={<About />}
                    />

                    <Route
                        path="/contact"
                        element={<Contact />}
                    />

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


                    {/* ==========================================
                        PROFILE
                    ========================================== */}

                    <Route
                        path="/profile"
                        element={<Profile />}
                    />

                    <Route
                        path="/wishlist"
                        element={<Wishlist />}
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
                        ADMIN CONTACT MESSAGES
                    ========================================== */}

                    <Route
                        path="/admin/contact-messages"
                        element={<ContactMessages />}
                    />


                    {/* ==========================================
                        ADMIN SECURITY
                    ========================================== */}

                    <Route
                        path="/admin/security"
                        element={<SecurityCenter />}
                    />


                    {/* =================================================
                        ADMIN PANEL
                    ================================================= */}

                    <Route
                        path="/admin"
                        element={<AdminLayout />}
                    >

                        {/* ==========================================
                            DEFAULT ADMIN ROUTE
                        ========================================== */}

                        <Route
                            index
                            element={
                                <Navigate
                                    to="dashboard"
                                    replace
                                />
                            }
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
                            path="users"
                            element={<Users />}
                        />

                        <Route
                            path="users/:id"
                            element={<ViewUser />}
                        />


                        {/* ==========================================
                            USER ROLES
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


                        {/* ==========================================
                            AUDIT / LOGIN HISTORY
                        ========================================== */}

                        <Route
                            path="audit-logs"
                            element={<AuditLogs />}
                        />

                        <Route
                            path="login-history"
                            element={<LoginHistory />}
                        />


                        {/* ==========================================
                            PRODUCTS
                        ========================================== */}

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
                            element={
                                <CreateSubscriptionPlan />
                            }
                        />

                        <Route
                            path="subscriptions/:id/edit"
                            element={
                                <EditSubscription />
                            }
                        />


                        {/* ==========================================
                            HOMEPAGE BUILDER
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
                            ADMIN NOTIFICATIONS
                        ========================================== */}

                        <Route
                            path="notifications"
                            element={<AdminNotifications />}
                        />


                        {/* ==========================================
                            ADMIN SETTINGS
                        ========================================== */}

                        <Route
                            path="settings"
                            element={<Settings />}
                        />

                    </Route>

                </Routes>

            </BrowserRouter>

        </>

    );
}


export default App;