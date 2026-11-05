import React, { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { Outlet } from 'react-router-dom'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = () => {
    const token = useContext(AuthContext)
    // token valid to be dashbord page if not login user to back login page open 
  return token ? <Outlet/> : <Navigate  to="/login" replace/>;
}

export default ProtectedRoute