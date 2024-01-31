import React, { useState } from "react";
import "../../styles/login-signup.css";
import axios from "../../api/axios";
import { Link, useNavigate } from "react-router-dom";
import useAuthForm from "./useAuthForm";
import AuthForm from "./AuthForm";

const Signup = () => {
    const navigate = useNavigate();

    function EmailValid(email) {
        const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        console.log(email);
        if (re.test(email)) {
            return true;
        }
        return false;
    }

    const {
        error: err,
        display,
        formData,
        handleChange,
        handleSubmit,
        handlePaste: handlePasswordPaste,
    } = useAuthForm(
        { username: '', email: '', password: '', confirmPassword: '', acceptedTerms: false },
        async (formData) => {
            if (!EmailValid(formData.email)) {
                setError('Invalid email');
                console.log('Invalid email');
                return;
            }
            if (formData.password.length < 8) {
                setError('Password must be at least 8 characters long');
                return;
            }
            if (formData.username.length < 3) {
                setError('Username must be at least 3 characters long');
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                {
                    setError('Passwords do not match');
                }
            }
            await axios.post('/user/signup', formData);
            console.log('Signup successful');
            navigate('/login');
        }
    );
    const [error, setError] = useState(err);

    return (
        <AuthForm
            state="signup"
            title="Create an account"
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            handlePaste={handlePasswordPaste}
            error={error}
            display={error ? "block" : "none"}
            buttonText="Sign Up"
            textToTermsAndConditions="By clicking Sign Up, you agree to our Terms, Data Policy and Cookie Policy."
            linkText="Already have an account?"
            linkTo="/login"
        />
    );
};

export default Signup;
