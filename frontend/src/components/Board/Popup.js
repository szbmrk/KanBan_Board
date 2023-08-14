import React, { useEffect, useRef, useState } from 'react';
import axios from '../../api/axios';
import '../../styles/popup.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFileAlt,
    faXmark,
    faArrowLeft,
    faPlus,
    faTags,
    faLink,
    faStopwatch,
    faFileLines,
    faFireFlameCurved,
    faComments,
    faListCheck,
} from '@fortawesome/free-solid-svg-icons';
import { faPaperPlane } from '@fortawesome/free-regular-svg-icons';
import { Card } from './Task';
import Comment from './Comment';
import Subtask from './Subtask';
import Tag from '../Tag';

const closeIcon = <FontAwesomeIcon icon={faXmark} />;
const subtaskIcon = <FontAwesomeIcon icon={faListCheck} />;
const backIcon = <FontAwesomeIcon icon={faArrowLeft} />;
const plusIcon = <FontAwesomeIcon icon={faPlus} />;
const tagsIcon = <FontAwesomeIcon icon={faTags} />;
const linkIcon = <FontAwesomeIcon icon={faLink} />;
const stopwatchIcon = <FontAwesomeIcon icon={faStopwatch} />;
const fileIcon = <FontAwesomeIcon icon={faFileLines} />;
const priorityIcon = <FontAwesomeIcon icon={faFireFlameCurved} />;
const commentsIcon = <FontAwesomeIcon icon={faComments} />;
const sendMessageIcon = <FontAwesomeIcon icon={faPaperPlane} />;

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
    getComments,
    addComment,
    deleteComment,
    updateComment,
}) => {
    const popupRef = useRef(null);

    const [editedText, setEditedText] = useState(task.title);
    const [editedDescription, setEditedDescription] = useState(task.description);
    const [showAddToCard, setShowAddToCard] = useState(false);
    const [addToCardIconZIndex, setAddToCardIconZIndex] = useState(1);
    const [addToCardContainerPosition, setAddToCardContainerPosition] = useState({ x: 0, y: 0 });
    const [comments, setComments] = useState([]);

    const handleChange = (event) => {
        setEditedText(event.target.value);
    };

    const handleDescriptionChange = (event) => {
        setEditedDescription(event.target.value);
    };

    useEffect(() => {
        setEditedText(task.title);
        setEditedDescription(task.description);
        handleGetComments();
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

    const handleGetComments = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get(`/tasks/${task.task_id}/comments`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log(response.data.comments);
            setComments(response.data.comments);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className='overlay'>
            <div className='popup' ref={popupRef}>
                {/* Upper Part */}
                <div className='upper-part'>
                    <input type='text' className='board-input' value={editedText} onChange={handleChange} />
                    <div className='due-date'>
                        <span className='icon'>{stopwatchIcon}</span>
                        {task.due_date} {/* TODO: onClick szerkeszthetőség elkészítése */}
                    </div>
                    {/* TODO: különböző színű icon megjelenítése az id helyett annak függvényében, hogy milyen a prioritása a feledatnak */}
                    <div className='priority'>{task.priority_id}</div>{' '}
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
                                    {task.tags.map((tag, index) =>
                                        tag && tag.name && tag.color ? (
                                            <Tag
                                                key={index}
                                                name={tag.name}
                                                color={tag.color}
                                                extraClassName='tag-on-card'
                                                enableClickBehavior={false}
                                            />
                                        ) : null
                                    )}
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
                        {task.subtasks &&
                            task.subtasks.length > 0 &&
                            task.subtasks.map((subTask, index) => (
                                <>
                                    <div className='subtasks-container'>
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
                                    </div>
                                </>
                            ))}
                        <div className='subtitle'>
                            <span className='icon'>{commentsIcon}</span>
                            <h3>Comments:</h3>
                        </div>
                        <div className='comments-container'>
                            {comments.map((comment) =>
                            (
                                
                                <div>{comment.text}</div>
                            )
                            
                            )}
                            <div className='add-comment'>
                                <div className='add-comment-content'>
                                    <textarea className='add-comment-textarea' placeholder='Write your comment here' />
                                    <button className='add-comment-button'>{sendMessageIcon}</button>
                                </div>
                            </div>
                        </div>
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
                                <div className='add-to-card-item'>
                                    <p>Tag</p>
                                </div>
                                <div
                                    className='add-to-card-item'
                                    onClick={() => addSubtask(task.task_id, task.column_id)}
                                >
                                    <p>Subtask</p>
                                </div>
                                <div className='add-to-card-item'>
                                    <p>Date</p>
                                </div>
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
