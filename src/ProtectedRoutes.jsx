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

    // ✅ If the user's role isn't in the allowed list, restrict access
    if (!allowedRoles.includes(userRole)) {
        console.warn(`Unauthorized access. User role: "${userRole}". Redirecting to admin-dashboard.`);
        return <Navigate to="/admin-dashboard" replace />;
    }

    return <Outlet />; // ✅ If authorized, render the requested page
};

// ✅ Add prop-types validation
ProtectedRoutes.propTypes = {
    role: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
    ]).isRequired,
};

export default ProtectedRoutes;
