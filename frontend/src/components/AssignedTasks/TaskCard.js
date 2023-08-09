import React from "react";
import '../../styles/taskcard.css'; // Import the CSS file for styling

const TaskCard = ({ task }) => {
  return (
    <div className="task-card">
      <h2>{task.title}</h2>
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
      {/* You can add more information from the task data as needed */}
    </div>
  );
};

export default TaskCard;