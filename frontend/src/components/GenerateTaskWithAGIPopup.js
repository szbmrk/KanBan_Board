import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "../api/axios";
import Error from "./Error";
import "../styles/popup.css";
import "../styles/GenerateTaskWithAGIPopup.css";

const GenerateTaskWithAGIPopup = ({ tasks, onClose }) => {
  let [editedTasks, setEditedTasks] = useState(tasks ? [...tasks] : []);

  const handleTitleChange = (e, index) => {
    const updatedTasks = [...editedTasks];
    updatedTasks[index] = {
      ...updatedTasks[index],
      title: e.target.value,
    };
    setEditedTasks(updatedTasks);
  };

  const handleDescriptionChange = (e, index) => {
    const updatedTasks = [...editedTasks];
    updatedTasks[index] = {
      ...updatedTasks[index],
      description: e.target.value,
    };
    setEditedTasks(updatedTasks);
  };

  const handleDueDateChange = (date, index) => {
    const updatedTasks = [...editedTasks];
    updatedTasks[index] = {
      ...updatedTasks[index],
      due_date: date,
    };
    setEditedTasks(updatedTasks);
  };

  const saveChanges = () => {
    // Call an API or perform any other action to save changes
    //onClose();
  };

  const generateTasks = async () => {
    try {
      const token = sessionStorage.getItem("token");
      /*       const formData = new FormData();
      formData.append("name", "New Column");
      formData.append("is_finished", 0);
      formData.append("task_limit", 5); */
      const res = await axios.get(`/dashboard/AGI`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(res);
      console.log(res.data);
      setEditedTasks(res.data);
      console.log(editedTasks.length);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="overlay">
      <div className="popup">
        <div className="gt-popup-content">
          <div className="gt-scrollable-list">
            {editedTasks.length > 0 ? (
              <>
                {editedTasks.map((editedTask, index) => (
                  <div className="gt-input-container" key={index}>
                    <p>Title:</p>
                    <textarea
                      type="text"
                      value={editedTask.title}
                      onChange={(e) => handleTitleChange(e, index)}
                    />
                    <p>Description:</p>
                    <textarea
                      value={editedTask.description}
                      onChange={(e) => handleDescriptionChange(e, index)}
                    />
                    <p>Due date:</p>
                    <DatePicker
                      selected={
                        editedTask.due_date
                          ? new Date(editedTask.due_date)
                          : null
                      }
                      onChange={(date) => handleDueDateChange(date, index)}
                      dateFormat="yyyy-MM-dd"
                    />
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="gt-input-container">
                  <p>Give me a task to generate tickets about:</p>
                  <input type="text" placeholder="Enter task title" />
                  <button onClick={generateTasks}>Generate tasks</button>
                </div>
              </>
            )}
          </div>
          <div className="gt-button-container">
            <button onClick={saveChanges}>Save to database</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateTaskWithAGIPopup;
