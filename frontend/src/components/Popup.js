import React, { useEffect, useRef, useState } from "react";
import "../styles/popup.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt, faXmark, faListCheck, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Card } from "./Card";

const closeIcon = <FontAwesomeIcon icon={faXmark} />;
const descriptionIcon = <FontAwesomeIcon icon={faFileAlt} />
const subtaskIcon = <FontAwesomeIcon icon={faListCheck} />;
const backIcon = <FontAwesomeIcon icon={faArrowLeft} />

const Popup = ({
    task,
    board_id,
    column_id,
    onClose,
    onSave,
    handleEditTask,
    handleDeleteCard,
    favouriteCard,
    unFavouriteCard,
    taskIndex
}) => {
    const popupRef = useRef(null);

    const [editedText, setEditedText] = useState(task.title);
    const [editedDescription, setEditedDescription] = useState(task.description)

    const handleChange = (event) => {
        setEditedText(event.target.value)
    }

    const handleDescriptionChange = (event) => {
        setEditedDescription(event.target.value);
    };

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [onClose]);

    return (
        <div className="overlay">
            <div className="popup" ref={popupRef}>
                {/* Upper Part */}
                <div className="upper-part">
                    <div className="popup-content">
                        <input
                            type="text"
                            className="board-input"
                            value={editedText}
                            onChange={handleChange}
                        />
                        <span className="close-btn" onClick={onClose}>
                            {task.parent_task_id === null ? closeIcon : backIcon}
                        </span>
                    </div>
                </div>
                <hr className="horizontal-line" />
                {/* Lower Part */}
                <div className="lower-part">
                    <div className="description-header">
                        {descriptionIcon}
                        <h2 className="description-title">Description</h2>
                    </div>
                    <textarea
                        className="description-textarea"
                        value={editedDescription}
                        onChange={handleDescriptionChange}
                    />
                    {task.subtasks && task.subtasks.length > 0 && (
                        <>
                            <div className="subtasks-header">
                                {subtaskIcon}
                                <h2 className="subtasks-title">Subtasks</h2>
                            </div>
                            <div className="subtasks-container">
                                {task.subtasks.map
                                    ((task, index) =>
                                        <Card
                                            key={task.task_id}
                                            id={task.task_id}
                                            isFavourite={task.is_favourite === true}
                                            task={task}
                                            isSubtask={true}
                                            board_id={board_id}
                                            column_id={column_id}
                                            handleEditTask={handleEditTask}
                                            index={taskIndex}
                                            divName={`div${index + 1}`}
                                            deleteCard={(taskId, divName) =>
                                                handleDeleteCard(taskId, index)
                                            }
                                            favouriteCard={(taskId, divName) =>
                                                task.is_favourite === false ? favouriteCard(taskId, index) : unFavouriteCard(taskId, index)
                                            }
                                            favouriteCardForPopup={(taskId, divName) =>
                                                favouriteCard(taskId, index)
                                            }
                                            unFavouriteCardForPopup={(taskId, divName) =>
                                                unFavouriteCard(taskId, index)
                                            }
                                        />
                                    )}
                            </div>
                        </>
                    )}
                    <button
                        className="save-button"
                        onClick={() => onSave(editedText, editedDescription)}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Popup;
