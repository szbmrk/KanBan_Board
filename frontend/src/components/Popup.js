import React, {useEffect, useRef, useState} from "react";
import "../styles/popup.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const closeIcon = <FontAwesomeIcon icon={faXmark} />;

const Popup = ({ text, onClose, onSave }) => {
  const popupRef = useRef(null);

  const [editedText, setEditedText] = useState(text);

  const handleChange = (event) => {
    setEditedText(event.target.value)
  }

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [onClose]);

  return (
    <div className="overlay">
      <div className="popup" ref={popupRef}>
        <span className="close-btn" onClick={onClose}>
          {closeIcon}
        </span>
        <div className="popup-content">
          <input
              type="text"
              className="board-input"
              value={editedText}
              onChange={handleChange}
          />
          <button className="save-button" onClick={() => onSave(editedText)}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
