import React, { useEffect, useRef, useState } from 'react';
import '../../styles/popup.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const closeIcon = <FontAwesomeIcon icon={faXmark} />;

const ConfirmationPopup = ({ text, onCancel, onConfirm }) => {
    const popupRef = useRef(null);

    const [theme, setTheme] = useState(localStorage.getItem("darkMode"));

    useEffect(() => {
        //ez
        const ResetTheme = () => {
            setTheme(localStorage.getItem("darkMode"))
        }


        window.log("Darkmode: " + localStorage.getItem("darkMode"))
        window.addEventListener('ChangingTheme', ResetTheme)

        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                onCancel();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('ChangingTheme', ResetTheme)
        };
    }, [onCancel]);

    return (
        <div className='overlay' data-theme={theme}>
            <div className='popup popup-mini' ref={popupRef}>
                <span className='close-btn' onClick={onCancel}>
                    {closeIcon}
                </span>
                <p className='confirmation-text'>Are you sure you want to delete "{text}"?</p>
                <div className='button-container'>
                    <button onClick={onCancel}>Cancel</button>
                    <button onClick={onConfirm}>Delete</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationPopup;
