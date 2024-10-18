import React, { useState, useEffect } from "react";
import Dropdown from "react-dropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import axios from "../api/axios";
import "../styles/popup.css";
import "../styles/documentPopup.css";
import hljs from "highlight.js";
import ErrorWrapper from "../ErrorWrapper";
import SimpleLoaderPopup from "./SimpleLoaderPopup";

const DocumentationPopup = ({ board_id, task, column, onCancel }) => {
    const aiOptions = [
        { value: "chatgpt", label: "ChatGPT" },
        { value: "llama", label: "Llama" },
        { value: "bard", label: "Bard" },
    ];
    let [chosenAI, setChosenAI] = useState(aiOptions[0].value);

    const [output, setOutput] = useState("");
    const [showAIGeneratingLoaderPopup, setShowAIGeneratingLoaderPopup] =
        useState(false);

    const closeIcon = <FontAwesomeIcon icon={faXmark} />;

    const [error, setError] = useState(null);

    const [theme, setTheme] = useState(localStorage.getItem("darkMode"));
    useEffect(() => {
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

    const handleRunClick = async () => {
        if (task) {
            GenerateTaskDocumentationPerTask();
        } else if (column) {
            GenerateTaskDocumentationPerColumn();
        } else {
            GenerateTaskDocumentationPerBoard();
        }
    };

    const GenerateTaskDocumentationPerTask = async () => {
        try {
            const token = sessionStorage.getItem("token");
            setShowAIGeneratingLoaderPopup(true);

            const res = await axios.get(
                `/AGI/generate-documentation-task/board/${board_id}/task/${task.task_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        ChosenAI: `${chosenAI}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            setShowAIGeneratingLoaderPopup(false);
            window.log(res);
            window.log(res.data.response);
            setOutput(res.data.response);
        } catch (e) {
            setShowAIGeneratingLoaderPopup(false);
            setError(e?.response?.data);
        }
    };

    const GenerateTaskDocumentationPerColumn = async () => {
        try {
            const token = sessionStorage.getItem("token");
            setShowAIGeneratingLoaderPopup(true);

            const res = await axios.get(
                `/AGI/generate-documentation-column/board/${board_id}/column/${column.column_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        ChosenAI: `${chosenAI}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            setShowAIGeneratingLoaderPopup(false);
            window.log(res);
            window.log(res.data.response);
            setOutput(res.data.response);
        } catch (e) {
            setShowAIGeneratingLoaderPopup(false);
            setError(e?.response?.data);
        }
    };

    const GenerateTaskDocumentationPerBoard = async () => {
        try {
            const token = sessionStorage.getItem("token");
            setShowAIGeneratingLoaderPopup(true);

            const res = await axios.get(
                `/AGI/generate-documentation-board/${board_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        ChosenAI: `${chosenAI}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            setShowAIGeneratingLoaderPopup(false);
            window.log(res);
            window.log(res.data.response);
            setOutput(res.data.response);
        } catch (e) {
            setShowAIGeneratingLoaderPopup(false);
            setError(e?.response?.data);
        }
    };

    useEffect(() => {
        hljs.highlightAll();
    });

    return (
        <div className="overlay" data-theme={theme}>
            <div className="popup agi-popup">
                <span className="close-btn" onClick={onCancel}>
                    {closeIcon}
                </span>
                <div className="gt-popup-content">
                    <h2>
                        {"Generate documentation for " +
                            (task
                                ? "task: " + task.title
                                : column
                                    ? "column: " + column.name
                                    : "the board")}
                    </h2>
                    <div className="gt-action-buttons">
                        <div className="dropdown-container">
                            <p>Which AI do you want to use?</p>
                            <Dropdown
                                className="code-dropdown"
                                options={aiOptions}
                                value={chosenAI}
                                onChange={(selectedOption) => setChosenAI(selectedOption.value)}
                            />
                        </div>
                        <button className="generate-button" onClick={handleRunClick}>
                            Run
                        </button>
                    </div>
                    <div>
                        <textarea className="output-textarea" value={output} disabled />
                    </div>
                </div>
            </div>
            {showAIGeneratingLoaderPopup && (
                <SimpleLoaderPopup title={"Generating..."} />
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

export default DocumentationPopup;
