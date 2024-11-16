import React, { useState, useRef, useEffect } from "react";
import "../../styles/popup.css";
import "../../styles/CraftedPromptList.css";
import "react-dropdown/style.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import ConfirmationPopup from "../Board/ConfirmationPopup";
import CraftPromptPopup from "./CraftPromptPopup";
import ErrorWrapper from "../../ErrorWrapper";
import axios from "../../api/axios";
import { faTrash, faPencil } from "@fortawesome/free-solid-svg-icons";

const closeIcon = <FontAwesomeIcon icon={faXmark} />;

const CraftedPromptListPopup = ({ board_id, craftedPrompts, onCancel }) => {

    const [error, setError] = useState(null);

    const [selectedCraftedPrompt, setSelectedCraftedPrompt] = useState(null);
    const [showEditCraftedPrompt, setShowEditCraftedPrompt] = useState(false);
    const [
        showDeleteCraftedPromptConfirmation,
        setShowDeleteCraftedPromptConfirmation,
    ] = useState(false);

    const deleteCraftedPromptClick = (craftedPrompt) => {
        setSelectedCraftedPrompt(craftedPrompt);
        setShowDeleteCraftedPromptConfirmation(true);
    };

    const editCraftedPromptClick = (craftedPrompt) => {
        setSelectedCraftedPrompt(craftedPrompt);
        window.log("craftedPrompt");
        window.log(craftedPrompt);
        setShowEditCraftedPrompt(true);
    };

    const handleEditCraftedPromptCancel = () => {
        setShowEditCraftedPrompt(false);
    };

    const handleDeleteCraftedPromptCancel = () => {
        setShowDeleteCraftedPromptConfirmation(false);
    };

    const handleDeleteCraftedPromptConfirm = async () => {
        handleDeleteCraftedPromptCancel();
        try {
            const token = sessionStorage.getItem("token");
            const res = await axios.delete(
                `/boards/${board_id}/crafted_prompts/${selectedCraftedPrompt.crafted_prompt_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (e) {
            setError(e?.response?.data);
        }
    };

    return (
        <div className="overlay" >
            <div className="popup agi-popup">
                <span className="close-btn" onClick={onCancel}>
                    {closeIcon}
                </span>
                <h2>Crafted prompts:</h2>
                <div className="gt-popup-content">
                    {craftedPrompts.map((craftedPrompt) => (
                        <div
                            key={craftedPrompt.crafted_prompt_id}
                            className={`crafted-prompt`}
                        >
                            <div>
                                <div className="crafted-prompt-header">
                                    <span className="crafted-prompt-type">
                                        {craftedPrompt.crafted_prompt_title}
                                    </span>
                                </div>
                                <p className="crafted-prompt-content">
                                    {craftedPrompt.crafted_prompt_text}
                                </p>
                            </div>
                            <div class="crafted-prompt-action-buttons">
                                <button
                                    className="crafted-prompt-button edit-crafted-prompt-button"
                                    onClick={() => editCraftedPromptClick(craftedPrompt)}
                                >
                                    <FontAwesomeIcon icon={faPencil} style={{ color: "ivory" }} />
                                </button>
                                <button
                                    className="crafted-prompt-button delete-crafted-prompt-button"
                                    onClick={() => deleteCraftedPromptClick(craftedPrompt)}
                                >
                                    <FontAwesomeIcon icon={faTrash} style={{ color: "ivory" }} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {showDeleteCraftedPromptConfirmation && (
                <ConfirmationPopup
                    action="Delete"
                    text={selectedCraftedPrompt?.crafted_prompt_title}
                    onCancel={handleDeleteCraftedPromptCancel}
                    onConfirm={handleDeleteCraftedPromptConfirm}
                />
            )}
            {showEditCraftedPrompt && (
                <CraftPromptPopup
                    craftedPrompt={selectedCraftedPrompt}
                    board_id={board_id}
                    onCancel={handleEditCraftedPromptCancel}
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

export default CraftedPromptListPopup;
