import React, { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "../api/axios";
import Error from "./Error";
import "../styles/popup.css";
import "../styles/GenerateTaskWithAGIPopup.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";

const GenerateTaskWithAGIPopup = ({ tasks, onCancel }) => {
  let [editedTasks, setEditedTasks] = useState(tasks ? [...tasks] : []);
  const taskTitleInputRef = useRef(null);
  const popupRef = useRef(null);
  const aiOptions = [
    { value: "chatgpt", label: "ChatGPT" },
    { value: "llama", label: "Llama" },
  ];
  let [chosenAI, setChosenAI] = useState(aiOptions[0]);

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

  const generateTasks = async (taskPrompt, task, ai) => {
    try {
      console.log(ai);
      const token = sessionStorage.getItem("token");
      /*       const formData = new FormData();
      formData.append("name", "New Column");
      formData.append("is_finished", 0);
      formData.append("task_limit", 5); */
      const res = await axios.get(`/dashboard/AGI`, {
        headers: {
          Authorization: `Bearer ${token}`,
          TaskPrompt: `${taskPrompt}`,
          ChosenAI: `${ai}`,
        },
      });

      console.log(res);
      console.log(res.data);
      console.log("task");
      console.log(task);
      if (task) {
        task.tasks = res.data;
        const updatedTask = task
          ? { ...task, tasks: res.data }
          : { tasks: res.data };
        const updatedTasks = updateTaskInEditedTasks(editedTasks, updatedTask);
        //task.tasks = res.data;

        setEditedTasks(updatedTasks);
      } else {
        setEditedTasks(res.data);
      }
      console.log(editedTasks.length);
    } catch (e) {
      console.error(e);
    }
  };

  const updateTaskInEditedTasks = (tasksList, updatedTask) => {
    return tasksList.map((task) =>
      task === updatedTask
        ? updatedTask
        : {
            ...task,
            tasks: task.tasks
              ? updateTaskInEditedTasks(task.tasks, updatedTask)
              : task.tasks,
          }
    );
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
          {editedTasks.length > 0 ? (
            <>
              <div className="gt-scrollable-list">
                {editedTasks.map((editedTask, index) => (
                  <TaskRecursive
                    deepness={0}
                    key={index}
                    task={editedTask}
                    generateTasks={generateTasks}
                  />
                ))}
              </div>
              <div className="gt-button-container">
                <button onClick={saveChanges}>Save to database</button>
              </div>
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
                <Dropdown
                  options={aiOptions}
                  value={chosenAI}
                  onChange={(selectedOption) => setChosenAI(selectedOption)}
                />
                <button
                  onClick={() =>
                    generateTasks(
                      taskTitleInputRef.current.value,
                      null,
                      chosenAI
                    )
                  }
                >
                  Generate tasks
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const TaskRecursive = ({ deepness, task, index, generateTasks }) => {
  const aiOptions = [
    { value: "chatgpt", label: "ChatGPT" },
    { value: "llama", label: "Llama" },
  ];
  let [chosenAI, setChosenAI] = useState(aiOptions[0]);

  const handleTitleChange = (e) => {
    // Update title for the specific task
  };

  const handleDescriptionChange = (e) => {
    // Update description for the specific task
  };

  const handleDueDateChange = (date) => {
    // Update due date for the specific task
  };

  const generateSubtasks = (task) => {
    console.log(chosenAI);
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
      task,
      chosenAI
    );
  };

  return (
    <div
      className={
        deepness > 0 ? "gt-input-container gt-space" : "gt-input-container"
      }
      key={index}
    >
      <div className="gt-attributes">
        <p>Title:</p>
        <textarea
          type="text"
          value={task.title}
          onChange={(e) => handleTitleChange(e)}
        />
        <p>Description:</p>
        <textarea
          value={task.description}
          onChange={(e) => handleDescriptionChange(e)}
        />
        <p>Due date:</p>
        <DatePicker
          selected={task.due_date ? new Date(task.due_date) : null}
          onChange={(date) => handleDueDateChange(date)}
          dateFormat="yyyy-MM-dd"
        />
      </div>
      <div className="gt-action-buttons">
        <Dropdown
          options={aiOptions}
          value={chosenAI}
          onChange={(selectedOption) => setChosenAI(selectedOption)}
        />
        <button
          className="generate-subtasks-button"
          onClick={() => generateSubtasks(task)}
        >
          Generate Subtasks
        </button>
      </div>
      {task.tasks && task.tasks.length > 0 && (
        <div className="subtasks">
          {task.tasks.map((subtask, subtaskIndex) => (
            <TaskRecursive
              deepness={deepness + 1}
              key={subtaskIndex}
              task={subtask}
              generateTasks={generateTasks}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GenerateTaskWithAGIPopup;
