import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import SignUpVerifyEmail from "./pages/Landing/SignUp_EmailVerification";
import Footer from "./components/Footer";
import LandingPage from "./pages/Landing/LandingPage";
import EventTicketed from "./pages/Landing/Event_Ticketed";
import EventFree from "./pages/Landing/Event_Free";
import EventComingSoon from "./pages/Landing/Event_ComingSoon";
import SignUpUserDetails from "./pages/Landing/SignUp_UserDetails";
import ForgetPassword from "./pages/Landing/ForgetPass_EmailVerification";
import UpdatePassword from "./pages/Landing/ForgetPass_ChangePass";
import AdminDashboard from "./pages/Admin/Admin_Dashboard";
import Home from "./pages/EndUser/Home";
import PrivacyPolicy from "./pages/FooterPages/PrivacyPolicy";
import TermsOfUse from "./pages/FooterPages/TermsOfUse";
import AboutUs from "./pages/FooterPages/AboutUs";
import ContactUs from "./pages/FooterPages/ContactUs";
import FAQs from "./pages/FooterPages/FAQs";
import MyReservations from "./pages/EndUser/MyReservations";
import MyProfile from "./pages/EndUser/MyProfile";
import EventTicketedEndUser from "./pages/EndUser/Event_Ticketed_EndUser";
import Reservation from "./pages/EndUser/Reservation";
import EventFree from "./pages/EndUser/Event_Free";
import EventComingSoon from "./pages/EndUser/Event_ComingSoon";

const Layout = ({ children }) => {
  const location = useLocation();
  const hideFooterRoutes = ["/admin-dashboard"];
  const shouldShowFooter = !hideFooterRoutes.includes(location.pathname);

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
          <Route path="/" element={<MyProfile />} />
          <Route path="/verify" element={<SignUpVerifyEmail />} />
          <Route path="/event-ticketed" element={<EventTicketed />} />
          <Route path="/event-ticketed-enduser" element={<EventTicketedEndUser />} />
          <Route path="/event-free" element={<EventFree />} />
          <Route path="/event-coming-soon" element={<EventComingSoon />} />
          <Route path="/sign-up" element={<SignUpUserDetails />} />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route path="/change-password" element={<UpdatePassword />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/home" element={<Home />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-use" element={<TermsOfUse />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/faqs" element={<FAQs />} /> {/* Added FAQs route */}
          <Route path="/my-reservations" element={<MyReservations />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/confirm" element={<Home />} />  {/* Change to ticket details - this is for visualization only */}
          <Route path="/reservation" element={<Reservation />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
