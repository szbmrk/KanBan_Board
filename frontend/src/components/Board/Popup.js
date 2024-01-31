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
    faPeopleGroup,
    faComments,
} from '@fortawesome/free-solid-svg-icons';
import axios from '../../api/axios';
import Subtask from './Subtask';
import TagDropdown from './TagDropdown';
import Comment from './Comment';
import DatePicker from 'react-datepicker';
import TagEditorPopup from './TagEditorPopup';
import ErrorWrapper from "../../ErrorWrapper";

const closeIcon = <FontAwesomeIcon icon={faXmark} />;
const subtaskIcon = <FontAwesomeIcon icon={faListCheck} />;
const backIcon = <FontAwesomeIcon icon={faArrowLeft} />;
const plusIcon = <FontAwesomeIcon icon={faPlus} />;
const tagsIcon = <FontAwesomeIcon icon={faTags} />;
const linkIcon = <FontAwesomeIcon icon={faLink} />;
const stopwatchIcon = <FontAwesomeIcon icon={faStopwatch} />;
const fileIcon = <FontAwesomeIcon icon={faFileLines} />;
const priorityIcon = <FontAwesomeIcon icon={faFireFlameCurved} />;
const attachmentIcon = <FontAwesomeIcon icon={faPaperclip} />;
const trashIcon = <FontAwesomeIcon icon={faTrash} />;
const membersIcon = <FontAwesomeIcon icon={faPeopleGroup} />;
const commentsIcon = <FontAwesomeIcon icon={faComments} />;

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
    deleteAttachment,
    addMember,
    deleteMember,
    placeTagOnTask,
    removeTagFromTask,
    handleBoardTagDeletion,
}) => {
    const popupRef = useRef(null);
    const [theme, setTheme] = useState(localStorage.getItem("darkMode"));
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
    const [showAddAttachment, setShowAddAttachment] = useState(false);
    const [newAttachmentLink, setNewAttachmentLink] = useState('');
    const [newAttachmentDescription, setNewAttachmentDescription] = useState('');
    const [linkIsValid, setLinkIsValid] = useState(true);
    const [notMembers, setNotMembers] = useState([]);
    const [showAddMember, setShowAddMember] = useState(false);
    const [newMember, setNewMember] = useState(null);

    const token = sessionStorage.getItem('token');

    const [showTagEditorPopup, setShowTagEditorPopup] = useState(false);
    const [tagToEdit, setTagToEdit] = useState(null);

    const [error, setError] = useState(null);

    const validateLink = (inputLink) => {
        const urlPattern = /^(http|https):\/\/[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/;
        return urlPattern.test(inputLink);
    };

    const handleLinkChange = (event) => {
        const inputValue = event.target.value;
        setNewAttachmentLink(inputValue);
        setLinkIsValid(validateLink(inputValue));
    };

    const handleChange = (event) => {
        setEditedText(event.target.value);
    };

    const handleDescriptionChange = (event) => {
        setEditedDescription(event.target.value);
    };

    useEffect(() => {
        getNotMembers();
        setShowPriorityDropDown(false);
        setNewDeadlineDate(null);
        setNewAttachmentLink('');
        setNewAttachmentDescription('');
        setEditedText(task.title);
        setEditedDescription(task.description);
        handleGetBoardTags();
    }, [task]);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                if (event.target.className === 'overlay') onClose();
                if (event.target.className === 'overlay2') {
                    setShowAddAttachment(false);
                    setShowAddMember(false);
                }
            }
            //ez
            const ResetTheme = () => {
                setTheme(localStorage.getItem("darkMode"))
            }


            console.log("Darkmode: " + localStorage.getItem("darkMode"))
            window.addEventListener('ChangingTheme', ResetTheme)

            return () => {
                window.removeEventListener('ChangingTheme', ResetTheme)
            }
            //eddig
        };

        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [onClose]);

    const getNotMembers = async () => {
        try {
            const response = await axios.get(`/boards/${task.board_id}/tasks/${task.task_id}/not_assigned_users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log(response.data.users);
            setNotMembers(response.data.users);
            setNewMember(response.data.users[0].user_id);
        } catch (error) {
            setError(error.response.data)
        }
    };

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
    };

    const handleGetBoardTags = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get(`/boards/${task.board_id}/tags`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBoardTags(response.data.tags);
        } catch (err) {
            setError(err.response.data);
        }
    };

    const handleAddDeadline = () => {
        const nextWeek = new Date();
        console.log(nextWeek);
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextWeek.setHours(nextWeek.getHours() + 2); // kell a két óra mivel a new Date alapból 2 órával kevesebbet ad vissza
        nextWeek.setMinutes(0);
        nextWeek.setSeconds(0);
        nextWeek.setMilliseconds(0);
        const nextWeekTimestamp = nextWeek.toISOString().slice(0, 19).replace('T', ' ');
        modifyDeadline(task.task_id, task.column_id, nextWeekTimestamp);
    };

    const handleModifyDeadline = (date) => {
        const timestamp = date.toISOString().slice(0, 19).replace('T', ' ');
        modifyDeadline(task.task_id, task.column_id, timestamp);
    };

    const handleOnDatePickerClose = () => {
        if (newDeadlineDate !== null) {
            const newDeadLine = new Date(newDeadlineDate);
            newDeadLine.setHours(0);
            newDeadLine.setHours(newDeadLine.getHours() + 2); // kell a két óra mivel a new Date alapból 2 órával kevesebbet ad vissza
            newDeadLine.setMinutes(0);
            newDeadLine.setSeconds(0);
            newDeadLine.setMilliseconds(0);
            handleModifyDeadline(newDeadLine);
        }
    };

    const handleAddPriority = () => {
        modifyPriority(task.task_id, task.column_id, priorities[0].priority_id);
    };

    const handleModifyPriority = (priorityId) => {
        modifyPriority(task.task_id, task.column_id, priorityId);
    };

    const handleAddAttachment = (e) => {
        e.preventDefault();
        if (linkIsValid) {
            addAttachment(task.task_id, task.column_id, newAttachmentLink, newAttachmentDescription);
            setShowAddAttachment(false);
            setNewAttachmentLink('');
            setNewAttachmentDescription('');
        }
    };

    const handleAddMember = () => {
        addMember(task.task_id, task.column_id, newMember);
        const newNotMembers = [...notMembers];
        newNotMembers.splice(
            newNotMembers.findIndex((member) => member.user_id === newMember),
            1
        );
        setNotMembers(newNotMembers);
        setShowAddMember(false);
        if (newNotMembers.length > 0) {
            setNewMember(newNotMembers[0].user_id); // reset value for dropdown
        }
    };

    const handleDeleteMember = (userId) => {
        deleteMember(task.task_id, task.column_id, userId);
        const newNotMembers = [...notMembers];
        const newMember = task.members.find((member) => member.user_id === userId);
        newNotMembers.push(newMember);
        task.members.splice(
            task.members.findIndex((member) => member.user_id === userId),
            1
        );
        setNotMembers(newNotMembers);
        if (newNotMembers.length > 0) {
            setNewMember(newNotMembers[0].user_id); // reset value for dropdown
        }
    };

    const handleCloseTagEditor = () => {
        setShowTagEditorPopup(false);
        setTagToEdit(null);
    };

    const handleSaveTagEditor = async (tagData) => {
        if (tagData.tagId !== -1) {
            try {
                const formData = new FormData();
                formData.append('name', tagData.name);
                formData.append('color', tagData.color);
                await axios.put(
                    `/boards/${task.board_id}/tags/${tagData.tagId}`,
                    { name: tagData.name, color: tagData.color },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const updatedBoardTags = boardTags.map((tag) => {
                    if (tag.tag_id === tagData.tagId) {
                        return {
                            ...tag,
                            name: tagData.name,
                            color: tagData.color,
                        };
                    }
                    return tag;
                });

                const updatedTaskTags = task.tags.map((tag) => {
                    if (tag.tag_id === tagData.tagId) {
                        return {
                            ...tag,
                            name: tagData.name,
                            color: tagData.color,
                        };
                    }
                    return tag;
                });

                setBoardTags(updatedBoardTags);
                task.tags = updatedTaskTags;

                setShowTagEditorPopup(false);
            } catch (e) {
                setError(e.response.data);
            }
        } else {
            try {
                const formData = new FormData();
                formData.append('name', tagData.name);
                formData.append('color', tagData.color);
                await axios.post(`/boards/${task.board_id}/tags`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                //TODO: visszakapni a tag_id-t response-sal, mert a tagData-ból nem jön,
                //TODO: és lecserélni ezt a sort annak a használatára...
                handleGetBoardTags();

                setShowTagEditorPopup(false);
            } catch (e) {
                setError(e.response.data);
            }
        }
    };

    const handleTagEditing = (tag) => {
        setTagToEdit(tag);
        setShowTagEditorPopup(true);
    };

    const handleTagDeletion = async (tagData) => {
        try {
            await axios.delete(`/boards/${task.board_id}/tags/${tagData.tagId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const updatedBoardTags = boardTags.filter((tag) => tag.tag_id !== tagData.tagId);

            const updatedTaskTags = task.tags.filter((tag) => tag.tag_id !== tagData.tagId);

            setBoardTags(updatedBoardTags);
            task.tags = updatedTaskTags;

            handleBoardTagDeletion(tagData.tagId);
        } catch (e) {
            setError(e.response.data);
        }
    };

    return (
        <div className='overlay' data-theme={theme}>
            <div className='popup' ref={popupRef}>
                {/* Upper Part */}
                <div className='upper-part'>
                    <input type='text' className='board-input' value={editedText} onChange={handleChange} />
                    {task.due_date && (
                        <div className='due-date'>
                            <span className='icon'>{stopwatchIcon}</span>
                            <DatePicker
                                className='due-date-picker'
                                selected={task.due_date ? new Date(task.due_date) : null}
                                onSelect={(date) => setNewDeadlineDate(date)}
                                onCalendarClose={handleOnDatePickerClose}
                                dateFormat='yyyy-MM-dd'
                            />
                        </div>
                    )}
                    {/* TODO: különböző színű icon megjelenítése az id helyett annak függvényében, hogy milyen a prioritása a feledatnak */}
                    {task.priority && (
                        <>
                            <div
                                onClick={handleOpenPriorityPicker}
                                style={{ zIndex: priorityDropDownZIndex }}
                                className='priority'
                            >
                                {task.priority.priority}
                            </div>
                        </>
                    )}
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
                        <div className='tags-container'>
                            {task.tags && (
                                <>
                                    <div className='subtitle'>
                                        <span className='icon'>{tagsIcon}</span>
                                        <h3>Tags:</h3>
                                    </div>
                                    <div className='popup-tags'>
                                        <TagDropdown
                                            tags={task.tags}
                                            allTags={boardTags}
                                            taskId={task.task_id}
                                            placeTagOnTask={placeTagOnTask}
                                            removeTagFromTask={removeTagFromTask}
                                            tagEditHandler={handleTagEditing}
                                            tagDeleteHandler={handleTagDeletion}
                                        ></TagDropdown>
                                        <span className='addbtn-tag' onClick={() => setShowTagEditorPopup(true)}>
                                            {plusIcon}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className='description-container'>
                            <div className='subtitle'>
                                <span className='icon'>{fileIcon}</span>
                                <h3>Description:</h3>
                            </div>
                            <textarea
                                className='description-textarea'
                                value={editedDescription}
                                onChange={handleDescriptionChange}
                            />
                        </div>
                        <div className='subtasks-container'>
                            {task.subtasks && task.subtasks.length > 0 ? (
                                <>
                                    <div className='subtitle'>
                                        <span className='icon'>{subtaskIcon}</span>
                                        <h3>Subtasks:</h3>
                                    </div>
                                    <div className='subtask'>
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
                                </>
                            ) : (
                                <></>
                            )}
                        </div>
                        <div className='comments-container'>
                            <div className='subtitle'>
                                <span className='icon'>{commentsIcon}</span>
                                <h3>Comments:</h3>
                            </div>
                            <Comment
                                comments={task.comments}
                                handlePostComment={handlePostCommentFromComment}
                            ></Comment>
                        </div>
                        <div className='attachments-container'>
                            {task.attachments && task.attachments.length > 0 && (
                                <>
                                    <div className='subtitle'>
                                        <span className='icon'>{attachmentIcon}</span>
                                        <h3>Attachments:</h3>
                                    </div>
                                    <div className='attachment-container'>
                                        {task.attachments.map((attachment, index) => (
                                            <div className='attachment' key={index}>
                                                <a className='attachment-link' href={attachment.link} target='_blank'>
                                                    {attachment.link}
                                                </a>
                                                <span
                                                    className='trash-icon'
                                                    onClick={() =>
                                                        deleteAttachment(
                                                            task.task_id,
                                                            task.column_id,
                                                            attachment.attachment_id
                                                        )
                                                    }
                                                >
                                                    {trashIcon}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className='members-container'>
                            {task.members && task.members.length > 0 && (
                                <>
                                    <div className='subtitle'>
                                        <span className='icon'>{membersIcon}</span>
                                        <h3>Members:</h3>
                                    </div>
                                    <div className='member-container'>
                                        {task.members.map((member, index) => (
                                            <div className='member' key={index}>
                                                <p className='username'>{member.username}</p>
                                                <p className='email'>{member.email}</p>
                                                <span
                                                    onClick={() => handleDeleteMember(member.user_id)}
                                                    className='delete-icon'
                                                    data-hover='Delete Member'
                                                >
                                                    {closeIcon}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
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
                <button className='add-icon' onClick={handleAddToCard} style={{ zIndex: addToCardIconZIndex }}>
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
                                {task.due_date === null && (
                                    <div className='add-to-card-item' onClick={handleAddDeadline}>
                                        <p>Deadline</p>
                                    </div>
                                )}
                                {task.priority === null && (
                                    <div className='add-to-card-item' onClick={handleAddPriority}>
                                        <p>Priority</p>
                                    </div>
                                )}
                                <div className='add-to-card-item' onClick={() => setShowAddAttachment(true)}>
                                    <p>Attachment</p>
                                </div>
                                {notMembers && notMembers.length > 0 && (
                                    <div className='add-to-card-item' onClick={() => setShowAddMember(true)}>
                                        <p>Person</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {showPriorityDropDown && (
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
                                    <div
                                        className='priority-picker-item'
                                        key={index}
                                        value={priority.priority_id}
                                        onClick={() => {
                                            handleModifyPriority(priority.priority_id);
                                        }}
                                    >
                                        <p>{priority.priority}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {showTagEditorPopup && (
                    <TagEditorPopup onClose={handleCloseTagEditor} onSave={handleSaveTagEditor} tagToEdit={tagToEdit} />
                )}
            </div>
            {showAddAttachment && (
                <div className='overlay darken'>
                    <div className='attachment-popup-mini-attachment'>
                        <form className='attachment-popup-content-form-mini' onSubmit={handleAddAttachment}>
                            <h4>Link:</h4>
                            <input type='text' placeholder='https://example.com' required onChange={handleLinkChange} />
                            {!linkIsValid && <span className='validation-message'>Invalid link format</span>}
                            <h4>Description:</h4>
                            <input
                                type='textarea'
                                placeholder='example description'
                                onChange={(e) => setNewAttachmentDescription(e.target.value)}
                            />
                            <button
                                className={linkIsValid ? 'attachment-add-button' : 'attachment-add-button invalid-btn'}
                                disabled={!linkIsValid}
                            >
                                Add
                            </button>
                            <button
                                onClick={() => setShowAddAttachment(false)}
                                type='button'
                                className='attachment-cancel-button'
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {showAddMember && (
                <div className='overlay darken'>
                    <div className='attachment-popup-mini-attachment'>
                        <form className='attachment-popup-content-form-mini'>
                            <h4>Person:</h4>
                            <div>
                                <select onChange={(e) => setNewMember(e.target.value)} selected={notMembers[0].user_id}>
                                    {notMembers.map((member, index) => (
                                        <option key={index} value={member.user_id}>
                                            {member.username}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button onClick={handleAddMember} className={'attachment-add-button'}>
                                Add
                            </button>
                            <button
                                onClick={() => setShowAddMember(false)}
                                type='button'
                                className='attachment-cancel-button'
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {error && (
                <ErrorWrapper originalError={error} onClose={() => { setError(null); }} />
            )}
        </div>
    );
};

export default Popup;
