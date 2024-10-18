import React, { useEffect, useState } from "react";
import "../styles/loader.css";

const Loader = ({ data_to_load, text_if_cant_load }) => {
    const [loading, setLoading] = useState(true);

    const [theme, setTheme] = useState(localStorage.getItem("darkMode"));

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 2147483647);
    }, [data_to_load]);
    //ez
    const ResetTheme = () => {
        setTheme(localStorage.getItem("darkMode"));
    };

    window.log("Darkmode: " + localStorage.getItem("darkMode"));
    window.addEventListener("ChangingTheme", ResetTheme);
    //eddig
    return loading
        ? Loading_component
        : (Loading_component_with_text({ text: text_if_cant_load }),
            window.removeEventListener("ChangingTheme", ResetTheme));
};

const Loading_component = (
    <div className="loading-container">
        <div className="loader"></div>
    </div>
);

const Loading_component_with_text = ({ text }) => (
    <div className="loading-container">
        <div className="loading-text">{text}</div>
    </div>
);

export default Loader;
