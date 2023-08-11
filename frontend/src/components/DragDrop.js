import React, { useState, useRef, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Card, plusIcon } from "./Card";
import { useDrop, useDrag } from "react-dnd";
import ConfirmationPopup from "./ConfirmationPopup";
import GenerateTaskWithAGIPopup from "./GenerateTaskWithAGIPopup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faXmark,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/dragdrop.css";
import { useNavigate, useParams } from "react-router";
import axios from "../api/axios";
import Error from "./Error";
import cloneDeep from "lodash/cloneDeep";

export const aiIcon = <FontAwesomeIcon icon={faWandMagicSparkles} />;

const DragDrop = () => {
  const { board_id } = useParams();
  const [permission, setPermission] = useState(false);
  const [error, setError] = useState(false);
  const [board, setBoard] = useState([]);

  useEffect(() => {
    fetchBoardData();
  }, []);

  const fetchBoardData = async () => {
    const token = sessionStorage.getItem("token");

    try {
      const response = await axios.get(`/boards/${board_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPermission(true);
      let tempBoard = response.data.board;
      const user_id = sessionStorage.getItem("user_id");
      const response1 = await axios.get(`/favourite/${user_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let tempColumns = tempBoard.columns.map((column) => {
        const tasks = column.tasks.map((task) => {
          const is_favourite = response1.data.favourites.some(
            (favourite) => favourite.task_id === task.task_id
          );
          return { ...task, is_favourite };
        });
        return { ...column, tasks };
      });
      tempBoard.columns = tempColumns;

      setBoard(tempBoard);
    } catch (e) {
      console.error(e);
      if (e.response.status === 403) setError("No permission");
      else setError("Board not found");
      setPermission(false);
    }
  };

  const checkIcon = <FontAwesomeIcon icon={faCheck} />;
  const xMarkIcon = <FontAwesomeIcon icon={faXmark} />;

  const Column = ({ divIndex, moveColumn, children }) => {
    const [{ isDragging }, drag] = useDrag({
      type: "DIV",
      item: { index: divIndex },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const [, drop] = useDrop({
      accept: "DIV",
      hover(item, monitor) {
        const sourceDivIndex = item.index;
        const targetDivIndex = divIndex;

        if (sourceDivIndex === targetDivIndex) {
          return;
        }

        moveColumn(sourceDivIndex, targetDivIndex);
        item.index = targetDivIndex;
      },
    });

    const opacity = isDragging ? 0.5 : 1;
    const display = "flex";

    return (
      <div ref={(node) => drag(drop(node))} style={{ opacity, display }}>
        {children}
      </div>
    );
  };

  const [editingColumnIndex, setEditingColumnIndex] = useState(null);
  const [showDeleteConfirmation, setShowDeleteColumnConfirmation] =
    useState(false);
  const [columnToDeleteIndex, setColumnToDeleteIndex] = useState(null);
  const originalTitle = useRef(null);
  const editBoxRef = useRef(null);
  const [showGenerateTaskWithAGIPopup, setShowGenerateTaskWithAGIPopup] =
    useState(false);

  const [columnNewTitle, setColumnNewTitle] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);

  const moveCard = (dragIndex, hoverIndex, sourceDivIndex, targetDivIndex) => {
    const sourceDiv = board.columns[sourceDivIndex];
    const targetDiv = board.columns[targetDivIndex];
    const draggedCard = sourceDiv.tasks[dragIndex];

    // Remove the card from the source div
    sourceDiv.tasks.splice(dragIndex, 1);
    // Add the card to the target div at the hover index
    targetDiv.tasks.splice(hoverIndex, 0, draggedCard);

    // Update the state for both source and target divs
    const newBoardData = [...board.columns];
    newBoardData[sourceDivIndex] = { ...sourceDiv };
    newBoardData[targetDivIndex] = { ...targetDiv };
    setBoard({ ...board, columns: newBoardData });
  };

  const handleAddCard = async (divIndex) => {
    try {
      const newTask = {
        column_id: board.columns[divIndex].column_id,
        title: `New Task`,
        description: `Description of New Card in ${board.columns[divIndex].name}`,
      };

      const board_id = board.columns[divIndex].board_id;
      const token = sessionStorage.getItem("token");
      const res = await axios.post(`/boards/${board_id}/task`, newTask, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const createdTask = res.data.task;
      createdTask.board_id = board_id;
      const newBoardData = [...board.columns];
      newBoardData[divIndex].tasks.push(createdTask);
      console.log(newBoardData[divIndex].tasks);
      setBoard({ ...board, columns: newBoardData });
    } catch (e) {
      console.log(e.response.status);
      alert(e.response.data.error);
    }
  };

  const handleDeleteCard = async (taskId, divIndex) => {
    try {
      const board_id = board.columns[divIndex].board_id;
      const token = sessionStorage.getItem("token");
      await axios.delete(`/boards/${board_id}/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const targetDiv = board.columns[divIndex];
      const updatedtasks = targetDiv.tasks.filter(
        (task) => task.task_id !== taskId
      );

      const newBoardData = [...board.columns];
      newBoardData[divIndex] = { ...targetDiv, tasks: updatedtasks };

      setBoard({ ...board, columns: newBoardData });
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddColumn = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const formData = new FormData();
      formData.append("name", "New Column");
      formData.append("is_finished", 0);
      formData.append("task_limit", 5);
      const res = await axios.post(`/boards/${board_id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const newColumn = res.data.column;
      newColumn.is_finished = 0;
      newColumn.task_limit = 5;
      newColumn.tasks = [];

      const newBoardData = [...board.columns, newColumn];
      setBoard({ ...board, columns: newBoardData });
    } catch (e) {
      console.error(e);
    }
  };

  const moveColumn = (dragIndex, hoverIndex) => {
    setEditingColumnIndex(null);
    console.log("dragIndex");
    console.log(dragIndex);
    console.log("hoverIndex");
    console.log(hoverIndex);
    const draggedDiv = board.columns[dragIndex];

    const newBoardData = [...board.columns];
    newBoardData.splice(dragIndex, 1);
    newBoardData.splice(hoverIndex, 0, draggedDiv);

    setBoard({ ...board, columns: newBoardData });
  };

  const handleColumnTitleChange = (event, columnIndex) => {
    const newTitle = event.target.value;

    // Check if the new title length is within the allowed range (3 to 20 characters)
    if (newTitle.length <= 20) {
      setColumnNewTitle(newTitle);
    } else if (newTitle.length > 20) {
      // Truncate the title to a maximum of 20 characters
      const truncatedTitle = newTitle.substring(0, 20);
      setColumnNewTitle(truncatedTitle);
    }
    // You can choose to handle the case when the new title length is less than 3, if desired.
    // In this example, the title will not be updated if it's less than 3 characters.
  };

  const handleColumnTitleBlur = async (columnIndex, isCancelled) => {
    setEditingColumnIndex(null);
    if (isCancelled) {
      // Reset the title if the changes were cancelled
      const newColumnData = [...board.columns];
      newColumnData[columnIndex].name = originalTitle.current;
      setBoard({ ...board, columns: newColumnData });
    } else {
      // Update the title if the changes were saved
      if (columnNewTitle === "") {
        // Reset the title if the changes were cancelled
        try {
          const token = sessionStorage.getItem("token");
          const column_id = board.columns[columnIndex].column_id;
          await axios.put(
            `/boards/column/${column_id}`,
            { name: columnNewTitle },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const newColumnData = [...board.columns];
          newColumnData[columnIndex].name = originalTitle.current;
          setBoard({ ...board, columns: newColumnData });
        } catch (e) {
          console.error(e);
        }
      } else {
        try {
          const token = sessionStorage.getItem("token");
          const column_id = board.columns[columnIndex].column_id;
          await axios.put(
            `/boards/column/${column_id}`,
            { name: columnNewTitle },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const newColumnData = [...board.columns];
          newColumnData[columnIndex].name = columnNewTitle;
          setBoard({ ...board, columns: newColumnData });
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click was outside the title edit input box
      if (editBoxRef.current && !editBoxRef.current.contains(event.target)) {
        handleColumnTitleBlur(editingColumnIndex);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [editingColumnIndex]);

  const handleColumnTitleDoubleClick = (columnIndex) => {
    originalTitle.current = board.columns[columnIndex].name;
    setColumnNewTitle(originalTitle.current);
    setEditingColumnIndex(columnIndex);
  };

  const handleDeleteButtonClick = (event, columnIndex) => {
    event.stopPropagation();
    setShowDeleteColumnConfirmation(true);
    setColumnToDeleteIndex(columnIndex);
  };

  const handleColumnDeleteConfirm = () => {
    console.log("confirm");

    try {
      const token = sessionStorage.getItem("token");
      const res = axios.delete(
        `/boards/${board_id}/columns/${board.columns[columnToDeleteIndex].column_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newBoardData = [...board.columns];
      newBoardData.splice(columnToDeleteIndex, 1);
      setBoard({ ...board, columns: newBoardData });
    } catch (e) {
      console.error(e);
    }

    setShowDeleteColumnConfirmation(false);
    setColumnToDeleteIndex(null);
  };

  const handleColumnDeleteCancel = () => {
    console.log("cancel");
    setShowDeleteColumnConfirmation(false);
    setColumnToDeleteIndex(null);
  };

  const openGenerateTaskWithAGIPopup = (task) => {
    setShowGenerateTaskWithAGIPopup(true);
    if (task) {
      setSelectedTask(cloneDeep([task]));
    }
  };

  const handleGenerateTaskCancel = () => {
    setShowGenerateTaskWithAGIPopup(false);
    setSelectedTask(null);
  };

  const favouriteCard = (id, divIndex) => {
    try {
      const token = sessionStorage.getItem("token");
      const res = axios.post(
        `/boards/${board_id}/tasks/${id}/favourite`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newBoardData = [...board.columns];
      newBoardData[divIndex].tasks.map((task) => {
        if (task.task_id === id) {
          task.is_favourite = true;
        }
      });
      setBoard({ ...board, columns: newBoardData });
    } catch (e) {
      console.error(e);
    }
  };

  const unFavouriteCard = (id, divIndex) => {
    try {
      const token = sessionStorage.getItem("token");
      const res = axios.delete(`/boards/${board_id}/tasks/${id}/favourite`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const newBoardData = [...board.columns];
      newBoardData[divIndex].tasks.map((task) => {
        if (task.task_id === id) {
          task.is_favourite = false;
        }
      });
      setBoard({ ...board, columns: newBoardData });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {permission === false ? (
        <Error error={error}></Error>
      ) : (
        <DndProvider backend={HTML5Backend}>
          {board.columns === undefined ? (
            <h1 className="loader">Loading...</h1>
          ) : (
            <div className="content col-10 col-s-10">
              <h1>{board.name}</h1>
              <div className="div-container">
                {board.columns.map((column, index) => (
                  <Column key={index} divIndex={index} moveColumn={moveColumn}>
                    <div className="card-container">
                      {editingColumnIndex === index ? (
                        <div className="name-edit">
                          <input
                            type="text"
                            value={columnNewTitle}
                            onChange={(event) =>
                              handleColumnTitleChange(event, index)
                            }
                            autoFocus
                            ref={editBoxRef} // Set the ref to the title edit input box
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleColumnTitleBlur(index);
                              } else if (e.key === "Escape") {
                                handleColumnTitleBlur(index, true); // Pass `true` to indicate that changes are cancelled
                              }
                            }}
                          />
                          <span
                            className="edit-action-button"
                            id="check-button"
                            onClick={() => handleColumnTitleBlur(index)}
                          >
                            {checkIcon}
                          </span>
                          <span
                            className="edit-action-button"
                            id="cancel-button"
                            onClick={() => handleColumnTitleBlur(index, true)}
                          >
                            {xMarkIcon}
                          </span>
                        </div>
                      ) : (
                        <>
                          <div
                            className="column-title-container"
                            onDoubleClick={() =>
                              handleColumnTitleDoubleClick(index)
                            }
                          >
                            <h2 className="card-title">{column.name}</h2>
                          </div>
                          {index === 0 && (
                            <span
                              className="edit-action-button"
                              onClick={() => openGenerateTaskWithAGIPopup(null)}
                            >
                              {aiIcon}
                            </span>
                          )}
                          <span
                            className="delete-column-button"
                            onClick={(e) => handleDeleteButtonClick(e, index)}
                          >
                            {xMarkIcon}
                          </span>
                        </>
                      )}
                      {column.tasks.map((task, taskIndex) => (
                        <Card
                          task={task}
                          key={task.task_id}
                          board_id={board_id}
                          id={task.task_id}
                          text={task.title}
                          description={task.description}
                          isFavourite={task.is_favourite === true}
                          index={taskIndex}
                          divName={`div${index + 1}`}
                          moveCard={(
                            dragIndex,
                            hoverIndex,
                            sourceDiv,
                            targetDiv
                          ) =>
                            moveCard(
                              dragIndex,
                              hoverIndex,
                              parseInt(sourceDiv.substr(3)) - 1,
                              parseInt(targetDiv.substr(3)) - 1
                            )
                          }
                          deleteCard={(taskId, divName) =>
                            handleDeleteCard(taskId, index)
                          }
                          favouriteCard={(taskId, divName) =>
                            task.is_favourite === false
                              ? favouriteCard(taskId, index)
                              : unFavouriteCard(taskId, index)
                          }
                          generateTasks={(task) =>
                            openGenerateTaskWithAGIPopup(task)
                          }
                        />
                      ))}
                      {column.is_finished === 0 ? (
                        <div
                          className="addbtn"
                          onClick={() => handleAddCard(index)}
                        >
                          {plusIcon} Add new task
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>
                  </Column>
                ))}
                <div className="addbtn-column" onClick={handleAddColumn}>
                  {plusIcon} Add new column
                </div>
              </div>
            </div>
          )}
          {showGenerateTaskWithAGIPopup && (
            <GenerateTaskWithAGIPopup
              tasks={selectedTask}
              onCancel={handleGenerateTaskCancel}
            />
          )}
          {showDeleteConfirmation && (
            <ConfirmationPopup
              text={board.columns[columnToDeleteIndex]?.title}
              onCancel={handleColumnDeleteCancel}
              onConfirm={handleColumnDeleteConfirm}
            />
          )}
        </DndProvider>
      )}
    </>
  );
};

export default DragDrop;
