import React from "react";
import "../styles/popup.css";
import "../styles/SimpleLoaderPopup.css";
import Loader from "./Loader";

const SimpleLoaderPopup = ({ title }) => {
  return (
    <div className="overlay">
      <div className="popup popup-mini">
        <div className="gt-popup-content">
          <h3>{title}</h3>
          <div className="loader-container">
            <Loader />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleLoaderPopup;
