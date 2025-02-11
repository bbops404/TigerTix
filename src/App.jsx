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
          <Route path="/" element={<LandingPage />} />
          <Route path="/verify" element={<SignUpVerifyEmail />} />
          <Route path="/event-ticketed" element={<EventTicketed />} />
          <Route path="/event-free" element={<EventFree />} />
          <Route path="/event-coming-soon" element={<EventComingSoon />} />
          <Route path="/sign-up" element={<SignUpUserDetails />} />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route path="/change-password" element={<UpdatePassword />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
