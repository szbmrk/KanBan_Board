import React from "react";
import '../../styles/taskcard.css';

const TaskCard = ({ task }) => {
    return (
        <div className="task-card">
            <h2>{task.title}</h2>
            {task.tags && task.tags.length > 0 && (
                <>
                    <h3>Tags:</h3>
                    <div className="tags">
                        {task.tags.map((tag, index) => (
                            tag && tag.name && tag.color ? (
                                <p key={index} style={{ backgroundColor: tag.color }}>
                                    {tag.name}
                                </p>
                            ) : null
                        ))}
                    </div>
                </>
            )}
            {task.description && <p>{task.description}</p>}
            {task.due_date && <p>Due Date: {task.due_date}</p>}
            {task.priority && <p>Priority: {task.priority.priority}</p>}
            {task.attachments && task.attachments.length > 0 && (
                <>
                    <p>Attachments:</p>
                    {task.attachments.map((attachment, index) => (
                        attachment && attachment.link ? (
                            <p key={index}>{attachment.link}</p>
                        ) : null
                    ))}
                </>
            )}
            {task.comments && task.comments.length > 0 && (
                <div className="comments">
                    <h3>Comments:</h3>
                    {task.comments.map((comment, index) => (
                        comment && comment.user && comment.user.username && comment.text ? (
                            <p key={index} className="comment">
                                <span className="user">{comment.user.username}:</span> {comment.text}
                            </p>
                        ) : null
                    ))}
                </div>
            )}
        </div>
    );
};

export default TaskCard;
