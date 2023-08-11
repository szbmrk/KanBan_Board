import React, { useEffect, useRef } from "react";
import "../../styles/popup.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const closeIcon = <FontAwesomeIcon icon={faXmark} />;

const ConfirmationPopup = ({ text, onCancel, onConfirm }) => {
    const popupRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                onCancel();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onCancel]);

    return (
        <div className="overlay">
            <div className="popup" ref={popupRef}>
                <span className="close-btn" onClick={onCancel}>
                    {closeIcon}
                </span>
                <p>Are you sure you want to delete "{text}"?</p>
                <div className="button-container">
                    <button onClick={onCancel}>Cancel</button>
                    <button onClick={onConfirm}>Delete</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationPopup;
