import React, { useEffect, useRef, useState } from 'react';
import '../../styles/popup.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const closeIcon = <FontAwesomeIcon icon={faXmark} />;

const ConfirmationPopup = ({ text, onCancel, onConfirm, action }) => {
    const popupRef = useRef(null);



    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                onCancel();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onCancel]);

    return (
        <div className='overlay' >
            <div className='popup popup-mini' ref={popupRef}>
                <span className='close-btn' onClick={onCancel}>
                    {closeIcon}
                </span>
                <p className='confirmation-text'>Are you sure you want to {`${action !== undefined ? action.toLowerCase() : ""}`} "{text}"?</p>
                <div className='button-container'>
                    <button onClick={onCancel}>Cancel</button>
                    <button onClick={onConfirm}>{action}</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationPopup;
