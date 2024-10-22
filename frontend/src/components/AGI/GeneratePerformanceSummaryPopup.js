import React, { useState, useEffect } from "react";
import Dropdown from "react-dropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import axios from "../../api/axios";
import "../../styles/popup.css";
import "../../styles/documentPopup.css";
import hljs from "highlight.js";
import ErrorWrapper from "../../ErrorWrapper";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import SimpleLoaderPopup from "../SimpleLoaderPopup";

const GeneratePerformanceSummaryPopup = ({ board_id, onCancel }) => {
    const currentDate = new Date();
    const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
    );
    const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
    );
    const [startDate, setStartDate] = useState(startOfMonth);
    const [endDate, setEndDate] = useState(
        new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            endOfMonth.getDate(),
            23,
            59,
            59
        )
    );

    const aiOptions = [
        { value: "chatgpt", label: "ChatGPT" },
        { value: "llama", label: "Llama" },
    ];
    let [chosenAI, setChosenAI] = useState(aiOptions[0].value);

    const [output, setOutput] = useState("");

    const closeIcon = <FontAwesomeIcon icon={faXmark} />;

    const [error, setError] = useState(null);
    const [showAIGeneratingLoaderPopup, setShowAIGeneratingLoaderPopup] =
        useState(false);

    const handleRunClick = async () => {
        try {
            const token = sessionStorage.getItem("token");
            setShowAIGeneratingLoaderPopup(true);

            const res = await axios.post(
                `/AGI/generate-performance-summary`,
                {
                    start_date: formatDate(startDate),
                    end_date: formatDate(endDate),
                    board_id: board_id,
                },
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

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };
    const [theme, setTheme] = useState(localStorage.getItem("darkMode"));
    useEffect(() => {
        hljs.highlightAll();
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
    });

    return (
        <div className="overlay" data-theme={theme}>
            <div className="popup agi-popup">
                <span className="close-btn" onClick={onCancel}>
                    {closeIcon}
                </span>
                <div className="gt-popup-content">
                    <h2>Generate performance summary for board</h2>
                    <div className="gt-action-buttons">
                        <div className="dropdown-container">
                            <p>Start date:</p>
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                showTimeSelect
                                dateFormat="yyyy-MM-dd HH:mm:ss"
                                timeFormat="HH:mm:ss"
                            />
                        </div>
                        <div className="dropdown-container">
                            <p>End date:</p>
                            <DatePicker
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                showTimeSelect
                                dateFormat="yyyy-MM-dd HH:mm:ss"
                                timeFormat="HH:mm:ss"
                            />
                        </div>
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

export default GeneratePerformanceSummaryPopup;
