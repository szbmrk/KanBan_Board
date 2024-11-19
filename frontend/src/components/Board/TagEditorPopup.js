import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const closeIcon = <FontAwesomeIcon icon={faXmark} />;

const TagEditorPopup = ({ onClose, onSave, tagToEdit }) => {
    const [tagName, setTagName] = useState(''); // State for tag name
    const [tagColor, setTagColor] = useState(''); // State for tag color

    const colors = [
        '#bb0000',
        '#008000',
        '#0000bb',
        '#a29f00',
        '#834f23',
        '#bb00bb',
        '#00abab',
        '#bb7d00',
        '#9b9b9b',
        '#313131',
    ];

    useEffect(() => {
        if (tagToEdit) {
            setTagName(tagToEdit.value);
            setTagColor(tagToEdit.color);
        }
    }, [tagToEdit]);

    const handleColorClick = (color) => {
        setTagColor(color);
    };

    const handleSave = () => {
        const idToSet = tagToEdit && tagToEdit.tagId && tagToEdit.tagId > 0 ? tagToEdit.tagId : -1;
        onSave({
            tagId: idToSet,
            name: tagName,
            color: tagColor,
        });
    };

    const handleTagNameChange = (e) => {
        const value = e.target.value;
        if (value.length <= 35) {
            setTagName(value);
        }
    };

    return (
        <div className='overlay darken'>
            <div className='popup popup-mini' >
                <span className='close-btn' onClick={onClose}>
                    {closeIcon}
                </span>
                <div className='tag-editor-content'>
                    <div className='tag-editor-name-container' >
                        <input
                            style={{ backgroundColor: "var(--dark-gray)", color: "var(--light)" }}
                            type='text'
                            value={tagName}
                            onChange={handleTagNameChange}
                            placeholder='Type tag name here...'
                        />
                        <div className='char-counter'>
                            {tagName.length} / 35
                        </div>
                    </div>
                    <div className='color-picker'>
                        <label>Select a Color:</label>
                        <div className='color-squares'>
                            {colors.map((color, index) => (
                                <div
                                    key={index}
                                    className={`color-square ${tagColor === color ? 'selected-tag-background' : ''}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => handleColorClick(color)}
                                />
                            ))}
                        </div>
                    </div>
                    <button className='tag-editor-save-button' onClick={handleSave}>
                        Save Tag
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TagEditorPopup;
