import React, { useState, useEffect } from "react";
import "../../styles/login-signup.css";
import { Link } from "react-router-dom";

const AuthForm = ({
    state,
    title,
    formData,
    handleChange,
    handleSubmit,
    handlePaste,
    error,
    display,
    buttonText,
    linkText,
    linkTo,
    textToTermsAndConditions,
}) => {
    const [keyState, setKeyState] = useState(state);
    const [authContainerVisibility, setAuthContainerVisibility] =
        useState("hidden");

    const handleChangeKeyState = () => {
        setKeyState((prevKeyState) =>
            prevKeyState === "login" ? "signup" : "login"
        );
    };
    const [theme, setTheme] = useState(sessionStorage.getItem("darkMode"));
    useEffect(() => {
        const onPageLoad = () => {
            setTimeout(() => {
                setAuthContainerVisibility("visible");
            }, 500);
        };
        document.readyState === "complete"
            ? onPageLoad()
            : window.addEventListener("load", onPageLoad);

        //ez
        const ResetTheme = () => {
            setTheme(sessionStorage.getItem("darkMode"))
        }


        console.log("Darkmode: " + sessionStorage.getItem("darkMode"))
        window.addEventListener('ChangingTheme', ResetTheme)

        return () => {
            window.removeEventListener('ChangingTheme', ResetTheme)
        }
        //eddig
    }, []);

    return (
        <div className="auth-content" data-theme={theme}>
            <div
                className="auth-container"
                style={{
                    transition: "visibility 0.5s ease",
                    visibility: authContainerVisibility,
                }}
            >
                <h2>{title}</h2>
                <form className="auth-form" onSubmit={handleSubmit}>
                    {keyState === "signup" ? (
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                    ) : null}
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    {keyState === "signup" ? (
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Enter your password again"
                                required
                                onPaste={handlePaste}
                            />
                        </div>
                    ) : null}
                    {keyState === "signup" ? (
                        <div className="form-group" style={{ flexDirection: "row" }}>
                            <label htmlFor="checkbox"></label>
                            <input
                                type="checkbox"
                                name="acceptedTerms"
                                checked={formData.acceptedTerms}
                                onChange={handleChange}
                                required
                            />
                            {textToTermsAndConditions}
                        </div>
                    ) : null}
                    <div className="errorBox" style={{ display }}>
                        <p>{error}</p>
                    </div>
                    <button className="submit-button" type="submit">
                        {buttonText}
                    </button>
                    <Link to={linkTo} onClick={handleChangeKeyState}>
                        {linkText}
                    </Link>
                </form>
            </div>
        </div>
    );
};

export default AuthForm;
