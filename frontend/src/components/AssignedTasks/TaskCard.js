import React from "react";
import '../../styles/taskcard.css'; // Import the CSS file for styling
import Tag from "../Tag";

const TaskCard = ({ task }) => {
    return (
        <div className="task-card">
            <h2 className="card-title">{task.title}</h2>
            <h3>Tags:</h3>
            <div className="tags">
                {task.tags.map((tag, index) => (
                    <p key={index} style={{ backgroundColor: tag.color }}>
                        {tag.name}
                    </p>
                ))}
            </div>
            <p>{task.description}</p>
            <p>Due Date: {task.due_date}</p>
            <p>Priority: {task.priority.priority}</p>
            <p>Attachments:</p>
            {task.attachments.map(attachment => <p>{attachment.link}</p>)}
            <div className="comments">
                <h3>Comments:</h3>
                {task.comments.map((comment, index) => (
                    <p key={index} className="comment">
                        <span className="user">{comment.user.username}:</span> {comment.text}
                    </p>
                ))}
            </div>
        </div>
    );
};

export default TaskCard;