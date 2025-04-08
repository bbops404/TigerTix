import { Navigate, Outlet } from "react-router-dom";

// ✅ Retrieve the token and role securely from sessionStorage
const getToken = () => sessionStorage.getItem("authToken");
const getRole = () => sessionStorage.getItem("userRole");

const PublicRoutes = () => {
    const token = getToken();
    const role = getRole();

    // ✅ If the user is authenticated, check their role and redirect accordingly
    if (token) {
        if (role === "admin") {
            console.warn("Admin user detected. Redirecting to /admin-dashboard.");
            return <Navigate to="/admin-dashboard" replace />;
        }

        console.warn("Authenticated user detected. Redirecting to /home.");
        return <Navigate to="/home" replace />;
    }

    // ✅ If no token, render the requested public page
    console.warn("No token found. Rendering public route.");
    return <Outlet />;
};

export default PublicRoutes;