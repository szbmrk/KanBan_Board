import React, { useState, useRef, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import axios from "../api/axios";
import "../styles/popup.css";
import "../styles/GenerateTaskWithAGIPopup.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";
import ErrorWrapper from "../ErrorWrapper";
import SimpleLabelPopup from "./SimpleLabelPopup";
import SimpleLoaderPopup from "./SimpleLoaderPopup";

const GenerateAttachmentLinkWithAGIPopup = ({
    task,
    attachmentLinks,
    onCancel,
}) => {
    let [editedTask, setEditedTask] = useState(task);
    let [attachments, setAttachments] = useState(
        attachmentLinks ? attachmentLinks : []
    );
    const popupRef = useRef(null);
    const aiOptions = [
        { value: "chatgpt", label: "ChatGPT" },
        { value: "llama", label: "Llama" },
        { value: "bard", label: "Bard" },
    ];
    let [chosenAI, setChosenAI] = useState(aiOptions[0]);
    //const [needLoader, setNeedLoader] = useState(false);
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
    const [showSuccessfulSavePopup, setShowSuccessfulSavePopup] = useState(false);

    const closeIcon = <FontAwesomeIcon icon={faXmark} />;

    const [error, setError] = useState(null);
    const [showAIGeneratingLoaderPopup, setShowAIGeneratingLoaderPopup] =
        useState(false);

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

    const saveToDatabase = async (task, attachments) => {
        try {
            const token = sessionStorage.getItem("token");

            window.log("attachments");
            window.log(attachments);

            const res = await axios.post(
                `/tasks/${task.task_id}/attachments/multiple`,
                {
                    attachments: attachments, // Pass the attachments array directly
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            window.log(res);
            setShowSuccessfulSavePopup(true);
        } catch (e) {
            setError(e?.response?.data);
        }
    };

    const generateAttachment = async (task, ai, counter) => {
        try {
            const token = sessionStorage.getItem("token");
            setShowAIGeneratingLoaderPopup(true);

            window.log("task");
            window.log(task);
            window.log(task.title);
            window.log(counter);
            window.log(ai);
            const res = await axios.get(`/AGI/GenerateAttachmentLink`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    TaskPrompt: `${task.title}`,
                    TaskCounter: `${counter}`,
                    ChosenAI: `${ai}`,
                },
            });

            setShowAIGeneratingLoaderPopup(false);
            window.log(res);
            window.log(res.data);

            setAttachments(res.data);
            //setNeedLoader(false);
        } catch (e) {
            setShowAIGeneratingLoaderPopup(false);
            setError(e?.response?.data);
        }
    };

    const handleDescriptionChange = (event, index) => {
        const updatedAttachments = [...attachments]; // Create a copy of the attachments array
        updatedAttachments[index] = {
            ...updatedAttachments[index], // Copy the attachment object
            description: event.target.value, // Update the description property
        };

        // Update the state with the modified attachments array
        setAttachments(updatedAttachments);
    };

    const handleLinkChange = (event, index) => {
        const updatedAttachments = [...attachments]; // Create a copy of the attachments array
        updatedAttachments[index] = {
            ...updatedAttachments[index], // Copy the attachment object
            link: event.target.value, // Update the description property
        };

        // Update the state with the modified attachments array
        setAttachments(updatedAttachments);
    };

    const handleLoader = (editedTask, chosenAI, taskCounter) => {
        //setNeedLoader(true);
        generateAttachment(editedTask, chosenAI, taskCounter);
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
                <div className="gt-popup-content">
                    <div className="gt-input-container">
                        <p>Generate attachment links for: {editedTask.title}</p>
                        <div className="dropdown-container">
                            <p>Select the number of attachment(s):</p>
                            <Dropdown
                                options={counterOptions}
                                value={taskCounter}
                                onChange={(selectedOption) => setTaskCounter(selectedOption)}
                            />
                        </div>
                        <div className="dropdown-container">
                            <p>Select an AI:</p>
                            <div style={{ overflowY: "auto", height: "100px" }}>
                                <Dropdown
                                    options={aiOptions}
                                    value={chosenAI}
                                    onChange={(selectedOption) => setChosenAI(selectedOption)}
                                />
                            </div>
                        </div>
                        <button
                            className="generate-button"
                            onClick={() =>
                                handleLoader(editedTask, chosenAI.value, taskCounter.value)
                            }
                        >
                            Generate Attachment(s)
                        </button>
                    </div>
                    {attachments.length > 0 && (
                        <div className="gt-input-container">
                            {attachments.map((attachment, index) => (
                                <div key={index} className="gt-attributes-container">
                                    <div className="gt-attributes">
                                        <p className="title">Description:</p>
                                        <textarea
                                            type="text"
                                            value={attachment.description}
                                            onChange={(event) =>
                                                handleDescriptionChange(event, index)
                                            }
                                        />
                                    </div>
                                    <div className="gt-attributes">
                                        <p className="title">Link:</p>
                                        <textarea
                                            type="text"
                                            value={attachment.link}
                                            onChange={(event) => handleLinkChange(event, index)}
                                        />
                                    </div>
                                </div>
                            ))}

                            <div>
                                <button
                                    className="save-button"
                                    onClick={() => saveToDatabase(editedTask, attachments)}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {showSuccessfulSavePopup && (
                <SimpleLabelPopup
                    title={"Successfully saved"}
                    onCancel={() => onCancel()}
                />
            )}
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

export default GenerateAttachmentLinkWithAGIPopup;
