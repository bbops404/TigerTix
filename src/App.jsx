import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// ========================== FOOTER PAGES ==========================
import Footer from "./components/Footer";
import PrivacyPolicy from "./pages/FooterPages/PrivacyPolicy";
import TermsOfUse from "./pages/FooterPages/TermsOfUse";
import AboutUs from "./pages/FooterPages/AboutUs";
import ContactUs from "./pages/FooterPages/ContactUs";
import FAQs from "./pages/FooterPages/FAQs";

// ========================== LANDING PAGES ==========================
import SignUpVerifyEmail from "./pages/Landing/SignUp_EmailVerification";
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

// ========================== ADMIN PAGES ==========================
import AdminDashboard from "./pages/Admin/Admin_Dashboard";

// ========================== SUPPORT STAFF PAGES ==========================
// (Add support staff routes here when available)

const Layout = ({ children }) => {
  const location = useLocation();
  const hideFooterRoutes = ["/dashboard"];
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
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* ========================== LANDING PAGES ========================== */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/verify" element={<SignUpVerifyEmail />} />
          <Route path="/event-ticketed" element={<EventTicketed />} />
          <Route path="/event-free-landing" element={<EventFree_Landing />} />
          <Route
            path="/event-coming-soon"
            element={<EventComingSoon_Landing />}
          />
          <Route path="/sign-up" element={<SignUpUserDetails />} />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route path="/change-password" element={<UpdatePassword />} />

          {/* ========================== ENDUSER PAGES ========================== */}
          <Route path="/home" element={<Home />} />
          <Route
            path="/event-ticketed-enduser"
            element={<EventTicketedEndUser />}
          />
          <Route path="/event-free-enduser" element={<EventFree_Enduser />} />
          <Route
            path="/event-coming-soon-enduser"
            element={<EventComingSoon_Enduser />}
          />
          <Route path="/my-reservations" element={<MyReservations />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/confirm" element={<Home />} />
          <Route path="/reservation" element={<Reservation />} />

          {/* ========================== ADMIN PAGES ========================== */}
          <Route path="/dashboard" element={<AdminDashboard />} />

          {/* ========================== FOOTER PAGES ========================== */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-use" element={<TermsOfUse />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/faqs" element={<FAQs />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
