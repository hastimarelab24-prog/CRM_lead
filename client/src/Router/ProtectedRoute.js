 import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';
 
 const ProtectedRoute = () => {
    const token = localStorage.getItem("token");
    let user = null;
    try{
        user = JSON.parse(localStorage.getItem("user") || "null");
    }catch{
        user = null;
    }

    if(!token || ! user){
        return <Navigate to="/login" replace/>;
    }
    if(allowedRoles && !allowedRoles.includes(user.role)){
        return <Navigate to="/dashboard" replace/>
    }
    return <Outlet />
 }
 
 export default ProtectedRoute