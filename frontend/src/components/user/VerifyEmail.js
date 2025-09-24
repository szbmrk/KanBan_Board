import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import "../../styles/login-signup.css";
import SimpleLoaderPopup from "../SimpleLoaderPopup";

const VerifyEmail = () => {
    const [message, setMessage] = useState("");
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Extract `verification_url` from query parameters
        const params = new URLSearchParams(location.search);
        const verificationUrl = params.get("verification_url");
        setIsLoading(true);
        console.log(verificationUrl)
        if (verificationUrl) {
            // Make a request to the backend to verify the email
            axios
                .post(verificationUrl)
                .then((response) => {
                    setIsLoading(false);
                    console.log(response)
                    setMessage("Email verified successfully! You can now log in.");
                })
                .catch((error) => {
                    setMessage(
                        "Email verification failed. The link may have expired or is invalid."
                    );
                });
        } else {
            setIsLoading(false);
            setMessage("Invalid verification link.");
        }
    }, [location]);

    return (
        <div className="auth-content">
            <div className="auth-container">
                <h2>Email Verification</h2>
                <p>{message}</p>
            </div>
            {isLoading && <SimpleLoaderPopup title={"Loading..."} />}
        </div>
    );
};

export default VerifyEmail;
