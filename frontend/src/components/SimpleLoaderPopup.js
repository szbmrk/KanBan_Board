import React from "react";
import "../styles/popup.css";
import "../styles/SimpleLoaderPopup.css";
import Loader from "./Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const SimpleLoaderPopup = ({ title, backgroundButtonClick, onCancel }) => {
  const closeIcon = <FontAwesomeIcon icon={faXmark} />;

  return (
    <div className="overlay">
      <div className="popup popup-mini">
        {onCancel && (
          <span className="close-btn" onClick={onCancel}>
            {closeIcon}
          </span>
        )}
        <div className="gt-popup-content">
          <h3>{title}</h3>
          <div className="loader-container">
            <Loader />
          </div>
          <div className="button-container">
            {backgroundButtonClick && (
              <button onClick={backgroundButtonClick}>
                Do it in the background
              </button>
            )}
            {onCancel && <button onClick={onCancel}>Cancel</button>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleLoaderPopup;
