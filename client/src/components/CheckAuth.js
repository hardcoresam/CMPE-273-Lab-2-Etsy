import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isLoggedIn } from './util';

export default function CheckAuth(props) {
    return isLoggedIn() ? <Outlet /> : <Navigate to="/home" />
}