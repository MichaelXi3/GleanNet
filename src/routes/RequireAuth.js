import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "./useAuth";

// Role-based Access Control
export const RequireAuth = ({ allowedRoles }) => {
    // Fetch the two global states
    const { currentUser, isAdmin } = useAuth();
    const location = useLocation();

    // console.log("React Current User: " + currentUser);

    // If no user is logged in, redirect to login
    if (!currentUser) {
        console.log("React: no user logged in");
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If there is a user logged in, check its role
    // Currently, the user can either be Admin or user
    // Possible improvement: multi-roles per user
    const userRole = isAdmin ? 'Admin' : 'User';

    return (
        allowedRoles?.includes(userRole)
            ? <Outlet />
            : <Navigate to="/" state={{ from: location }} replace />
    );
}
