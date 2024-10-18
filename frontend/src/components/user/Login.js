import React, { useContext, useEffect } from "react";
import "../../styles/login-signup.css";
import { Link } from "react-router-dom";
import axios from "../../api/axios";
import AuthContext from "../../auth/AuthContext";
import useAuthForm from "./useAuthForm";
import AuthForm from "./AuthForm";

const Login = () => {
    const authCtx = useContext(AuthContext);

    const {
        error,
        display,
        formData,
        handleChange,
        handleSubmit: handleLoginSubmit,
    } = useAuthForm({ email: "", password: "" }, async (formData) => {
        const response = await axios.post(`/user/login`, formData);
        const data = response.data;
        const token = response.data.token;

        try {
            const response = await axios.get("/user/check-login", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.data.isLoggedIn) {
                authCtx.onLogin(data);
            }
        } catch (error) {
            window.log(error);
        }
    });

    useEffect(() => {
        authCtx.onLogout();
    }, []);

    return (
        <AuthForm
            state="login"
            title="Welcome back"
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleLoginSubmit}
            error={error}
            display={display}
            buttonText="Sign In"
            linkText="Don't have an account?"
            linkTo="/signup"
        />
    );
};

export default Login;
