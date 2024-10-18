import React, { useState } from "react";
import "../../styles/login-signup.css";
import axios from "../../api/axios";
import { Link, useNavigate } from "react-router-dom";
import useAuthForm from "./useAuthForm";
import AuthForm from "./AuthForm";

const Signup = () => {
    const navigate = useNavigate();

    /* Test */

    //useAuthForm.js-be helyeztem át a validitást a valós időben történő visszajelzés miatt

    /*function EmailValid(email) {
      const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      window.log(email);
      if (re.test(email)) {
        return true;
      }
      return false;
    }*/

    const {
        error: err,
        display,
        formData,
        handleChange,
        handleSubmit,
        handlePaste: handlePasswordPaste,
        emailError,
        usernameError,
    } = useAuthForm(
        {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            acceptedTerms: false,
        },
        async (formData) => {
            /*if (!EmailValid(formData.email)) {
              setError({ message: "Invalid email" });
              window.log("Invalid email");
              return;
            }*/
            if (formData.password.length < 8) {
                setError({ message: "Password must be at least 8 characters long" });
                return;
            }
            if (formData.username.length < 3) {
                setError({ message: "Username must be at least 3 characters long" });
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setError({ message: "Passwords do not match" });
                return;
            }
            try {
                const response = await axios.post("/user/signup", formData);
                navigate("/login");
            } catch (err) {
                setError(err?.response?.data);
            }
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
            emailError={emailError}
            usernameError={usernameError}
            textToTermsAndConditions="By clicking Sign Up, you agree to our Terms, Data Policy and Cookie Policy."
            linkText="Already have an account?"
            linkTo="/login"
        />
    );
};

export default Signup;
