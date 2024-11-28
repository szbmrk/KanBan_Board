import React from "react";
import { createPortal } from "react-dom";
import "./styles/errorWrapper.css";

const ErrorWrapper = ({ originalError, onClose }) => {
    const errorText = () => {
        return "error";
    };

    return (
        <>
            {originalError &&
                createPortal(
                    <div className="error-popup">
                        <div className="error-popup-title">{errorText()}</div>
                        <hr className="error-popup-line" />
                        <div className="error-popup-message">
                            {originalError.error
                                ? originalError.error
                                : originalError.message}
                        </div>
                        <button className="error-popup-button" onClick={onClose}>
                            OK
                        </button>
                    </div>,
                    document.body
                )}
        </>
    );
};

export default ErrorWrapper;
