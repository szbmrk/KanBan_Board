import React, { useState } from "react";
import "../styles/popup.css";
import "../styles/AddColumnPopup.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const AddColumnPopup = ({ onConfirm, onCancel }) => {
  const [columnName, setColumnName] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isFinished, setIsFinished] = useState(false);

  const closeIcon = <FontAwesomeIcon icon={faXmark} />;

  const handleInputChange = (event) => {
    setColumnName(event.target.value);
  };

  const handleInputValueChange = (event) => {
    // Allow only numeric values in the input
    const numericValue = event.target.value.replace(/\D/g, "");
    setInputValue(numericValue);
  };

  const handleDoneCheckboxChange = () => {
    setIsFinished(!isFinished);
  };

  const handleConfirmClick = () => {
    const data = {
      columnName,
      taskLimit: inputValue !== "" ? parseInt(inputValue, 10) : 0,
      isFinished,
    };
    onConfirm(data);
  };

  const handleCancelClick = () => {
    onCancel();
  };

  return (
    <div className="overlay">
      <div className="popup agi-popup">
        <span className="close-btn" onClick={onCancel}>
          {closeIcon}
        </span>
        <div className="gt-popup-content">
          <h2>Create column:</h2>
          <label className="add-column-label">
            Column Name:
            <input
              className="add-column-text-input"
              type="text"
              placeholder="Enter column name..."
              value={columnName}
              onChange={handleInputChange}
            />
          </label>
          <label className="add-column-label">
            Task Limit:
            <input
              className="add-column-text-input"
              type="text"
              placeholder="Enter task limit..."
              value={inputValue}
              onChange={handleInputValueChange}
            />
          </label>
          <label className="add-column-label">
            <input
              className="add-column-checkbox"
              type="checkbox"
              checked={isFinished}
              onChange={handleDoneCheckboxChange}
            />
            Done
          </label>
          <div className="button-container">
            <button onClick={handleCancelClick}>Cancel</button>
            <button onClick={handleConfirmClick}>Confirm</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddColumnPopup;
