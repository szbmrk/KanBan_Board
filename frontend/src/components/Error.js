import React from "react";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Error({ error, redirect }) {
    const [canBeRedirected, setCanBeRedirected] = useState(false);


    useEffect(() => {
        const onPageLoad = () => {
            setTimeout(() => {
                redirect && setCanBeRedirected(true);
            }, 2000);
        };

        document.readyState === "complete"
            ? onPageLoad()
            : window.addEventListener("load", onPageLoad);
    }, []);

    return (
        <>
            {canBeRedirected ? (
                <Navigate to="/login" />
            ) : (
                <>
                    <div className="content col-10">
                        <h1 style={{ textAlign: "center" }}>
                            {error.error ? error.error : error.message}
                        </h1>
                    </div>
                </>
            )}
        </>
    );
}
