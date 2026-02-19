import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DataContext } from '../../Components/DataProvider/DataProvider';

const AdminRoute = ({ children }) => {
    const navigate = useNavigate();
    const [{ user }] = useContext(DataContext);

    useEffect(() => {
        // If user is not logged in, or if they are logged in but NOT an admin
        if (!user) {
            navigate("/auth", { state: { msg: "You must be logged in to access the admin panel", redirect: "/admin" } });
        } else if (user.role !== "admin") {
            navigate("/", { state: { msg: "Access Denied: You do not have administrator privileges" } });
        }
    }, [user, navigate]);

    // Only render children if user is logged in and is an admin
    return user && user.role === "admin" ? children : null;
};

export default AdminRoute;
