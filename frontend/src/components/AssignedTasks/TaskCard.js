import React from "react";
import '../../styles/taskcard.css';
import Tag from "../Tag";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTags,
    faLink,
    faStopwatch,
    faFileLines,
    faFireFlameCurved,
    faComments,
    faListCheck
} from "@fortawesome/free-solid-svg-icons";

const tagsIcon = <FontAwesomeIcon icon={faTags} />;
const linkIcon = <FontAwesomeIcon icon={faLink} />;
const stopwatchIcon = <FontAwesomeIcon icon={faStopwatch} />;
const fileIcon = <FontAwesomeIcon icon={faFileLines} />;
const priorityIcon = <FontAwesomeIcon icon={faFireFlameCurved} />;
const commentsIcon = <FontAwesomeIcon icon={faComments} />;
const subtaskIcon = <FontAwesomeIcon icon={faListCheck} />;

const TaskCard = ({ task }) => {
    return (
        <div className="task-card">
            <h2 className="card-title">{task.title}</h2>
            {task.tags && task.tags.length > 0 && (
                <>
                    <div className="subtitle">
                        <span className="icon">{tagsIcon}</span>
                        <h3>Tags:</h3>
                    </div>
                    <div className="tags">
                        {task.tags.map((tag, index) => (
                            tag && tag.name && tag.color ? (
                                <Tag key={index} name={tag.name} color={tag.color} extraClassName="tag-on-card" />
                            ) : null
                        ))}
                    </div>
                </>
            )}
            <div className="subtitle">
                <span className="icon">{fileIcon}</span>
                <h3>Description:</h3>
            </div>
            <div className="description">
                {task.description && <p>{task.description}</p>}
            </div>
            <div className="subtitle">
                <span className="icon">{stopwatchIcon}</span>
                <h3>Due Date:</h3>
            </div>
            <div className="datetime">
                {task.due_date && <p>{task.due_date}</p>}
            </div>

            <div className="subtitle">
                <span className="icon">{priorityIcon}</span>
                <h3>Priority:</h3>
            </div>
            <div className="priority">
                {task.priority && <p>{task.priority.priority}</p>}
            </div>

            {task.attachments && task.attachments.length > 0 && (
                <>
                    <div className="subtitle">
                        <span className="icon">{linkIcon}</span>
                        <h3>Attachments:</h3>
                    </div>

                    {task.attachments.map((attachment, index) => (
                        attachment && attachment.link ? (
                            <p key={index}>{attachment.link}</p>
                        ) : null
                    ))}
                </>
            )}
            {task.comments && task.comments.length > 0 && (
                <>
                    <div className="subtitle">
                        <span className="icon">{commentsIcon}</span>
                        <h3>Comments:</h3>
                    </div>
                    {task.comments.map((comment, index) => (
                        comment && comment.user && comment.user.username && comment.text ? (
                            <p key={index} className="comment">
                                <span className="user">{comment.user.username}:</span> {comment.text}
                            </p>
                        ) : null
                    ))}
                </>
            )}
            {task.subtasks && task.subtasks.length > 0 && (
                <>
                    <div className="subtitle">
                        <span className="icon">{subtaskIcon}</span>
                        <h3>Subtasks:</h3>
                    </div>
                    {task.subtasks.map((subtask, index) => (
                        subtask && subtask.title ? (
                            <div classname="subtaskCard" style={{ border: "1px solid black" }}>
                                <p key={index} className="subtask">{subtask.title}</p>
                                {subtask.subtasks && subtask.subtasks.length > 0 && (<p>subtask count: {subtask.subtasks.length}</p>)}
                            </div>
                        ) : null
                    ))}
                </>
            )}
        </div>
    );
};

export default TaskCard;
