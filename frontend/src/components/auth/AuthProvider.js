import React, { useEffect, useState } from "react";
import AuthContext from "./AuthContext";
import { useNavigate } from "react-router-dom";

const AuthProvider = (props) => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Function to call when the user logs in
    const loginHandler = (data) => {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('username', data.user.username);
        sessionStorage.setItem('email', data.user.email);
        setIsLoggedIn(true);
        navigate('/dashboard');
    };

    // Function to call when the user logs out
    const logoutHandler = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('email');
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
