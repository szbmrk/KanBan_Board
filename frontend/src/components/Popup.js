import React, { useEffect, useRef, useState } from 'react';
import '../styles/popup.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faXmark } from '@fortawesome/free-solid-svg-icons';

const closeIcon = <FontAwesomeIcon icon={faXmark} />;
const descriptionIcon = <FontAwesomeIcon icon={faFileAlt} />;

const Popup = ({ text, description, onClose, onSave }) => {
    const popupRef = useRef(null);

    const [editedText, setEditedText] = useState(text);
    const [editedDescription, setEditedDescription] = useState(description);

    const handleChange = (event) => {
        setEditedText(event.target.value);
    };

    const handleDescriptionChange = (event) => {
        setEditedDescription(event.target.value);
    };

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [onClose]);

    return (
        <div className='overlay'>
            <div className='popup' ref={popupRef}>
                {/* Upper Part */}
                <div className='upper-part'>
                    <div className='popup-content'>
                        <input type='text' className='board-input' value={editedText} onChange={handleChange} />
                        <span className='close-btn' onClick={onClose}>
                            {closeIcon}
                        </span>
                    </div>
                </div>
                <hr className='horizontal-line' />
                {/* Lower Part */}
                <div className='lower-part'>
                    <div className='description-header'>
                        {descriptionIcon}
                        <h2 className='description-title'>Description</h2>
                    </div>
                    <textarea
                        className='description-textarea'
                        value={editedDescription}
                        onChange={handleDescriptionChange}
                    />
                    <button className='save-button' onClick={() => onSave(editedText, editedDescription)}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Popup;
