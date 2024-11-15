import React, { useEffect, useState } from "react";
import "../styles/loader.css";

const Loader = ({ data_to_load, text_if_cant_load }) => {
    const [loading, setLoading] = useState(true);



    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 5000);
    }, [data_to_load]);

    return loading
        ? Loading_component
        : (Loading_component_with_text({ text: text_if_cant_load }));
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
