import React, { useState } from "react";
import AuthContext from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { SetRoles } from "../roles/Roles";

const AuthProvider = (props) => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Function to call when the user logs in
    const loginHandler = (data) => {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('user_id', data.user.user_id);
        sessionStorage.setItem('username', data.user.username);
        sessionStorage.setItem('email', data.user.email);
        SetRoles(data.token);
        setIsLoggedIn(true);
        navigate('/dashboard');
    };

    // Function to call when the user logs out
    const logoutHandler = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user_id');
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('email');
        sessionStorage.removeItem('permissions');
        setIsLoggedIn(false);
        navigate('/login');
    };

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn: isLoggedIn,
                onLogin: loginHandler,
                onLogout: logoutHandler,
            }}
        >
            {props.children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
