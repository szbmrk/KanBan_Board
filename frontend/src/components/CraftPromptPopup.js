import React, { useState, useRef, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import axios from "../api/axios";
import "../styles/popup.css";
import "../styles/GenerateTaskWithAGIPopup.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";
import BasicAutocomplete from "./BasicAutocomplete";
import ErrorWrapper from "../ErrorWrapper";

const CraftPromptPopup = ({ board_id, reloadCraftedPrompts, onCancel }) => {
  const [error, setError] = useState(null);

  useEffect(() => {
    // This code will run when the component is mounted
    console.log("Component mounted");

    // You can place any initialization logic or side effects here

    // For example, fetching data from an API
    fetchBehaviours();
  }, []);

  const fetchBehaviours = async () => {
    try {
      const token = sessionStorage.getItem("token");

      console.log("selectedOption");
      console.log("board_id");
      console.log(board_id);

      const res = await axios.get(`/boards/${board_id}/Behaviors `, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log(res);
      setBehaviourOptions(formatBehaviourToOptions(res.data));
    } catch (e) {
      setError(e.response.data);
    }
  };

  const formatBehaviourToOptions = (behaviours) => {
    return behaviours.map((behaviour) => behaviour.act_as_a);
  };

  const [behaviourOptions, setBehaviourOptions] = useState([]);
  const promptInputRef = useRef(null);
  const titleInputRef = useRef(null);
  const popupRef = useRef(null);
  const aiOptions = [
    { value: "CHATGPT", label: "ChatGPT" },
    { value: "LLAMA", label: "Llama" },
    { value: "BARD", label: "Bard" },
  ];
  let [chosenAI, setChosenAI] = useState(aiOptions[0]);
  const actionOptions = [
    { value: "GENERATETASK", label: "Generate Task" },
    { value: "GENERATESUBTASK", label: "Generate Subtask" },
    { value: "GENERATEATTACHMENTLINK", label: "Generate Attachment Link" },
  ];
  let [chosenAction, setChosenAction] = useState(actionOptions[0]);
  const counterOptions = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: "5" },
    { value: "6", label: "6" },
    { value: "7", label: "7" },
    { value: "8", label: "8" },
    { value: "9", label: "9" },
    { value: "10", label: "10" },
  ];
  let [taskCounter, setTaskCounter] = useState(counterOptions[0]);
  let [chosenBehaviour, setChosenBehaviour] = useState("");

  const closeIcon = <FontAwesomeIcon icon={faXmark} />;

  const SavePrompt = async (
    title,
    crafted_prompt_text,
    ai,
    action,
    counter
  ) => {
    console.log("chosenBehaviour");
    console.log(chosenBehaviour);
    try {
      const token = sessionStorage.getItem("token");
      console.log(board_id);
      console.log(crafted_prompt_text);
      console.log(ai);
      console.log(action);
      console.log(counter);
      console.log(token);
      const res = await axios.post(
        `/boards/${board_id}/AGI/crafted-prompts`,
        {
          crafted_prompt_title: `${title}`,
          crafted_prompt_text: `${crafted_prompt_text}`,
          craft_with: `${ai}`,
          action: `${action}`,
          agi_behavior: `${chosenBehaviour ? chosenBehaviour : null}`,
          response_counter: `${counter}`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res) {
        alert("Crafted prompt saved!");
        reloadCraftedPrompts();
        onCancel();
      }

      console.log(res);
      console.log(res.data);
    } catch (e) {
      setError(e.response.data);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onCancel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onCancel]);

  return (
    <div className="overlay">
      <div className="popup agi-popup">
        <span className="close-btn" onClick={onCancel}>
          {closeIcon}
        </span>
        <h2>Craft Prompt Popup</h2>
        <div className="gt-popup-content">
          <div className="gt-input-container">
            <div className="gt-input-title">
              <p>Give this prompt a title:</p>
              <input
                type="text"
                placeholder="Enter the title of this prompt"
                ref={titleInputRef}
              />
            </div>
            <div className="gt-input-prompt">
              <p>Enter your own prompt:</p>
              <input
                type="text"
                placeholder="Enter your own prompt"
                ref={promptInputRef}
              />
            </div>
            <div className="gt-action-buttons">
              <div className="dropdown-container">
                <p>Choose an action for the prompt:</p>
                <Dropdown
                  options={actionOptions}
                  value={chosenAction}
                  onChange={(selectedOption) => setChosenAction(selectedOption)}
                />
              </div>
              <div className="dropdown-container">
                <p>Choose an AI you want to fulfill your prompt with:</p>
                <div
                  style={{ overflowY: "auto", height: "100px" }}
                >
                  <Dropdown
                    options={aiOptions}
                    value={chosenAI}
                    onChange={(selectedOption) => setChosenAI(selectedOption)}
                  />
                </div>
              </div>
              <div className="dropdown-container">
                <p>AI should act as a...:</p>
                <BasicAutocomplete
                  placeholder={"Type in a behaviour"}
                  setValue={chosenBehaviour}
                  setSelectedValue={setChosenBehaviour}
                  behaviourOptions={behaviourOptions}
                  setBehaviourOptions={setBehaviourOptions}
                />
              </div>
              <div className="dropdown-container">
                <p>Choose the number of element(s):</p>
                <Dropdown
                  options={counterOptions}
                  value={taskCounter}
                  onChange={(selectedOption) => setTaskCounter(selectedOption)}
                />
              </div>
              <button
                className="generate-button"
                onClick={() =>
                  SavePrompt(
                    titleInputRef.current.value,
                    promptInputRef.current.value,
                    chosenAI.value,
                    chosenAction.value,
                    taskCounter.value
                  )
                }
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      </div>
      {error && (
          <ErrorWrapper originalError={error} onClose={() => {setError(null);}}/>
      )}
    </div>
  );
};

export default CraftPromptPopup;
