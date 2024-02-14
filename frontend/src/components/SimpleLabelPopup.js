import React from "react";
import "../styles/popup.css";
import "../styles/SimpleLabelPopup.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const SimpleLabelPopup = ({ title, onCancel }) => {
  const closeIcon = <FontAwesomeIcon icon={faXmark} />;

  const handleCancelClick = () => {
    onCancel();
  };
  return (
    <div className="overlay">
      <div className="popup popup-mini">
        <span className="close-btn" onClick={onCancel}>
          {closeIcon}
        </span>
        <div className="gt-popup-content">
          <h3>{title}</h3>
          <div className="button-container">
            <button onClick={handleCancelClick}>Okay</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleLabelPopup;
