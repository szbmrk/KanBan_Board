import React, { useState, useEffect } from "react";
import "../styles/popup.css";
import "../styles/simpleTextPopup.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const SimpleTextPopup = ({ title, onConfirm, onCancel }) => {
    const [inputValue, setInputValue] = useState("");

    const closeIcon = <FontAwesomeIcon icon={faXmark} />;

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    const handleConfirmClick = () => {
        onConfirm(inputValue);
    };

    const handleCancelClick = () => {
        onCancel();
    };

    const [theme, setTheme] = useState(localStorage.getItem("darkMode"));
    useEffect(() => {
        //ez
        const ResetTheme = () => {
            setTheme(localStorage.getItem("darkMode"))
        }


        console.log("Darkmode: " + localStorage.getItem("darkMode"))
        window.addEventListener('ChangingTheme', ResetTheme)

        return () => {
            window.removeEventListener('ChangingTheme', ResetTheme)
        }
        //eddig
    }, []);
    return (
        <div className="overlay" data-theme={theme}>
            <div className="popup agi-popup">
                <span className="close-btn" onClick={onCancel}>
                    {closeIcon}
                </span>
                <div className="gt-popup-content">
                    <h2>{title}</h2>
                    <div className="input-container">
                        <input
                            className="simple-text-text-input"
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="button-container">
                        <button onClick={handleCancelClick}>Cancel</button>
                        <button onClick={handleConfirmClick}>Confirm</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimpleTextPopup;
