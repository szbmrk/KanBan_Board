import React, { useState, useEffect } from "react";
import "../../styles/login-signup.css";
import { Link } from "react-router-dom";
import { useLocation } from 'react-router-dom';

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
    emailError,
}) => {
    const [keyState, setKeyState] = useState(state);
    const [passwordMatchError, setPasswordMatchError] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState("");  
    const [isVibrating, setIsVibrating] = useState(false);
    const location = useLocation();
    const [authContainerVisibility, setAuthContainerVisibility] =
        useState("hidden");


    const handleChangeKeyState = () => {
        setKeyState((prevKeyState) =>
            prevKeyState === "login" ? "signup" : "login"
        );
    };
    
    const handleConfirmPasswordChange = (e) => {
        const { name, value } = e.target;
        handleChange(e); // Így továbbítjuk az adatokat a handleChange függvénynek
        if (name === 'confirmPassword') {
            if (value !== formData.password) {
                setPasswordMatchError(true);
            } else {
                setPasswordMatchError(false);
            }
        }
    };
    
    const handleSignUp = (e) => {
        e.preventDefault();
        if (passwordMatchError || emailError) {
            setIsVibrating(true);
            setTimeout(() => {
                setIsVibrating(false);
            }, 1000); // 1000 ms az effekt időtartama
        } else {
            handleSubmit(e);
        }
    };

    const checkPasswordStrength = (password) => {
        if (password.trim() === "") {
            //ha a jelszó mező üres ne adja ki az erősségeket
            setPasswordStrength("");
            return;
        }
    
        let strength = 0;
    
        // Kisbetűk ellenőrzése
        if (/[a-z]/.test(password)) {
            strength++;
        }
    
        // Nagybetűk ellenőrzése
        if (/[A-Z]/.test(password)) {
            strength++;
        }
    
        // Számok ellenőrzése
        if (/[0-9]/.test(password)) {
            strength++;
        }
    
        // Speciális karakterek ellenőrzése
        if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
            strength++;
        }
    
        if (password.length < 8 || strength < 3) {
            // Jelszó hossza szerinti és karakter típus alapú ellenőrzés
            setPasswordStrength("Weak");
        } else if (password.length >= 10 && strength >= 3) {
            // Ha a jelszó hossza legalább 10 karakter és teljesíti az erősségi feltételeket
            setPasswordStrength("Strong");
        } else {
            // Ha a jelszó hossza legalább 8 karakter és teljesíti az erősségi feltételeket
            setPasswordStrength("Medium");
        }
    };

    const [theme, setTheme] = useState(localStorage.getItem("darkMode"));
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
            setTheme(localStorage.getItem("darkMode"));
        };

        console.log("Darkmode: " + localStorage.getItem("darkMode"));
        window.addEventListener("ChangingTheme", ResetTheme);

        return () => {
            window.removeEventListener("ChangingTheme", ResetTheme);
        };
        //eddig
    }, []);

    return (
        <div className="auth-content">
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
                    {keyState === "signup" ? (
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
                            {formData.email.trim() !== "" && emailError && (
                                <div className="auth-error" style={{ 
                                    textShadow: emailError && isVibrating ? '0 0 10px red' : 'none',
                                    animation: emailError && isVibrating ? 'shake 0.5s linear infinite' : 'none'
                                }}>
                                    {emailError}
                                </div>
                            )}
                        </div>) : (
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                //placeholder="Enter your email or username"
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                    )}
                        {location.pathname === "/login" ? (
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={(e) => {
                                    handleChange(e);
                                }}
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                        ) : (
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={(e) => {
                                        handleChange(e);
                                        checkPasswordStrength(e.target.value);
                                    }}
                                    placeholder="Enter your password"
                                    required
                                />
                                <div className="password-strength-indicator">
                                    {passwordStrength && (
                                        <>
                                            <div className={`password-strength ${passwordStrength.toLowerCase()}`}>
                                                {passwordStrength}
                                            </div>
                                            <div className="password-strength-meter">
                                                <div className={`strength-indicator ${passwordStrength.toLowerCase()}`} style={{ width: `${passwordStrength === "Weak" ? 20 : passwordStrength === "Medium" ? 50 : 100}%` }}></div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                    {keyState === "signup" ? (
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                placeholder="Enter your password again"
                                required
                                onPaste={handlePaste}
                            />
                            {passwordMatchError && (
                                <p className="password-match-error" style={{ 
                                    textShadow: isVibrating ? '0 0 10px red' : 'none',
                                    animation: isVibrating ? 'shake 0.5s linear infinite' : 'none'
                                }}>
                                    Passwords do not match!
                                </p>
                            )}
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
                    {error && !passwordMatchError && !emailError &&(
                        <div className="errorBox" style={{ display }}>
                            <p>{error.error ? error.error : error.message}</p>
                        </div>
                    )}
                    <button className="submit-button" type="submit" onClick={handleSignUp}>
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
