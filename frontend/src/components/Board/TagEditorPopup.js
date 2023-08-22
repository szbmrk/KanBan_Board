import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const closeIcon = <FontAwesomeIcon icon={faXmark} />;

const TagEditorPopup = ({ onClose, onSave }) => {
    const [tagName, setTagName] = useState(""); // State for tag name
    const [tagColor, setTagColor] = useState(""); // State for tag color

    const colors = [
        "#bb0000", "#00bb00", "#0000bb", "#bbbb00", "#bb00bb",
        "#00bbbb", "#800080", "#bb7d00", "#008000", "#834f23"
    ];

    const handleColorClick = (color) => {
        setTagColor(color);
    };

    const handleSave = () => {
        onSave({
            name: tagName,
            color: tagColor
        });
    };

    return (
        <div>
            <div className='tag-editor-upper-part'>
                <span className='tag-editor-close-btn' onClick={onClose}>
                    {closeIcon}
                </span>
            </div>
            <div>
                <div className="tag-editor-name-container">
                    <label>Tag Name:</label>
                    <input
                        type="text"
                        value={tagName}
                        onChange={(e) => setTagName(e.target.value)}
                    />
                </div>
                <div className='color-picker'>
                    <label>Select a Color:</label>
                    <div className='color-squares'>
                        {colors.map((color, index) => (
                            <div
                                key={index}
                                className={`color-square ${tagColor === color ? "selected" : ""}`}
                                style={{ backgroundColor: color }}
                                onClick={() => handleColorClick(color)}
                            />
                        ))}
                    </div>
                </div>
                <button onClick={handleSave}>Save Tag</button>
            </div>
        </div>
    );
};

export default TagEditorPopup;
