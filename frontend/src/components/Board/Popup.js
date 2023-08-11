import React, { useEffect, useRef, useState } from "react";
import "../../styles/popup.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt, faXmark, faListCheck, faArrowLeft, faPlus } from "@fortawesome/free-solid-svg-icons";
import { Card } from "./Task";
import Subtask from "./Subtask";
import Tag from "../Tag";

const closeIcon = <FontAwesomeIcon icon={faXmark} />;
const descriptionIcon = <FontAwesomeIcon icon={faFileAlt} />
const subtaskIcon = <FontAwesomeIcon icon={faListCheck} />;
const backIcon = <FontAwesomeIcon icon={faArrowLeft} />
const plusIcon = <FontAwesomeIcon icon={faPlus} />

const Popup = ({
    task,
    onClose,
    onSave,
    addSubtask,
    deleteSubtask,
    favouriteSubtask,
    unFavouriteSubtask,
    setTaskAsInspectedTask,
    onPreviousTask,
}) => {
    const popupRef = useRef(null);

    const [editedText, setEditedText] = useState(task.title)
    const [editedDescription, setEditedDescription] = useState(task.description)

    const handleChange = (event) => {
        setEditedText(event.target.value)
    }

    const handleDescriptionChange = (event) => {
        setEditedDescription(event.target.value);
    };

    useEffect(() => {
        setEditedText(task.title)
        setEditedDescription(task.description)
    }, [task])

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
                        {task.parent_task_id === null ? <span className="close-btn" onClick={onClose}>
                            {closeIcon}
                        </span> : <span className="close-btn" onClick={() => onPreviousTask(task.parent_task_id, task.column_id)}>
                            {backIcon}
                        </span>
                        }
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
                    <>
                        <div className="subtasks-header">
                            {subtaskIcon}
                            <h2 className="subtasks-title">Subtasks</h2>
                        </div>
                        <div className="subtasks-container">
                            {task.subtasks && task.subtasks.length > 0 && (
                                task.subtasks.map
                                    ((subTask, index) =>
                                        <Subtask
                                            key={subTask.task_id}
                                            subTask={subTask}
                                            index={index}
                                            favouriteSubtask={() => favouriteSubtask(subTask.task_id, subTask.parent_task_id, subTask.column_id)}
                                            unFavouriteSubtask={() => unFavouriteSubtask(subTask.task_id, subTask.parent_task_id, subTask.column_id)}
                                            deleteSubtask={() => deleteSubtask(subTask.task_id, subTask.parent_task_id, subTask.column_id)}
                                            setTaskAsInspectedTask={() => setTaskAsInspectedTask(subTask)}
                                        />
                                    )

                            )}
                            <div className="addbtn-subtask" onClick={() => addSubtask(task.task_id, task.column_id)}>
                                {plusIcon}
                                Add subtask
                            </div>
                        </div>
                    </>
                    <button
                        className="save-button"
                        onClick={() => onSave(task.task_id, task.parent_task_id, task.column_id, editedText, editedDescription)}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Popup;
