import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp_VerifyEmail from "./pages/Landing/SignUp_EmailVerification";
import Footer from "./components/Footer";
import LandingPage from "./pages/Landing/LandingPage";
import Event_Ticketed from "./pages/Landing/Event_Ticketed";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/verify" element={<SignUp_VerifyEmail />} />
        <Route path="/event-ticketed" element={<Event_Ticketed />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
