import React, { useState, useRef, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import axios from "../../api/axios";
import "../../styles/popup.css";
import "../../styles/GenerateTaskWithAGIPopup.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";
import BasicAutocomplete from "../BasicAutocomplete";
import ErrorWrapper from "../../ErrorWrapper";
import SimpleLabelPopup from "../SimpleLabelPopup";

const CraftPromptPopup = ({ craftedPrompt, board_id, onCancel }) => {
    const [error, setError] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem("darkMode"));

    useEffect(() => {
        // This code will run when the component is mounted
        window.log("Component mounted");

        // You can place any initialization logic or side effects here

        // For example, fetching data from an API
        fetchBehaviours();
        //ez
        const ResetTheme = () => {
            setTheme(localStorage.getItem("darkMode"));
        };

        window.log("Darkmode: " + localStorage.getItem("darkMode"));
        window.addEventListener("ChangingTheme", ResetTheme);

        return () => {
            window.removeEventListener("ChangingTheme", ResetTheme);
        };
        //eddig
    }, []);

    const fetchBehaviours = async () => {
        try {
            const token = sessionStorage.getItem("token");

            window.log("selectedOption");
            window.log("board_id");
            window.log(board_id);

            const res = await axios.get(`/boards/${board_id}/Behaviors `, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            window.log(res);
            setBehaviourOptions(formatBehaviourToOptions(res.data));
            window.log(behaviourOptions);
        } catch (e) {
            setError(e?.response?.data);
        }
    };

    const SearchListForValue = (list, searchValue) => {
        return list.find(
            (option) => option.value.toLowerCase() === searchValue.toLowerCase()
        );
    };

    const formatBehaviourToOptions = (behaviours) => {
        return behaviours.map((behaviour) => behaviour.act_as_a);
    };

    const [behaviourOptions, setBehaviourOptions] = useState([]);
    const [promptText, setPromptText] = useState(
        craftedPrompt ? craftedPrompt.crafted_prompt_text : ""
    );
    const [promptTitle, setPromptTitle] = useState(
        craftedPrompt ? craftedPrompt.crafted_prompt_title : ""
    );
    const promptTextRef = useRef(promptText);
    const promptTitleRef = useRef(promptTitle);
    const popupRef = useRef(null);
    const aiOptions = [
        { value: "CHATGPT", label: "ChatGPT" },
    ];
    let [chosenAI, setChosenAI] = useState(
        craftedPrompt
            ? SearchListForValue(aiOptions, craftedPrompt.craft_with)
            : aiOptions[0]
    );
    const actionOptions = [
        { value: "GENERATETASK", label: "Generate Task" },
        { value: "GENERATESUBTASK", label: "Generate Subtask" },
        { value: "GENERATEATTACHMENTLINK", label: "Generate Attachment Link" },
    ];
    let [chosenAction, setChosenAction] = useState(
        craftedPrompt
            ? SearchListForValue(actionOptions, craftedPrompt.action)
            : actionOptions[0]
    );
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
    let [taskCounter, setTaskCounter] = useState(
        craftedPrompt
            ? SearchListForValue(
                counterOptions,
                craftedPrompt.response_counter.toString()
            )
            : counterOptions[0]
    );
    let [chosenBehaviour, setChosenBehaviour] = useState(
        craftedPrompt &&
            craftedPrompt.agiBehaviour &&
            craftedPrompt.agiBehaviour.act_as_a
            ? craftedPrompt.agiBehaviour.act_as_a
            : ""
    );
    const [showSuccessfulSavePopup, setShowSuccessfulSavePopup] = useState(false);

    const closeIcon = <FontAwesomeIcon icon={faXmark} />;

    useEffect(() => {
        promptTextRef.current = promptText;
    }, [promptText]);

    useEffect(() => {
        promptTitleRef.current = promptTitle;
    }, [promptTitle]);

    const handlePromptTitleInputChange = (event) => {
        setPromptTitle(event.target.value);
    };

    const handlePromptTextInputChange = (event) => {
        setPromptText(event.target.value);
    };

    const SavePrompt = async (
        title,
        crafted_prompt_text,
        ai,
        action,
        counter
    ) => {
        window.log("chosenBehaviour");
        window.log(chosenBehaviour);
        try {
            const token = sessionStorage.getItem("token");
            window.log(board_id);
            window.log(title);
            window.log(crafted_prompt_text);
            window.log(ai);
            window.log(action);
            window.log(counter);
            window.log(token);
            let res;
            if (craftedPrompt) {
                res = await axios.put(
                    `/boards/${board_id}/crafted_prompts/${craftedPrompt.crafted_prompt_id}`,
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
            } else {
                res = await axios.post(
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
            }
            if (res) {
                setShowSuccessfulSavePopup(true);
            }

            window.log(res);
            window.log(res.data);
        } catch (e) {
            setError(e?.response?.data);
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
        <div className="overlay" data-theme={theme}>
            <div className="popup agi-popup">
                <span className="close-btn" onClick={onCancel}>
                    {closeIcon}
                </span>
                <h2>Craft prompt popup</h2>
                <div className="gt-popup-content">
                    <div className="gt-input-container">
                        <div className="gt-input-title">
                            <p>Give this prompt a title:</p>
                            <input
                                type="text"
                                placeholder="Enter the title of this prompt"
                                value={promptTitle}
                                onChange={handlePromptTitleInputChange}
                            />
                        </div>
                        <div className="gt-input-prompt">
                            <p>Enter your own prompt:</p>
                            <input
                                type="text"
                                placeholder="Enter your own prompt"
                                value={promptText}
                                onChange={handlePromptTextInputChange}
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
                                <div style={{ overflowY: "auto", height: "100px" }}>
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
                                    selectedValue={chosenBehaviour ? chosenBehaviour : ""}
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
                                        promptTitle,
                                        promptText,
                                        chosenAI.value,
                                        chosenAction.value,
                                        taskCounter.value
                                    )
                                }
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {showSuccessfulSavePopup && (
                <SimpleLabelPopup
                    title={"Successfully saved"}
                    onCancel={() => onCancel()}
                />
            )}
            {error && (
                <ErrorWrapper
                    originalError={error}
                    onClose={() => {
                        setError(null);
                    }}
                />
            )}
        </div>
    );
};

export default CraftPromptPopup;
