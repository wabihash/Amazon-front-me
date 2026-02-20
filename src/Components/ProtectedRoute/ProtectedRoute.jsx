import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DataContext } from '../../Components/DataProvider/DataProvider'

const ProtectedRoute = ({ children, msg, redirect }) => {
    const navigate = useNavigate();
    const [{user, authLoading},dispatch] = useContext(DataContext);
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { state: { msg, redirect } });
    }
  }, [user, authLoading]);

  if (authLoading) {
    return null; // Or a loader component
  }

  return children;
};

export default ProtectedRoute;