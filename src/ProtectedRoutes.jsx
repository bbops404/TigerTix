import PropTypes from "prop-types";
import { Navigate, Outlet } from "react-router-dom";

// ✅ Retrieve the token securely from sessionStorage
const getToken = () => sessionStorage.getItem("authToken");
const getUserRole = () => sessionStorage.getItem("userRole");


const ProtectedRoutes = ({ role }) => {
  const token = getToken();
  const userRole = getUserRole();

  // ✅ If there's no token, redirect to login
  if (!token) {
    console.warn("No token found. Redirecting to login.");
    return <Navigate to="/" replace />;
  }


  // ✅ Ensure `role` is always treated as an array
  const allowedRoles = Array.isArray(role) ? role : [role];

  // ✅ Log the user's role for debugging
  console.warn(`User role: "${userRole}".`);

  // ✅ If the user's role isn't in the allowed list, restrict access
  if (!allowedRoles.includes(userRole)) {
    console.warn(`Unauthorized access. User role: "${userRole}". Redirecting to unauthorized page.`);
    return <Navigate to="/error/403" replace />;
  }

  // ✅ If the user's role is authorized, render the requested page
  console.warn(`User role "${userRole}" authorized. Rendering protected route.`);
  return <Outlet />;
};

// ✅ Add prop-types validation
ProtectedRoutes.propTypes = {
  role: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]).isRequired,
};

export default ProtectedRoutes;
