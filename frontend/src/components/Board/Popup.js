import React, { useEffect, useRef, useState } from 'react';
import '../../styles/popup.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faXmark,
    faArrowLeft,
    faPlus,
    faTags,
    faLink,
    faStopwatch,
    faFileLines,
    faFireFlameCurved,
    faListCheck,
} from '@fortawesome/free-solid-svg-icons';
import axios from "../../api/axios";
import Subtask from './Subtask';
import TagDropdown from "../TagDropdown";
import Comment from './Comment';
import DatePicker from "react-datepicker";

const closeIcon = <FontAwesomeIcon icon={faXmark} />;
const subtaskIcon = <FontAwesomeIcon icon={faListCheck} />;
const backIcon = <FontAwesomeIcon icon={faArrowLeft} />;
const plusIcon = <FontAwesomeIcon icon={faPlus} />;
const tagsIcon = <FontAwesomeIcon icon={faTags} />;
const linkIcon = <FontAwesomeIcon icon={faLink} />;
const stopwatchIcon = <FontAwesomeIcon icon={faStopwatch} />;
const fileIcon = <FontAwesomeIcon icon={faFileLines} />;
const priorityIcon = <FontAwesomeIcon icon={faFireFlameCurved} />;


const Popup = ({
    task,
    onClose,
    onSave,
    addSubtask,
    deleteSubtask,
    favouriteSubtask,
    unFavouriteSubtask,
    setTaskAsInspectedTask,
    handlePostComment,
    onPreviousTask,
    priorities,
    modifyPriority,
    modifyDeadline,
    addDeadline,
    tags
}) => {
    const popupRef = useRef(null);

    const [editedText, setEditedText] = useState(task.title);
    const [editedDescription, setEditedDescription] = useState(task.description);
    const [showAddToCard, setShowAddToCard] = useState(false);
    const [addToCardIconZIndex, setAddToCardIconZIndex] = useState(1);
    const [addToCardContainerPosition, setAddToCardContainerPosition] = useState({ x: 0, y: 0 });
    const [boardTags, setBoardTags] = useState([]);

    const handleChange = (event) => {
        setEditedText(event.target.value);
    };

    const handleDescriptionChange = (event) => {
        setEditedDescription(event.target.value);
    };

    useEffect(() => {
        setEditedText(task.title);
        setEditedDescription(task.description);
        handleGetBoardTags();
    }, [task]);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [onClose]);

    const handleAddToCard = (event) => {
        const buttonRect = event.target.getBoundingClientRect();
        const newX = buttonRect.right + 10;
        const newY = buttonRect.top - 300;

        // Set the icon-container's position and show it
        setAddToCardContainerPosition({ x: newX, y: newY });

        setShowAddToCard(!showAddToCard);
        setAddToCardIconZIndex(addToCardIconZIndex === 1 ? 100 : 1);
    };

    const handlePostCommentFromComment = async (comment) => {
        handlePostComment(task.task_id, task.column_id, comment);
    }

    const handleGetBoardTags = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get(`/boards/${task.board_id}/tags`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBoardTags(response.data.tags);
        } catch (err) {
            console.log(err);
        }
    };

    const handleAddDeadline = () => {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextWeek.setHours(0, 0, 0, 0);
        const nextWeekTimestamp = nextWeek.toISOString().slice(0, 19).replace('T', ' ');
        modifyDeadline(task.task_id, task.column_id, nextWeekTimestamp);
    };

    const handleAddPriority = () => {
        modifyPriority(task.task_id, task.column_id, priorities[0].priority_id);
    };

    return (
        <div className='overlay'>
            <div className='popup' ref={popupRef}>
                {/* Upper Part */}
                <div className='upper-part'>
                    <input type='text' className='board-input' value={editedText} onChange={handleChange} />
                    {task.due_date &&
                        <div className='due-date'>
                            <span className='icon'>{stopwatchIcon}</span>
                            {task.due_date} {/* TODO: onClick szerkeszthetőség elkészítése */}
                        </div>}
                    {/* TODO: különböző színű icon megjelenítése az id helyett annak függvényében, hogy milyen a prioritása a feledatnak */}
                    {task.priority && <div className='priority'>{task.priority.priority}</div>}
                    {/* TODO: onClick szerkeszthetőség elkészítése */}
                    {task.parent_task_id === null ? (
                        <span className='close-btn' onClick={onClose}>
                            {closeIcon}
                        </span>
                    ) : (
                        <span className='close-btn' onClick={() => onPreviousTask(task.parent_task_id, task.column_id)}>
                            {backIcon}
                        </span>
                    )}
                </div>
                {/* Lower Part */}
                <div className='lower-part'>
                    <div className='popup-content'>
                        {task.tags && task.tags.length > 0 && (
                            <>
                                <div className='subtitle'>
                                    <span className='icon'>{tagsIcon}</span>
                                    <h3>Tags:</h3>
                                </div>
                                <div className='tags'>
                                    <TagDropdown tags={tags} allTags={boardTags}></TagDropdown>
                                    <span className='addbtn-tag'>{plusIcon}</span>
                                </div>
                            </>
                        )}
                        <div className='subtitle'>
                            <span className='icon'>{fileIcon}</span>
                            <h3>Description:</h3>
                        </div>
                        <textarea
                            className='description-textarea'
                            value={editedDescription}
                            onChange={handleDescriptionChange}
                        />
                        {task.subtasks && task.subtasks.length > 0 && (
                            <>
                                <div className='subtitle'>
                                    <span className='icon'>{subtaskIcon}</span>
                                    <h3>Subtasks:</h3>
                                </div>
                            </>
                        )}
                        {task.subtasks && task.subtasks.length > 0 ?
                            <div className='subtasks-container'>
                                {task.subtasks.map((subTask, index) => (
                                    <Subtask
                                        key={subTask.task_id}
                                        subTask={subTask}
                                        index={index}
                                        favouriteSubtask={() =>
                                            favouriteSubtask(
                                                subTask.task_id,
                                                subTask.parent_task_id,
                                                subTask.column_id
                                            )
                                        }
                                        unFavouriteSubtask={() =>
                                            unFavouriteSubtask(
                                                subTask.task_id,
                                                subTask.parent_task_id,
                                                subTask.column_id
                                            )
                                        }
                                        deleteSubtask={() =>
                                            deleteSubtask(
                                                subTask.task_id,
                                                subTask.parent_task_id,
                                                subTask.column_id
                                            )
                                        }
                                        setTaskAsInspectedTask={() => setTaskAsInspectedTask(subTask)}
                                    />
                                ))}
                            </div>
                            : <></>}
                        <Comment comments={task.comments} handlePostComment={handlePostCommentFromComment}></Comment>
                    </div>
                </div>
                <button
                    className='save-button'
                    onClick={() =>
                        onSave(task.task_id, task.parent_task_id, task.column_id, editedText, editedDescription)
                    }
                >
                    Save
                </button>
                <button className='add-button' onClick={handleAddToCard} style={{ zIndex: addToCardIconZIndex }}>
                    {plusIcon}
                </button>
                {showAddToCard && (
                    <div
                        className='overlay darken'
                        onClick={() => {
                            setShowAddToCard(false);
                            setAddToCardIconZIndex(1);
                        }}
                    >
                        <div
                            className='add-to-card'
                            style={{
                                position: 'fixed',
                                left: addToCardContainerPosition.x + 'px',
                                top: addToCardContainerPosition.y + 'px',
                            }}
                        >
                            <div className='add-to-card-title'>Add to card</div>
                            <div className='add-to-card-content'>
                                <div
                                    className='add-to-card-item'
                                    onClick={() => addSubtask(task.task_id, task.column_id)}
                                >
                                    <p>Subtask</p>
                                </div>
                                {task.due_date === null &&
                                    <div className='add-to-card-item' onClick={handleAddDeadline}>
                                        <p>Deadline</p>
                                    </div>}
                                {task.priority === null &&
                                    <div className='add-to-card-item' onClick={handleAddPriority}>
                                        <p>Priority</p>
                                    </div>}
                                <div className='add-to-card-item'>
                                    <p>Attachment</p>
                                </div>
                                <div className='add-to-card-item'>
                                    <p>Person</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Popup;
