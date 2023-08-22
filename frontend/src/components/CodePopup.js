import React, { useState } from "react";
import Dropdown from "react-dropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import axios from "../api/axios";
import "../styles/popup.css";
import "../styles/CodePopup.css";

const CodePopup = ({ board_id, onCancel }) => {
  const codeOptions = [
    { value: "Documentation", label: "Documentation" },
    { value: "Code review", label: "Code review" },
  ];
  const [selectedOption, setSelectedOption] = useState(codeOptions[0]);

  const aiOptions = [
    { value: "chatgpt", label: "ChatGPT" },
    { value: "llama", label: "Llama" },
    { value: "bard", label: "Bard" },
  ];
  let [chosenAI, setChosenAI] = useState(aiOptions[0]);

  const [inputCode, setInputCode] = useState("");
  const [output, setOutput] = useState("");

  const closeIcon = <FontAwesomeIcon icon={faXmark} />;

  const handleRunClick = () => {};

  return (
    <div className="overlay">
      <div className="popup agi-popup">
        <span className="close-btn" onClick={onCancel}>
          {closeIcon}
        </span>
        <div className="gt-popup-content"></div>
        <h2>Coding popup</h2>

        <p>Your code:</p>
        <textarea
          className="code-textarea"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
        />

        <p>Which AI do you want to use?</p>
        <Dropdown
          className="code-dropdown"
          options={aiOptions}
          value={chosenAI}
          onChange={(selectedOption) => setChosenAI(selectedOption)}
        />

        <p>Choose what you would like to do:</p>
        <Dropdown
          className="code-dropdown"
          options={codeOptions}
          value={selectedOption}
          onChange={(option) => setSelectedOption(option.value)}
          placeholder="Select an option"
        />

        <button className="run-button" onClick={handleRunClick}>
          Run
        </button>

        <textarea className="output-textarea" value={output} disabled />
      </div>
    </div>
  );
};

export default CodePopup;
