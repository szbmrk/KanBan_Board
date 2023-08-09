import React, { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "../api/axios";
import Error from "./Error";
import "../styles/popup.css";
import "../styles/GenerateTaskWithAGIPopup.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const GenerateTaskWithAGIPopup = ({ tasks, onCancel }) => {
  let [editedTasks, setEditedTasks] = useState(tasks ? [...tasks] : []);
  const taskTitleInputRef = useRef(null);
  const popupRef = useRef(null);

  const closeIcon = <FontAwesomeIcon icon={faXmark} />;

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

  const generateTasks = async (taskPrompt, task) => {
    try {
      const token = sessionStorage.getItem("token");
      /*       const formData = new FormData();
      formData.append("name", "New Column");
      formData.append("is_finished", 0);
      formData.append("task_limit", 5); */
      const res = await axios.get(`/dashboard/AGI`, {
        headers: {
          Authorization: `Bearer ${token}`,
          TaskPrompt: `${taskPrompt}`,
        },
      });

      console.log(res);
      console.log(res.data);
      console.log("task");
      console.log(task);
      if (task) {
        task.tasks = res.data;
        setEditedTasks(editedTasks);
        console.log(editedTasks);
      } else {
        setEditedTasks(res.data);
      }
      console.log(editedTasks.length);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onCancel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onCancel]);

  const generateSubtasks = (task) => {
    /*     generateTasks(
      "Task title: " +
        task.title +
        ", task desciption: " +
        task.description +
        ", due_date: " +
        task.due_date
    ); */
    generateTasks(
      "Develop a shopping web page in react with login, sign up, cart and list of goods pages",
      task
    );
  };

  return (
    <div className="overlay">
      <div className="popup">
        <span className="close-btn" onClick={onCancel}>
          {closeIcon}
        </span>
        <div className="gt-popup-content">
          <div className="gt-scrollable-list">
            {editedTasks.length > 0 ? (
              <>
                {editedTasks.map((editedTask, index) => (
                  <div className="gt-input-container" key={index}>
                    <div className="gt-attributes">
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
                    <div className="gt-action-buttons">
                      <button
                        className="generate-subtasks-button"
                        onClick={() => generateSubtasks(editedTask)} // Replace with the actual ID retrieval logic
                      >
                        Generate Subtasks
                      </button>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="gt-input-container">
                  <p>Give me a task to generate tickets about:</p>
                  <input
                    type="text"
                    placeholder="Enter task title"
                    ref={taskTitleInputRef}
                  />
                  <button
                    onClick={() =>
                      generateTasks(taskTitleInputRef.current.value)
                    }
                  >
                    Generate tasks
                  </button>
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
