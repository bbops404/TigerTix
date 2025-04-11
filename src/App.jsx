import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProtectedRoutes from "./ProtectedRoutes"; // Import the protected route
import PublicRoutes from "./PublicRoutes";

const queryClient = new QueryClient();

// ========================== FOOTER PAGES ==========================
import Footer from "./components/Footer";
import PrivacyPolicy from "./pages/FooterPages/PrivacyPolicy";
import TermsOfUse from "./pages/FooterPages/TermsOfUse";
import AboutUs from "./pages/FooterPages/AboutUs";
import ContactUs from "./pages/FooterPages/ContactUs";
import FAQs from "./pages/FooterPages/FAQs";

// ========================== LANDING PAGES ==========================
import SignUpVerifyEmail from "./pages/Landing/SignUp_EmailVerification";
import LoginPopup from "./pages/Landing/LoginPopup";
import LandingPage from "./pages/Landing/LandingPage";
import EventTicketed from "./pages/Landing/Event_Ticketed";
import EventFree_Landing from "./pages/Landing/Event_Free";
import EventComingSoon_Landing from "./pages/Landing/Event_ComingSoon";
import SignUpUserDetails from "./pages/Landing/SignUp_UserDetails";
import ForgetPassword from "./pages/Landing/ForgetPass_EmailVerification";
import UpdatePassword from "./pages/Landing/ForgetPass_ChangePass";

// ========================== ENDUSER PAGES ==========================
import Home from "./pages/EndUser/Home";
import MyReservations from "./pages/EndUser/MyReservations";
import MyProfile from "./pages/EndUser/MyProfile";
import EventTicketedEndUser from "./pages/EndUser/Event_Ticketed_EndUser";
import Reservation from "./pages/EndUser/Reservation";
import EventFree_Enduser from "./pages/EndUser/Event_Free";
import EventComingSoon_Enduser from "./pages/EndUser/Event_ComingSoon";
import ReservationReceipt from "./pages/EndUser/ReservationReceipt";

// ========================== ADMIN PAGES ==========================
import AdminDashboard from "./pages/Admin/Admin_Dashboard";
import EventDetailContainer from "./container/EventDetailContainer";
import AdminReservations from "./pages/Admin/Admin_Reservations";
import AdminUser from "./pages/Admin/Admin_UserPage";
import AdminProfile from "./pages/Admin/Admin_ProfilePage";
import AuditTrails from "./pages/Admin/Admin_AuditTrails";
import AdminEventReports from "./pages/Admin/Admin_EventReports";
import PublishEventContainer from "./container/PublishEventContainer";
import EventsManagementContainer from "./container/EventManagementContainer";

// ========================== SUPPORT STAFF PAGES ==========================
import SupportStaffDashboard from "./pages/SupportStaff/SupportStaff_Dashboard";
import SupportStaffProfile from "./pages/SupportStaff/SupportStaff_ProfilePage";
import SupportStaffReservations from "./pages/SupportStaff/SupportStaff_Reservations";
import SupportStaffEventReports from "./pages/SupportStaff/SupportStaff_EventReports";
import SupportStaffUser from "./pages/SupportStaff/SupportStaff_UserPage";
import SupportStaffEventManagement from "./pages/SupportStaff/SupportStaff_EventsManagement";
import SupportStaffEventDetailContainer from "./container/SupportStaffEventDetailContainer";

// (Add support staff routes here when available)
import AdminPublishEvent from "./pages/Admin/Admin_PublishEvent";
import AdminScheduleEvent from "./pages/Admin/Admin_ScheduleEvent";

const Layout = ({ children }) => {
  const location = useLocation();
  const hideFooterRoutes = [
    "/admin-dashboard",
    "/events",
    "/reservations",
    "/users",
    "/admin-profile",
    "/audit-trails",
    "/event-report",
    "/sign-up",
    "/verify",
    "/forget-password",
    "/change-password",
  ];
  const shouldShowFooter = !hideFooterRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  return (
    <>
      {children}
      {shouldShowFooter && <Footer />}
    </>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* ========================== LANDING PAGES ========================== */}
            <Route element={<PublicRoutes />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/verify" element={<SignUpVerifyEmail />} />
              <Route path="/event-ticketed/:id" element={<EventTicketed />} />
              <Route path="/event-free/:id" element={<EventFree_Landing />} />
              <Route
                path="/event-coming-soon/:id"
                element={<EventComingSoon_Landing />}
              />
              <Route path="/sign-up" element={<SignUpUserDetails />} />
              <Route path="/login" element={<LoginPopup />} />
              <Route path="/forget-password" element={<ForgetPassword />} />
              <Route path="/change-password" element={<UpdatePassword />} />
            </Route>

            {/* ========================== ENDUSER PAGES ========================== */}
            <Route
              element={
                <ProtectedRoutes role={["student", "employee", "alumni"]} />
              }
            >
              <Route path="/home" element={<Home />} />
              <Route
                path="/event-ticketed-enduser/:id"
                element={<EventTicketedEndUser />}
              />
              <Route
                path="/event-free-enduser/:id"
                element={<EventFree_Enduser />}
              />
              <Route
                path="/event-coming-soon-enduser/:id"
                element={<EventComingSoon_Enduser />}
              />
              <Route path="/my-reservations" element={<MyReservations />} />
              <Route path="/my-profile" element={<MyProfile />} />
              <Route path="/reservation" element={<Reservation />} />
              <Route
                path="/reservation-receipt"
                element={<ReservationReceipt />}
              />
            </Route>

            {/* ========================== ADMIN PAGES ========================== */}
            <Route element={<ProtectedRoutes role="admin" />}>
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/events" element={<EventsManagementContainer />} />
              <Route
                path="/events/publish"
                element={<PublishEventContainer />}
              />
              <Route
                path="/events/publish/:id"
                element={<PublishEventContainer />}
              />
              <Route
                path="/events/detail/:id"
                element={<EventDetailContainer />}
              />
              <Route path="/reservations" element={<AdminReservations />} />

              <Route path="/users" element={<AdminUser />} />
              <Route path="/admin-profile" element={<AdminProfile />} />
              <Route path="/audit-trails" element={<AuditTrails />} />
              <Route path="/event-report" element={<AdminEventReports />} />
            </Route>

            {/* ========================== SUPPORT STAFF PAGES ========================== */}
            <Route element={<ProtectedRoutes role="support_staff" />}>
              <Route
                path="/support-staff-dashboard"
                element={<SupportStaffDashboard />}
              />
              <Route
                path="/support-staff-events"
                element={<SupportStaffEventManagement />}
              />
              <Route
                path="/support-staff-events/detail/:id"
                element={<SupportStaffEventDetailContainer />}
              />
              <Route
                path="/support-staff-reservations"
                element={<SupportStaffReservations />}
              />
              <Route
                path="/support-staff-users"
                element={<SupportStaffUser />}
              />
              <Route
                path="/support-staff-profile"
                element={<SupportStaffProfile />}
              />
              <Route
                path="/support-staff-event-report"
                element={<SupportStaffEventReports />}
              />
            </Route>

            {/* ========================== FOOTER PAGES ========================== */}
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-use" element={<TermsOfUse />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/faqs" element={<FAQs />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
