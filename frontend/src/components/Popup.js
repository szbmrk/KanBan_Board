import React, { useEffect, useRef } from "react";
import "../styles/popup.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const closeIcon = <FontAwesomeIcon icon={faXmark} />;

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
    <div className="overlay">
      <div className="popup" ref={popupRef}>
        <span className="close-btn" onClick={onClose}>
          {closeIcon}
        </span>
        <div className="popup-content">{text}</div>
      </div>
    </div>
  );
};

export default Popup;
