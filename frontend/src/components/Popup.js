import React, { useEffect, useRef } from "react";
import "../styles/popup.css";

const Popup = ({ text, onClose }) => {
  const popupRef = useRef(null);

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
    <div className="popup-container">
      <div className="popup" ref={popupRef}>
        <span className="close-btn" onClick={onClose}>
          &times;
        </span>
        <div className="popup-content">{text}</div>
      </div>
    </div>
  );
};

export default Popup;
