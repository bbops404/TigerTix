import Header from "./components/Header";
import React from "react";
import LoginPopup from "./pages/LoginPopup";

function App() {
  const [loginPopup, setLoginPopup] = React.useState(false);
  const toggleLoginPopup = () => {
    setLoginPopup((prev) => !prev);
  };
  return (
    <div className="App bg-custom_black min-h-screen">
      <Header toggleLoginPopup={toggleLoginPopup} />
      {loginPopup && (
        <LoginPopup
          loginPopup={loginPopup}
          toggleLoginPopup={toggleLoginPopup}
        />
      )}
    </div>
  );
}
export default App;
