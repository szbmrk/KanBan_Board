import React, { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "../api/axios";
import "../styles/popup.css";
import "../styles/GenerateTaskWithAGIPopup.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import Dropdown from "react-dropdown";

const GenerateTaskWithAGIPopup = ({ board_id, column, tasks, onCancel }) => {
  let [editedTasks, setEditedTasks] = useState(tasks ? [...tasks] : []);
  const taskTitleInputRef = useRef(null);
  const popupRef = useRef(null);
  const aiOptions = [
    { value: "chatgpt", label: "ChatGPT" },
    { value: "llama", label: "Llama" },
    { value: "bard", label: "Bard" },
  ];
  let [chosenAI, setChosenAI] = useState(aiOptions[0]);
  const counterOptions = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: "5" },
    { value: "6", label: "6" },
    { value: "7", label: "7" },
    { value: "8", label: "8" },
    { value: "9", label: "9" },
    { value: "10", label: "10" },
  ];
  let [taskCounter, setTaskCounter] = useState(counterOptions[0]);

  const closeIcon = <FontAwesomeIcon icon={faXmark} />;

  const handleTitleChange = (task, title) => {
    const updatedTask = (task.title = title);

    const updatedTasks = updateTaskInEditedTasks(editedTasks, updatedTask);

    setEditedTasks(updatedTasks);
  };

  const handleDescriptionChange = (task, description) => {
    const updatedTask = (task.description = description);

    const updatedTasks = updateTaskInEditedTasks(editedTasks, updatedTask);

    setEditedTasks(updatedTasks);
  };

  const handleDueDateChange = (task, date) => {
    const updatedTask = (task.due_date = date);

    const updatedTasks = updateTaskInEditedTasks(editedTasks, updatedTask);

    setEditedTasks(updatedTasks);
  };

  const saveToDatabase = async () => {
    try {
      const token = sessionStorage.getItem("token");
      console.log(editedTasks);
      //JSON.stringify(roles);
      let jsonformat = JSON.stringify(editedTasks);

      const res = await axios.put(
        `/boards/${board_id}/columns/${column.column_id}/tasks/update-with-subtasks`,
        {
          jsonformat,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(res);
      console.log(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const generateTask = async (taskPrompt, task, ai, counter) => {
    try {
      const token = sessionStorage.getItem("token");

      console.log(taskPrompt);
      console.log(counter);
      const res = await axios.get(`/AGI/GenerateTask`, {
        headers: {
          Authorization: `Bearer ${token}`,
          TaskPrompt: `${taskPrompt}`,
          TaskCounter: `${counter}`,
          ChosenAI: `${ai}`,
        },
      });

      console.log(res);
      console.log(res.data);

      if (task) {
        task.tasks = res.data;
        const updatedTask = task
          ? { ...task, tasks: res.data }
          : { tasks: res.data };
        const updatedTasks = updateTaskInEditedTasks(editedTasks, updatedTask);

        setEditedTasks(updatedTasks);
      } else {
        setEditedTasks(res.data);
      }
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

  const generateSubtask = async (taskPrompt, task, ai, counter) => {
    try {
      const token = sessionStorage.getItem("token");

      console.log(taskPrompt);
      console.log(counter);
      const res = await axios.get(`/AGI/GenerateSubtask`, {
        headers: {
          Authorization: `Bearer ${token}`,
          TaskPrompt: `${taskPrompt}`,
          TaskCounter: `${counter}`,
          ChosenAI: `${ai}`,
        },
      });

      console.log(res);
      console.log(res.data);

      if (task) {
        task.tasks = res.data;
        const updatedTask = task
          ? { ...task, tasks: res.data }
          : { tasks: res.data };
        const updatedTasks = updateTaskInEditedTasks(editedTasks, updatedTask);

        setEditedTasks(updatedTasks);
      } else {
        setEditedTasks(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="overlay">
      <div className="popup agi-popup">
        <span className="close-btn" onClick={onCancel}>
          {closeIcon}
        </span>
        <div className="gt-popup-content">
          {editedTasks.length > 0 ? (
            <>
              {editedTasks.map((editedTask, index) => (
                <TaskRecursive
                  deepness={0}
                  key={index}
                  task={editedTask}
                  generateSubtask={generateSubtask}
                  handleTitleChange={handleTitleChange}
                  handleDescriptionChange={handleDescriptionChange}
                  handleDueDateChange={handleDueDateChange}
                  editedTasks={editedTasks}
                />
              ))}
              <div className="gt-button-container">
                <button className="save-button" onClick={saveToDatabase}>
                  Save
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="gt-input-container">
                <h3>Give me a task to generate tickets about:</h3>
                <input
                  type="text"
                  placeholder="Enter task title"
                  ref={taskTitleInputRef}
                />
                <div className="gt-action-buttons">
                  <div className="dropdown-container">
                    <p>How many tasks do you want to generate?</p>
                    <Dropdown
                      options={counterOptions}
                      value={taskCounter}
                      onChange={(selectedOption) =>
                        setTaskCounter(selectedOption)
                      }
                    />
                  </div>
                  <div className="dropdown-container">
                    <p>Which AI do you want to use?</p>
                    <Dropdown
                      options={aiOptions}
                      value={chosenAI}
                      onChange={(selectedOption) => setChosenAI(selectedOption)}
                    />
                  </div>
                  <button
                    className="generate-button"
                    onClick={() =>
                      generateTask(
                        taskTitleInputRef.current.value,
                        null,
                        chosenAI.value,
                        taskCounter.value
                      )
                    }
                  >
                    Generate tasks
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const TaskRecursive = ({
  deepness,
  task,
  index,
  generateSubtask,
  handleTitleChange,
  handleDescriptionChange,
  handleDueDateChange,
  editedTasks,
}) => {
  const aiOptions = [
    { value: "chatgpt", label: "ChatGPT" },
    { value: "llama", label: "Llama" },
    { value: "bard", label: "Bard" },
  ];
  let [chosenAI, setChosenAI] = useState(aiOptions[0]);
  const counterOptions = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: "5" },
    { value: "6", label: "6" },
    { value: "7", label: "7" },
    { value: "8", label: "8" },
    { value: "9", label: "9" },
    { value: "10", label: "10" },
  ];
  let [taskCounter, setTaskCounter] = useState(counterOptions[0]);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const generateSubtaskPrepare = (task) => {
    console.log(chosenAI);
    generateSubtask(
      `${task.description}, due_date: '${task.due_date ? task.due_date : "-"}'`,
      task,
      chosenAI.value,
      taskCounter.value
    );
  };

  return (
    <div
      className={
        deepness > 0 ? "gt-input-container gt-space" : "gt-input-container"
      }
      key={index}
    >
      <h3>
        {editedTasks.length > 0
          ? `Generate subtasks for "${task.title}" task`
          : "Generate task"}
      </h3>
      <div className="gt-attributes-container">
        <div className="gt-attributes">
          <p className="title">Title:</p>
          {!task.task_id ? (
            <textarea
              type="text"
              value={task.title}
              onChange={(e) => handleTitleChange(task, e.value)}
            />
          ) : (
            <p className="value">{task.title}</p>
          )}
        </div>
        <div className="gt-attributes">
          <p className="title">Description:</p>
          {!task.task_id ? (
            <textarea
              value={task.description}
              onChange={(e) => handleDescriptionChange(task, e.value)}
            />
          ) : (
            <p className="value">{task.description}</p>
          )}
        </div>
        <div className="gt-attributes">
          <p className="title">Due date:</p>
          {!task.task_id ? (
            <DatePicker
              selected={task.due_date ? new Date(task.due_date) : null}
              onChange={(date) => handleDueDateChange(task, formatDate(date))}
              showTimeSelect
              dateFormat="yyyy-MM-dd HH:mm:ss"
              timeFormat="HH:mm:ss"
            />
          ) : (
            <p className="value">{task.due_date}</p>
          )}
        </div>
      </div>
      <div className="gt-action-buttons">
        <div className="dropdown-container">
          <p>How many subtasks do you want to generate?</p>
          <Dropdown
            options={counterOptions}
            value={taskCounter}
            onChange={(selectedOption) => setTaskCounter(selectedOption)}
          />
        </div>
        <div className="dropdown-container">
          <p>Which AI do you want to use?</p>
          <Dropdown
            options={aiOptions}
            value={chosenAI}
            onChange={(selectedOption) => setChosenAI(selectedOption)}
          />
        </div>
        <button
          className="generate-button"
          onClick={() => generateSubtaskPrepare(task)}
        >
          Generate Subtasks
        </button>
      </div>
      {task.tasks && task.tasks.length > 0 && (
        <div className="subtasks">
          <h2>Generated Subtasks:</h2>
          {task.tasks.map((subtask, subtaskIndex) => (
            <TaskRecursive
              deepness={deepness + 1}
              key={subtaskIndex}
              task={subtask}
              generateSubtask={generateSubtask}
              handleTitleChange={handleTitleChange}
              handleDescriptionChange={handleDescriptionChange}
              handleDueDateChange={handleDueDateChange}
              editedTasks={editedTasks}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GenerateTaskWithAGIPopup;
