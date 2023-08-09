import React from 'react';
import '../../styles/assignedtasks.css'; // Import the CSS file

const TaskCard = ({ tasks }) => {
    const renderTags = (tags) => {
      return tags.map((tag, index) => (
        <span key={index} className="tag">
          {tag.title}
        </span>
      ));
    };
  
    const renderAttachments = (attachments) => {
      return attachments.map((attachment, index) => (
        <a key={index} href={attachment.link} className="attachment">
          Attachment {index + 1}
        </a>
      ));
    };
  
    const renderSubtasks = (subtasks) => {
      return subtasks.map((subtask, index) => (
        <div key={index} className="subtask">
          <h3>{subtask.Title}</h3>
        </div>
      ));
    };
  
    return (
      <div className="task-list">
        {tasks.Tasks.map((task, index) => (
          <div key={index} className="task">
            <h2>{task.Title}</h2>
            <p>{task.description}</p>
            <p>Deadline: {task.deadline}</p>
            <h3>Tags:</h3>
            <div className="tags">{renderTags(task.Tags)}</div>
            <p className="priority">Priority: {task.Priority}</p>
            <p className="user">User: {task.Users[0].UserName}</p>
            <h3>Attachments:</h3>
            <div className="attachments">{renderAttachments(task.Attachments)}</div>
            {task.Subtasks.length > 0 
            ?
            <div>
                <h1>Subtasks: </h1> {renderSubtasks(task.Subtasks)}
            </div>
             : 
                <></>
            }
          </div>
        ))}
      </div>
    );
  };

export default TaskCard;