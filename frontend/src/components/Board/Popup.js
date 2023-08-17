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
    faPaperclip,
    faTrash,
} from '@fortawesome/free-solid-svg-icons';
import axios from "../../api/axios";
import Subtask from './Subtask';
import TagDropdown from "../TagDropdown";
import Comment from './Comment';
import DatePicker from "react-datepicker";
import { set } from 'lodash';

const closeIcon = <FontAwesomeIcon icon={faXmark} />;
const subtaskIcon = <FontAwesomeIcon icon={faListCheck} />;
const backIcon = <FontAwesomeIcon icon={faArrowLeft} />;
const plusIcon = <FontAwesomeIcon icon={faPlus} />;
const tagsIcon = <FontAwesomeIcon icon={faTags} />;
const linkIcon = <FontAwesomeIcon icon={faLink} />;
const stopwatchIcon = <FontAwesomeIcon icon={faStopwatch} />;
const fileIcon = <FontAwesomeIcon icon={faFileLines} />;
const priorityIcon = <FontAwesomeIcon icon={faFireFlameCurved} />;
const attachmentIcon = <FontAwesomeIcon icon={faPaperclip} />
const trashIcon = <FontAwesomeIcon icon={faTrash} />;


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
    addAttachment,
    tags
}) => {
    const popupRef = useRef(null);

    const [editedText, setEditedText] = useState(task.title);
    const [editedDescription, setEditedDescription] = useState(task.description);
    const [showAddToCard, setShowAddToCard] = useState(false);
    const [addToCardIconZIndex, setAddToCardIconZIndex] = useState(1);
    const [addToCardContainerPosition, setAddToCardContainerPosition] = useState({ x: 0, y: 0 });
    const [priorityPickerPos, setPriorityPickerPos] = useState({ x: 0, y: 0 });
    const [priorityDropDownZIndex, setPriorityDropDownZIndex] = useState(1);
    const [boardTags, setBoardTags] = useState([]);
    const [newDeadlineDate, setNewDeadlineDate] = useState(null);
    const [showPriorityDropDown, setShowPriorityDropDown] = useState(false);

    const handleChange = (event) => {
        setEditedText(event.target.value);
    };

    const handleDescriptionChange = (event) => {
        setEditedDescription(event.target.value);
    };

    useEffect(() => {
        setShowPriorityDropDown(false);
        setNewDeadlineDate(null);
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
        setAddToCardContainerPosition({ x: newX, y: newY });
        setShowAddToCard(!showAddToCard);
        setAddToCardIconZIndex(addToCardIconZIndex === 1 ? 100 : 1);
    };

    const handleOpenPriorityPicker = (event) => {
        const buttonRect = event.target.getBoundingClientRect();
        const newX = buttonRect.right - 160;
        const newY = buttonRect.top + 25;
        setPriorityPickerPos({ x: newX, y: newY });
        setShowPriorityDropDown(!showPriorityDropDown);
        setPriorityDropDownZIndex(priorityDropDownZIndex === 1 ? 100 : 1);
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
        console.log(nextWeek);
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextWeek.setHours(nextWeek.getHours() + 2);
        nextWeek.setMinutes(0);
        nextWeek.setSeconds(0);
        nextWeek.setMilliseconds(0);
        const nextWeekTimestamp = nextWeek.toISOString().slice(0, 19).replace('T', ' ');
        modifyDeadline(task.task_id, task.column_id, nextWeekTimestamp);
    };

    const handleAddPriority = () => {
        modifyPriority(task.task_id, task.column_id, priorities[0].priority_id);
    };

    const handleModifyPriority = (priorityId) => {
        modifyPriority(task.task_id, task.column_id, priorityId);
    };

    const handleModifyDeadline = (date) => {
        const timestamp = date.toISOString().slice(0, 19).replace('T', ' ');
        modifyDeadline(task.task_id, task.column_id, timestamp);
    };

    const handleOnDatePickerClose = () => {
        if (newDeadlineDate !== null) {
            const newDeadLine = new Date(newDeadlineDate);
            newDeadLine.setHours(0);
            newDeadLine.setHours(newDeadLine.getHours() + 2);
            newDeadLine.setMinutes(0);
            newDeadLine.setSeconds(0);
            newDeadLine.setMilliseconds(0);
            handleModifyDeadline(newDeadLine);
        }
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
                            <DatePicker className='due-date-picker'
                                selected={task.due_date ? new Date(task.due_date) : null}
                                onSelect={(date) => setNewDeadlineDate(date)}
                                onCalendarClose={handleOnDatePickerClose}
                                dateFormat="yyyy-MM-dd"
                            />
                        </div>}
                    {/* TODO: különböző színű icon megjelenítése az id helyett annak függvényében, hogy milyen a prioritása a feledatnak */}
                    {task.priority &&
                        <>
                            <div onClick={handleOpenPriorityPicker} style={{ zIndex: priorityDropDownZIndex }} className='priority'>
                                {task.priority.priority}
                            </div>
                        </>}
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
                        {task.attachments && task.attachments.length > 0 && (
                            <div className='attachments-section'>
                                <div className='subtitle'>
                                    <span className='icon'>{attachmentIcon}</span>
                                    <h3>Attachments:</h3>
                                </div>
                                <div className='attachment-container'>
                                    {task.attachments.map((attachment, index) => (
                                        <div className='attachment' key={index}>
                                            <a className='attachment-link' href={attachment.link} target="_blank">{attachment.link}</a>
                                            <span className="delete-button">{trashIcon}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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
                                <div className='add-to-card-item' onClick={() => addAttachment(task.task_id, task.column_id)}>
                                    <p>Attachment</p>
                                </div>
                                <div className='add-to-card-item'>
                                    <p>Person</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {showPriorityDropDown &&
                    <div
                        className='overlay darken'
                        onClick={() => {
                            setShowPriorityDropDown(false);
                            setPriorityDropDownZIndex(1);
                        }}
                    >
                        <div
                            className='priority-picker'
                            style={{
                                position: 'fixed',
                                left: priorityPickerPos.x + 'px',
                                top: priorityPickerPos.y + 'px',
                            }}
                        >
                            <div className='priority-picker-content'>
                                {priorities.map((priority, index) => (
                                    <p className='priority-picker-item' key={index}
                                        value={priority.priority_id} onClick={() => { handleModifyPriority(priority.priority_id) }}>{priority.priority}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
};

export default Popup;
