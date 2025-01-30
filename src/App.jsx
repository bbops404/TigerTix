import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp_VerifyEmail from "./pages/Landing/SignUp_EmailVerification";
import Footer from "./components/Footer";
import LandingPage from "./pages/Landing/LandingPage";
import SignUp_UserDetails from "./pages/Landing/SignUp_UserDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/verify" element={<SignUp_VerifyEmail />} />
        <Route path="/SignUp" element={<SignUp_UserDetails />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
