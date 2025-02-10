import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp_VerifyEmail from "./pages/Landing/SignUp_EmailVerification";
import Footer from "./components/Footer";
import LandingPage from "./pages/Landing/LandingPage";
import Event_Ticketed from "./pages/Landing/Event_Ticketed";
import SignUp_UserDetails from "./pages/Landing/SignUp_UserDetails";
import ForgetPassword from "./pages/Landing/ForgetPass_EmailVerification";
import UpdatePassword from "./pages/Landing/ForgetPass_ChangePass";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/verify" element={<SignUp_VerifyEmail />} />
        <Route path="/event-ticketed" element={<Event_Ticketed />} />
        <Route path="/SignUp" element={<SignUp_UserDetails />} />
        <Route path="/ForgetPass_EmailVerification" element={<ForgetPassword />} />
        <Route path="/ForgetPass_ChangePass" element={<UpdatePassword />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
