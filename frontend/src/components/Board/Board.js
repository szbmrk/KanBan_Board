import React, { useState, useRef, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Task, plusIcon } from "./Task";
import ConfirmationPopup from "./ConfirmationPopup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faXmark,
  faWandMagicSparkles,
  faEllipsis,
  faTrash,
  faPenRuler,
  faCode,
  faFileLines,
  faClipboard,
  faFilter,
  faFilterCircleXmark,
  faSort,
} from "@fortawesome/free-solid-svg-icons";
import "../../styles/board.css";
import "../../styles/popup.css";
import "../../styles/titlebar.css";
import { useParams } from "react-router";
import axios from "../../api/axios";
import Error from "../Error";
import Loader from "../Loader";
import { Column } from "./Columns";
import Popup from "./Popup";
import cloneDeep from "lodash/cloneDeep";
import GenerateTaskWithAGIPopup from "../GenerateTaskWithAGIPopup";
import GenerateAttachmentLinkWithAGIPopup from "../GenerateAttachmentLinkWithAGIPopup";
import CraftPromptPopup from "../CraftPromptPopup";
import { useNavigate } from "react-router-dom";
import CodePopup from "../CodePopup";
import DocumentationPopup from "../DocumentationPopup";
import GeneratePerformanceSummaryPopup from "../GeneratePerformanceSummaryPopup";

export const documentationIcon = <FontAwesomeIcon icon={faFileLines} />;
export const aiIcon = <FontAwesomeIcon icon={faWandMagicSparkles} />;
export const dotsIcon = <FontAwesomeIcon icon={faEllipsis} />;
export const trashIcon = <FontAwesomeIcon icon={faTrash} />;

const Board = () => {
  const { board_id, column_to_show_id, task_to_show_id } = useParams();
  const [permission, setPermission] = useState(false);
  const [error, setError] = useState(false);
  const [board, setBoard] = useState([]);
  const [columnPositions, setColumnPositions] = useState([]);
  const [editingColumnIndex, setEditingColumnIndex] = useState(null);
  const [columnToDeleteIndex, setColumnToDeleteIndex] = useState(null);
  const [showDeleteConfirmation, setShowDeleteColumnConfirmation] =
    useState(false);
  const originalTitle = useRef(null);
  const editBoxRef = useRef(null);
  const [columnNewTitle, setColumnNewTitle] = useState("");
  const [showGenerateTaskWithAGIPopup, setShowGenerateTaskWithAGIPopup] =
    useState(false);
  const [
    showGenerateAttachmentLinkWithAGIPopup,
    setShowGenerateAttachmentLinkWithAGIPopup,
  ] = useState(false);
  const [columnZIndex, setColumnZIndex] = useState(1);
  const [iconContainerPosition, setIconContainerPosition] = useState({
    x: 0,
    y: 0,
  });
  const [showIconContainer, setShowIconContainer] = useState(false);
  const [showCraftPromptPopup, setShowCraftPromptPopup] = useState(false);
  const [
    showGeneratePerformanceSummaryPopup,
    setShowGeneratePerformanceSummaryPopup,
  ] = useState(false);
  const [showCodePopup, setShowCodePopup] = useState(false);
  const [showDocumentationPopup, setShowDocumentationPopup] = useState(false);
  const [isHoveredAI, setIsHoveredAI] = useState(-1);
  const [isHoveredClipboard, setIsHoveredClipboard] = useState(-1);
  const [isHoveredCode, setIsHoveredCode] = useState(false);
  const [isHoveredCraft, setIsHoveredCraft] = useState(false);
  const [isHoveredPerformanceSummary, setIsHoveredPerformanceSummary] =
    useState(false);
  const [isHoveredDocumentation, setIsHoveredDocumentation] = useState(false);
  const [isHoveredX, setIsHoveredX] = useState(false);
  const [columnIndex, setColumnIndex] = useState(null);
  const [priorities, setPriorities] = useState([]);
  const [redirect, setRedirect] = useState(false);
  const [craftedPrompts, setCraftedPrompts] = useState([]);
  const [craftedPromptsBoard, setCraftedPromptsBoard] = useState([]);
  const [craftedPromptsTask, setCraftedPromptsTask] = useState([]);
  const [isHoveredAITitleBar, setIsHoveredAITitleBar] = useState([]);
  const [codeReviewOrDocumentations, setCodeReviewOrDocumentation] = useState(
    []
  );
  const navigate = useNavigate();
  const [hoveredColumnId, setHoveredColumnId] = useState(null);
  const [isAGIOpen, setIsAGIOpen] = useState(false);
  const checkIcon = <FontAwesomeIcon icon={faCheck} />;
  const xMarkIcon = <FontAwesomeIcon icon={faXmark} />;
  const codeIcon = <FontAwesomeIcon icon={faCode} />;
  const craftIcon = <FontAwesomeIcon icon={faPenRuler} />;
  const clipboardIcon = <FontAwesomeIcon icon={faClipboard} />;
  const filterIcon = <FontAwesomeIcon icon={faFilter} />;
  const filterDeleteIcon = <FontAwesomeIcon icon={faFilterCircleXmark} />;
  const sortIcon = <FontAwesomeIcon icon={faSort} />;

  const token = sessionStorage.getItem("token");
  const team_member = JSON.parse(sessionStorage.getItem("team_members"));

  useEffect(() => {
    document.title = "Board";

    reloadPriorities();

    fetchBoardData();

    reloadCraftedPrompts();

    reloadCodeReviewOrDocumentation();
    //setOwnPermissions(team_member.teams.filter(team => team.team_id === data.team_id).map(permission => permission.permission_data));
  }, []);

  useEffect(() => {
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

  const reloadPriorities = async () => {
    try {
      const prioritiesResponse = await axios.get("/priorities", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(prioritiesResponse);
      setPriorities(prioritiesResponse.data.priorities);
    } catch (e) {
      console.error(e);
      if (e.response.status === 401 || e.response.status === 500) {
        setError("You are not logged in! Redirecting to login page...");
        setRedirect(true);
      } else {
        setError(e.message);
      }
      if (e.response.status === 403) setError("No permission");
      else setError(e.message);
    }
  };

  const fetchBoardData = async () => {
    try {
      const response = await axios.get(`/boards/${board_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPermission(true);
      let tempBoard = response.data.board;
      let tempColumns = tempBoard.columns;

      // Sort the columns and tasks by position
      tempColumns.map((column) =>
        column.tasks.sort((a, b) => a.position - b.position)
      );
      tempBoard.columns = tempColumns.sort((a, b) => a.position - b.position);
      let tempColumnPositions = tempBoard.columns.map(
        (column) => column.column_id
      );
      setColumnPositions(tempColumnPositions);

      console.log("Columns: ", tempBoard.columns);

      setBoard(tempBoard);
      console.log("tempBoard");
      console.log(tempBoard);

      if (task_to_show_id) {
        const columnIndex = tempBoard.columns.findIndex(
          (column) => column.column_id === parseInt(column_to_show_id)
        );
        const task = findTaskById(
          tempBoard.columns[columnIndex].tasks,
          parseInt(task_to_show_id)
        );
        if (task) {
          setTaskAsInspectedTask(task);
        }
        navigate(`/board/${board_id}`);
      }
    } catch (e) {
      console.error(e);
      if (e.response.status === 401 || e.response.status === 500) {
        setError("You are not logged in! Redirecting to login page...");
        setRedirect(true);
      } else {
        setError(e.message);
      }
      if (e.response.status === 403) setError("No permission");
      else setError(e.message);
      setPermission(false);
    }
  };

  const handleAddColumn = async () => {
    try {
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
      let tempPositions = columnPositions;
      tempPositions.push(newColumn.column_id);
      setColumnPositions(tempPositions);
      setBoard({ ...board, columns: newBoardData });
    } catch (e) {
      console.error(e);
      if (e.response.status === 401 || e.response.status === 500) {
        setError("You are not logged in! Redirecting to login page...");
        setRedirect(true);
      } else {
        setError(e.message);
      }
    }
  };

  const moveColumnBackend = async (dragIndex, hoverIndex) => {
    try {
      setEditingColumnIndex(null);

      let tempPositions = columnPositions;
      tempPositions.splice(
        hoverIndex,
        0,
        tempPositions.splice(dragIndex, 1)[0]
      );
      axios.post(
        `/boards/${board_id}/columns/positions`,
        { columns: tempPositions },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (e) {
      console.error(e);
      if (e.response.status === 401 || e.response.status === 500) {
        setError("You are not logged in! Redirecting to login page...");
        setRedirect(true);
      } else {
        setError(e.message);
      }
    }
  };

  const moveColumnFrontend = (dragIndex, hoverIndex) => {
    try {
      setEditingColumnIndex(null);
      const draggedDiv = board.columns[dragIndex];
      const newBoardData = [...board.columns];
      newBoardData.splice(dragIndex, 1);
      newBoardData.splice(hoverIndex, 0, draggedDiv);

      setBoard({ ...board, columns: newBoardData });
    } catch (e) {
      console.error(e);
      if (e.response.status === 401 || e.response.status === 500) {
        setError("You are not logged in! Redirecting to login page...");
        setRedirect(true);
      } else {
        setError(e.message);
      }
    }
  };

  const handleDeleteButtonClick = (event, columnIndex) => {
    event.stopPropagation();
    setShowDeleteColumnConfirmation(true);
    setColumnToDeleteIndex(columnIndex);
    setShowIconContainer(false);
  };

  const handleColumnDeleteConfirm = () => {
    console.log("confirm");

    try {
      axios.delete(
        `/boards/${board_id}/columns/${board.columns[columnToDeleteIndex].column_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newBoardData = [...board.columns];
      newBoardData.splice(columnToDeleteIndex, 1);
      setColumnPositions(newBoardData.map((column) => column.column_id));
      setBoard({ ...board, columns: newBoardData });
    } catch (e) {
      console.error(e);
      if (e.response.status === 401 || e.response.status === 500) {
        setError("You are not logged in! Redirecting to login page...");
        setRedirect(true);
      } else {
        setError(e.message);
      }
    }

    setShowDeleteColumnConfirmation(false);
    setColumnToDeleteIndex(null);
  };

  const handleColumnDeleteCancel = () => {
    console.log("cancel");
    setShowDeleteColumnConfirmation(false);
    setColumnToDeleteIndex(null);
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

  const handleColumnTitleDoubleClick = (columnIndex) => {
    originalTitle.current = board.columns[columnIndex].name;
    setColumnNewTitle(originalTitle.current);
    setEditingColumnIndex(columnIndex);
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
          if (e.response.status === 401 || e.response.status === 500) {
            setError("You are not logged in! Redirecting to login page...");
            setRedirect(true);
          } else {
            setError(e.message);
          }
        }
      } else {
        try {
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
          if (e.response.status === 401 || e.response.status === 500) {
            setError("You are not logged in! Redirecting to login page...");
            setRedirect(true);
          } else {
            setError(e.message);
          }
        }
      }
    }
  };

  const handleAddTask = async (divIndex) => {
    try {
      const newTask = {
        column_id: board.columns[divIndex].column_id,
        title: `New Task`,
        description: `Description of New Card in ${board.columns[divIndex].name}`,
      };

      const board_id = board.columns[divIndex].board_id;
      const res = await axios.post(`/boards/${board_id}/task`, newTask, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const createdTask = res.data.task;
      createdTask.board_id = board_id;
      const newBoardData = [...board.columns];
      newBoardData[divIndex].tasks.push(createdTask);
      setBoard({ ...board, columns: newBoardData });
    } catch (e) {
      console.log(e.response.status);
      alert(e.response.data.error);
      if (e.response.status === 401 || e.response.status === 500) {
        setError("You are not logged in! Redirecting to login page...");
        setRedirect(true);
      } else {
        setError(e.message);
      }
    }
  };

  const moveCardFrontend = (
    dragIndex,
    hoverIndex,
    sourceDivIndex,
    targetDivIndex
  ) => {
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

  const moveCardBackend = async (
    dragIndex,
    hoverIndex,
    sourceDivIndex,
    targetDivIndex
  ) => {
    const sourceDiv = board.columns[sourceDivIndex];
    const targetDiv = board.columns[targetDivIndex];
    const task_to_modify_id = sourceDiv.tasks[hoverIndex].task_id;
    const from_column_id = targetDiv.column_id;
    const to_column_id = sourceDiv.column_id;
    if (hoverIndex === 0) {
      sourceDiv.tasks[hoverIndex].position =
        sourceDiv.tasks[hoverIndex + 1].position / 2;
    } else if (hoverIndex === sourceDiv.tasks.length - 1) {
      sourceDiv.tasks[hoverIndex].position =
        sourceDiv.tasks[hoverIndex - 1].position + 1;
    } else {
      sourceDiv.tasks[hoverIndex].position =
        (sourceDiv.tasks[hoverIndex - 1].position +
          sourceDiv.tasks[hoverIndex + 1].position) /
        2;
    }

    const position = sourceDiv.tasks[hoverIndex].position;
    console.log(position);

    try {
      await axios.post(
        `/columns/${from_column_id}/tasks/positions`,
        {
          tasks: [
            {
              task_id: task_to_modify_id,
              position: position,
              column_id: to_column_id,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (e) {
      const sourceDiv = board.columns[sourceDivIndex];
      const targetDiv = board.columns[targetDivIndex];
      const draggedCard = sourceDiv.tasks[hoverIndex];

      // Remove the card from the source div
      sourceDiv.tasks.splice(hoverIndex, 1);
      // Add the card to the target div at the hover index
      targetDiv.tasks.splice(dragIndex, 0, draggedCard);

      // Update the state for both source and target divs
      const newBoardData = [...board.columns];
      newBoardData[sourceDivIndex] = { ...sourceDiv };
      newBoardData[targetDivIndex] = { ...targetDiv };
      setBoard({ ...board, columns: newBoardData });

      alert(e.response.data.error);
      if (e.response.status === 401 || e.response.status === 500) {
        setError("You are not logged in! Redirecting to login page...");
        setRedirect(true);
      } else {
        setError(e.message);
      }
    }
  };

  const handleEditTask = async (task_id, column_id, title, description) => {
    try {
      await axios.put(
        `/boards/${board_id}/tasks/${task_id}`,
        { title: title, description: description },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const newTaskData = [...board.columns];
      const columnIndex = newTaskData.findIndex(
        (column) => column.column_id === column_id
      );
      const taskIndex = newTaskData[columnIndex].tasks.findIndex(
        (task) => task.task_id === task_id
      );
      newTaskData[columnIndex].tasks[taskIndex].title = title;
      newTaskData[columnIndex].tasks[taskIndex].description = description;
      setBoard({ ...board, columns: newTaskData });
    } catch (e) {
      console.log(e);
      if (e.response.status === 401 || e.response.status === 500) {
        setError("You are not logged in! Redirecting to login page...");
        setRedirect(true);
      } else {
        setError(e.message);
      }
    }
  };

  const handleDeleteTask = async (taskId, column_id) => {
    try {
      await axios.delete(`/boards/${board_id}/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const targetDiv = board.columns.find(
        (column) => column.column_id === column_id
      );
      const updatedtasks = targetDiv.tasks.filter(
        (task) => task.task_id !== taskId
      );
      const newColumnData = [...board.columns];
      const columnIndex = newColumnData.findIndex(
        (column) => column.column_id === column_id
      );
      newColumnData[columnIndex] = { ...targetDiv, tasks: updatedtasks };
      setBoard({ ...board, columns: newColumnData });
    } catch (e) {
      console.error(e);
      if (e.response.status === 401 || e.response.status === 500) {
        setError("You are not logged in! Redirecting to login page...");
        setRedirect(true);
      } else {
        setError(e.message);
      }
    }
  };

  const handleFavouriteTask = (id, column_id) => {
    try {
      axios.post(
        `/boards/${board_id}/tasks/${id}/favourite`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newBoardData = [...board.columns];
      newBoardData.map((column) => {
        if (column.column_id === column_id) {
          column.tasks.map((task) => {
            if (task.task_id === id) {
              task.is_favourite = true;
            }
          });
        }
      });
      setBoard({ ...board, columns: newBoardData });
    } catch (e) {
      console.error(e);
      if (e.response.status === 401 || e.response.status === 500) {
        setError("You are not logged in! Redirecting to login page...");
        setRedirect(true);
      } else {
        setError(e.message);
      }
    }
  };

  const handleUnFavouriteTask = (id, column_id) => {
    try {
      axios.delete(`/boards/${board_id}/tasks/${id}/favourite`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const newBoardData = [...board.columns];
      newBoardData.map((column) => {
        if (column.column_id === column_id) {
          column.tasks.map((task) => {
            if (task.task_id === id) {
              task.is_favourite = false;
            }
          });
        }
      });
      setBoard({ ...board, columns: newBoardData });
    } catch (e) {
      console.error(e);
      if (e.response.status === 401 || e.response.status === 500) {
        setError("You are not logged in! Redirecting to login page...");
        setRedirect(true);
      } else {
        setError(e.message);
      }
    }
  };

  const handleAddSubtask = async (parent_task_id, column_id) => {
    try {
      const response = await axios.post(
        `/boards/${board_id}/tasks/${parent_task_id}/subtasks`,
        { title: "New subtask" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const newSubtask = response.data.task;
      const newBoardData = [...board.columns];
      const columnIndex = newBoardData.findIndex(
        (column) => column.column_id === column_id
      );
      const task = findTaskById(
        newBoardData[columnIndex].tasks,
        parent_task_id
      );
      task.subtasks.push(newSubtask);
      setBoard({ ...board, columns: newBoardData });
    } catch (e) {
      console.log(e);
      if (e.response.status === 401 || e.response.status === 500) {
        setError("You are not logged in! Redirecting to login page...");
        setRedirect(true);
      } else {
        setError(e.message);
      }
    }
  };

  const handleDeleteSubtask = async (subtask_id, parent_task_id, column_id) => {
    try {
      await axios.delete(`/boards/${board_id}/subtasks/${subtask_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const newBoardData = [...board.columns];
      const columnIndex = newBoardData.findIndex(
        (column) => column.column_id === column_id
      );
      const task = findTaskById(
        newBoardData[columnIndex].tasks,
        parent_task_id
      );
      task.subtasks.splice(
        task.subtasks.findIndex((subtask) => subtask.task_id === subtask_id),
        1
      );
      setBoard({ ...board, columns: newBoardData });
    } catch (e) {
      console.error(e);
      if (e.response.status === 401 || e.response.status === 500) {
        setError("You are not logged in! Redirecting to login page...");
        setRedirect(true);
      } else {
        setError(e.message);
      }
    }
  };

  const handleEditSubtask = async (
    subtask_id,
    parent_task_id,
    column_id,
    title,
    description
  ) => {
    try {
      await axios.put(
        `/boards/${board_id}/subtasks/${subtask_id}`,
        { title: title, description: description },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const newBoardData = [...board.columns];
      const columnIndex = newBoardData.findIndex(
        (column) => column.column_id === column_id
      );
      const task = findTaskById(
        newBoardData[columnIndex].tasks,
        parent_task_id
      );
      task.subtasks.map((subtask) => {
        if (subtask.task_id === subtask_id) {
          subtask.title = title;
          subtask.description = description;
        }
      });
      setBoard({ ...board, columns: newBoardData });

      handleOpenPreviousTask(parent_task_id, column_id);
    } catch (e) {
      console.log(e);
      if (e.response.status === 401 || e.response.status === 500) {
        setError("You are not logged in! Redirecting to login page...");
        setRedirect(true);
      } else {
        setError(e.message);
      }
    }
  };

  const handleFavouriteSubtask = (subtask_id, parent_task_id, column_id) => {
    try {
      axios.post(
        `/boards/${board_id}/tasks/${subtask_id}/favourite`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const newBoardData = [...board.columns];
      const columnIndex = newBoardData.findIndex(
        (column) => column.column_id === column_id
      );
      const task = findTaskById(
        newBoardData[columnIndex].tasks,
        parent_task_id
      );
      task.subtasks.map((subtask) => {
        if (subtask.task_id === subtask_id) {
          subtask.is_favourite = true;
        }
      });
      setBoard({ ...board, columns: newBoardData });
    } catch (e) {
      console.error(e);
      if (e.response.status === 401 || e.response.status === 500) {
        setError("You are not logged in! Redirecting to login page...");
        setRedirect(true);
      } else {
        setError(e.message);
      }
    }
  };

  const handleUnFavouriteSubtask = (subtask_id, parent_task_id, column_id) => {
    try {
      axios.delete(`/boards/${board_id}/tasks/${subtask_id}/favourite`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const newBoardData = [...board.columns];
      const columnIndex = newBoardData.findIndex(
        (column) => column.column_id === column_id
      );
      const task = findTaskById(
        newBoardData[columnIndex].tasks,
        parent_task_id
      );
      task.subtasks.map((subtask) => {
        if (subtask.task_id === subtask_id) {
          subtask.is_favourite = false;
        }
      });
      setBoard({ ...board, columns: newBoardData });
    } catch (e) {
      console.error(e);
      if (e.response.status === 401 || e.response.status === 500) {
        setError("You are not logged in! Redirecting to login page...");
        setRedirect(true);
      } else {
        setError(e.message);
      }
    }
  };

  const postComment = async (task_id, column_id, comment) => {
    try {
      const response = await axios.post(
        `/tasks/${task_id}/comments`,
        { text: comment },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const newComment = response.data.comment;
      const newBoardData = [...board.columns];
      const columnIndex = newBoardData.findIndex(
        (column) => column.column_id === column_id
      );
      const task = findTaskById(newBoardData[columnIndex].tasks, task_id);
      task.comments.push(newComment);
      setBoard({ ...board, columns: newBoardData });
    } catch (e) {
      console.log(e);
      if (e.response.status === 401 || e.response.status === 500) {
        setError("You are not logged in! Redirecting to login page...");
        setRedirect(true);
      } else {
        setError(e.message);
      }
    }
  };

  //popup
  const [showPopup, setShowPopup] = useState(false);
  const [inspectedTask, setInspectedTask] = useState(null);
  const [inspectedColumn, setInspectedColumn] = useState(null);
  const [
    inspectedCodeReviewOrDocumentation,
    setInspectedCodeReviewOrDocumentation,
  ] = useState(null);
  const [inspectedAttachmentLinks, setInspectedAttachmentLinks] =
    useState(null);
  const setTaskAsInspectedTask = (task) => {
    setInspectedTask(task);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleOpenPreviousTask = (previousTask_id, column_id) => {
    setShowPopup(false);
    const tasks = board.columns.find(
      (column) => column.column_id === column_id
    ).tasks;
    const previousTask = findTaskById(tasks, previousTask_id);
    setInspectedTask(previousTask);
    setShowPopup(true);
  };

  const handleSavePopup = async (
    task_id,
    parent_task_id,
    column_id,
    newTitle,
    newDescription
  ) => {
    if (parent_task_id === null) {
      await handleEditTask(task_id, column_id, newTitle, newDescription);
      setShowPopup(false);
    } else {
      await handleEditSubtask(
        task_id,
        parent_task_id,
        column_id,
        newTitle,
        newDescription
      );
    }
  };

  const findTaskById = (tasks, targetId) => {
    for (const task of tasks) {
      if (task.task_id === targetId) {
        return task;
      }
      if (task.subtasks && task.subtasks.length > 0) {
        const foundTask = findTaskById(task.subtasks, targetId);
        if (foundTask) {
          return foundTask;
        }
      }
    }
    return null;
  };

  const openGenerateTaskWithAGIPopup = (task, column) => {
    console.log("column");
    console.log(column);

    setShowGenerateTaskWithAGIPopup(true);
    console.log(task);
    if (task) {
      if (Array.isArray(task)) {
        setInspectedTask(cloneDeep(task));
      } else {
        setInspectedTask([cloneDeep(task)]);
      }
    }
    setInspectedColumn(cloneDeep(column));
  };

  const handleGenerateTaskCancel = () => {
    setShowGenerateTaskWithAGIPopup(false);
    setInspectedTask(null);
    setInspectedColumn(null);
  };

  const openGenerateAttachmentLinkWithAGIPopup = (task, attachmentLink) => {
    setShowGenerateAttachmentLinkWithAGIPopup(true);
    console.log(task);
    if (task) {
      setInspectedTask(cloneDeep(task));
    }
    if (attachmentLink) {
      setInspectedAttachmentLinks(attachmentLink);
    }
  };

  const handleGenerateAttachmentLinkCancel = () => {
    setShowGenerateAttachmentLinkWithAGIPopup(false);
    setInspectedTask(null);
  };

  const reloadCraftedPrompts = async () => {
    try {
      const craftedPromptsResponse = await axios.get(
        `/boards/${board_id}/AGI/crafted-prompts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("crafted prompts");
      console.log(craftedPromptsResponse.data);
      setCraftedPrompts(craftedPromptsResponse.data);
      console.log("craftedPrompts");
      console.log(craftedPrompts);
      const boardPrompts = craftedPromptsResponse.data.filter(
        (prompt) => prompt.action === "GENERATETASK"
      );
      const taskPrompts = craftedPromptsResponse.data.filter(
        (prompt) =>
          prompt.action === "GENERATESUBTASK" ||
          prompt.action === "GENERATEATTACHMENTLINK"
      );

      setCraftedPromptsBoard(boardPrompts);
      setCraftedPromptsTask(taskPrompts);
      console.log(craftedPromptsBoard);
      console.log(craftedPromptsTask);
    } catch (e) {
      console.error(e);
      if (e.response.status === 401 || e.response.status === 500) {
        setError("You are not logged in! Redirecting to login page...");
        setRedirect(true);
      } else {
        setError(e.message);
      }
      if (e.response.status === 403) setError("No permission");
      else setError(e.message);
    }
  };

  const reloadCodeReviewOrDocumentation = async () => {
    try {
      const codeReviewOrDocumentationResponse = await axios.get(
        `/AGI/CodeReviewOrDocumentation/boards/${board_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("CodeReviewOrDocumentation:");
      console.log(codeReviewOrDocumentationResponse);
      console.log(codeReviewOrDocumentationResponse.data);
      setCodeReviewOrDocumentation(codeReviewOrDocumentationResponse.data);
    } catch (e) {
      console.error(e);
      if (e.response.status === 401 || e.response.status === 500) {
        setError("You are not logged in! Redirecting to login page...");
        setRedirect(true);
      } else {
        setError(e.message);
      }
      if (e.response.status === 403) setError("No permission");
      else setError(e.message);
    }
  };

  const openCraftPromptPopup = () => {
    setShowCraftPromptPopup(true);
  };
  const handleCraftPromptCancel = () => {
    setShowCraftPromptPopup(false);
  };

  const openCodePopup = (codeReviewOrDocumentation) => {
    setShowCodePopup(true);
    setInspectedCodeReviewOrDocumentation(codeReviewOrDocumentation);
    setIsAGIOpen(false);
    setIsHoveredCode(false);
  };

  const handleCodeCancel = () => {
    setShowCodePopup(false);
    setInspectedCodeReviewOrDocumentation(null);
  };

  const generateDocumentationForTask = (task) => {
    setInspectedTask(task);
    openDocumentationPopup();
  };

  const generateDocumentationForColumn = (column) => {
    setInspectedColumn(column);
    openDocumentationPopup();
  };

  const openDocumentationPopup = () => {
    setShowDocumentationPopup(true);
    setIsAGIOpen(false);
    setIsHoveredCode(false);
  };

  const handleDocumentationCancel = () => {
    setShowDocumentationPopup(false);
    setInspectedCodeReviewOrDocumentation(null);
    setInspectedTask(null);
    setInspectedColumn(null);
  };

  const deleteCodeReviewOrDocumentation = async (
    codeReviewOrDocumentationToDelete
  ) => {
    const deleteCodeReviewOrDocumentation = await axios.delete(
      `/AGI/CodeReviewOrDocumentation/boards/${board_id}/agiAnswer/${codeReviewOrDocumentationToDelete.agi_answer_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(deleteCodeReviewOrDocumentation);
    if (deleteCodeReviewOrDocumentation) {
      const filteredCodeReviewOrDocumentations =
        codeReviewOrDocumentations.filter(
          (codeReviewOrDocumentation) =>
            codeReviewOrDocumentation.agi_answer_id !==
            codeReviewOrDocumentationToDelete.agi_answer_id
        );
      setCodeReviewOrDocumentation(filteredCodeReviewOrDocumentations);
    }
  };

  const getCraftedPromptResult = async (craftedPrompt) => {
    const token = sessionStorage.getItem("token");

    return await axios.get(
      `/boards/${board_id}/AGI/crafted-prompts/${craftedPrompt.crafted_prompt_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  };

  const useCrafterPromptOnColumn = async (craftedPrompt, column) => {
    console.log("craftedPrompt");
    console.log(craftedPrompt);
    try {
      const res = await getCraftedPromptResult(craftedPrompt);

      console.log("res.data");
      console.log(res.data);

      switch (craftedPrompt.action) {
        case "GENERATETASK":
          openGenerateTaskWithAGIPopup(res.data, column);
          /* setShowGenerateTaskWithAGIPopup(true);
          setInspectedTask(res.data); */
          break;
        default:
          break;
      }

      console.log(res);
    } catch (e) {
      console.error(e);
      if (e.response.status === 401 || e.response.status === 500) {
        setError("You are not logged in! Redirecting to login page...");
        setRedirect(true);
      } else {
        setError(e.message);
      }
    }
  };

  const useCrafterPromptOnTask = async (craftedPrompt, task, column) => {
    console.log("craftedPrompt");
    console.log(craftedPrompt);

    try {
      const res = await getCraftedPromptResult(craftedPrompt);

      switch (craftedPrompt.action) {
        case "GENERATESUBTASK":
          task.tasks = res.data;
          /*           setShowGenerateTaskWithAGIPopup(true);
          setInspectedTask(task); */
          openGenerateTaskWithAGIPopup(task, column);
          break;
        case "GENERATEATTACHMENTLINK":
          /*           setShowGenerateTaskWithAGIPopup(true);
          setInspectedTask(res.data); */
          openGenerateAttachmentLinkWithAGIPopup(task, res.data);
          break;
        default:
          break;
      }

      console.log(res);
    } catch (e) {
      console.error(e);
      if (e.response.status === 401 || e.response.status === 500) {
        setError("You are not logged in! Redirecting to login page...");
        setRedirect(true);
      } else {
        setError(e.message);
      }
    }
  };

  const HandleCraftedPromptColumnClick = (craftedPrompt, column) => {
    useCrafterPromptOnColumn(craftedPrompt, column);
  };

  const HandleCraftedPromptTaskClick = (craftedPrompt, task, column) => {
    useCrafterPromptOnTask(craftedPrompt, task, column);
  };

  const handleDotsClick = (event, columnIndex) => {
    const buttonRect = event.target.getBoundingClientRect();
    const newX = buttonRect.right + 20;
    const newY = buttonRect.top;

    setColumnIndex(columnIndex);
    setIconContainerPosition({ x: newX, y: newY });
    setShowIconContainer(!showIconContainer);
    columnZIndex === 1 ? setColumnZIndex(100) : setColumnZIndex(1);
  };

  const handleModifyPriority = async (task_id, column_id, priority_id) => {
    try {
      const response = await axios.put(
        `/boards/${board_id}/tasks/${task_id}`,
        {
          priority_id: priority_id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newBoardData = [...board.columns];
      const columnIndex = newBoardData.findIndex(
        (column) => column.column_id === column_id
      );
      const task = findTaskById(newBoardData[columnIndex].tasks, task_id);
      const newTask = response.data.task;
      task.priority_id = newTask.priority_id;
      task.priority = newTask.priority;
      setBoard({ ...board, columns: newBoardData });
    } catch (e) {
      console.error(e);
      if (e.response.status === 401 || e.response.status === 500) {
        setError("You are not logged in! Redirecting to login page...");
        setRedirect(true);
      } else {
        setError(e.message);
      }
    }
  };

  const handleModifyDeadline = async (task_id, column_id, deadline) => {
    try {
      const response = await axios.put(
        `/boards/${board_id}/tasks/${task_id}`,
        {
          due_date: deadline,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newBoardData = [...board.columns];
      const columnIndex = newBoardData.findIndex(
        (column) => column.column_id === column_id
      );
      const task = findTaskById(newBoardData[columnIndex].tasks, task_id);
      const newTask = response.data.task;
      task.due_date = newTask.due_date;
      setBoard({ ...board, columns: newBoardData });
    } catch (e) {
      console.error(e);
      if (e.response.status === 401 || e.response.status === 500) {
        setError("You are not logged in! Redirecting to login page...");
        setRedirect(true);
      } else {
        setError(e.message);
      }
    }
  };

  const handleAddAttachment = async (task_id, column_id, link, description) => {
    try {
      const response = await axios.post(
        `/tasks/${task_id}/attachments`,
        { link: link, description: description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newAttachment = response.data.attachment;
      const newBoardData = [...board.columns];
      const columnIndex = newBoardData.findIndex(
        (column) => column.column_id === column_id
      );
      const task = findTaskById(newBoardData[columnIndex].tasks, task_id);
      task.attachments.push(newAttachment);
      setBoard({ ...board, columns: newBoardData });
    } catch (e) {
      console.error(e);
      if (e.response.status === 401 || e.response.status === 500) {
        setError("You are not logged in! Redirecting to login page...");
        setRedirect(true);
      } else {
        setError(e.message);
      }
    }
  };

  const handleDeleteAttachment = async (task_id, column_id, attachment_id) => {
    try {
      await axios.delete(`/attachments/${attachment_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newBoardData = [...board.columns];
      const columnIndex = newBoardData.findIndex(
        (column) => column.column_id === column_id
      );
      const task = findTaskById(newBoardData[columnIndex].tasks, task_id);
      task.attachments.splice(
        task.attachments.findIndex(
          (attachment) => attachment.attachment_id === attachment_id
        ),
        1
      );
      setBoard({ ...board, columns: newBoardData });
    } catch (e) {
      console.error(e);
      if (e.response.status === 401 || e.response.status === 500) {
        setError("You are not logged in! Redirecting to login page...");
        setRedirect(true);
      } else {
        setError(e.message);
      }
    }
  };

  const handleShowCraftPromptPopup = () => {
    setShowCraftPromptPopup(true);
    setIsAGIOpen(false);
    setIsHoveredCraft(false);
  };

  const handleShowGeneratePerformanceSummaryPopup = () => {
    setShowGeneratePerformanceSummaryPopup(true);
    setIsAGIOpen(false);
    setIsHoveredPerformanceSummary(false);
  };

  const handleAddMember = async (task_id, column_id, member_id) => {
    try {
      const response = await axios.post(
        `/tasks/${task_id}/members`,
        { user_id: member_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newMember = response.data.member;
      const newBoardData = [...board.columns];
      const columnIndex = newBoardData.findIndex(
        (column) => column.column_id === column_id
      );
      const task = findTaskById(newBoardData[columnIndex].tasks, task_id);
      task.members.push(newMember);
      setBoard({ ...board, columns: newBoardData });
    } catch (e) {
      console.error(e);
      if (e.response.status === 401 || e.response.status === 500) {
        setError("You are not logged in! Redirecting to login page...");
        setRedirect(true);
      } else {
        setError(e.message);
      }
    }
  };

  const handleDeleteMember = async (task_id, column_id, member_id) => {
    try {
      const response = await axios.delete(
        `/tasks/${task_id}/members/${member_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (e) {
      console.error(e);
      if (e.response.status === 401 || e.response.status === 500) {
        setError("You are not logged in! Redirecting to login page...");
        setRedirect(true);
      } else {
        setError(e.message);
      }
    }
  };

  const handleMouseEnterOnColumn = (columnId) => {
    setHoveredColumnId(columnId);
  };

  const handleMouseLeaveOnColumn = () => {
    setHoveredColumnId(null);
  };

  const toggleAGIDropdown = () => {
    setIsAGIOpen(!isAGIOpen);
  };

  const handleTransformMouseEnter = () => {
    const options = document.getElementsByClassName("option");
    for (const option of options) {
      option.style.transform = "translateX(10px)";
    }
  };

  const handleTransformMouseLeave = () => {
    const options = document.getElementsByClassName("option");
    for (const option of options) {
      option.style.transform = "translateX(0px)";
    }
  };

  const handlePlaceTagOnTask = async (task_id, tag) => {
    try {
      await axios.post(
        `/boards/${board_id}/tasks/${task_id}/tags/${tag.tag_id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedBoard = { ...board };
      const updatedTask = updatedBoard.columns
        .flatMap((column) => column.tasks)
        .find((task) => task.task_id === task_id);
      updatedTask.tags.push(tag);
      updatedTask.tags.sort((a, b) => a.tag_id - b.tag_id);

      setBoard(updatedBoard);
    } catch (e) {
      console.error(e);
      if (e.response.status === 401 || e.response.status === 500) {
        setError("You are not logged in! Redirecting to login page...");
        setRedirect(true);
      } else {
        setError(e.message);
      }
    }
  };

  const handleRemoveTagFromTask = async (task_id, tag_id) => {
    try {
      await axios.delete(
        `/boards/${board_id}/tasks/${task_id}/tags/${tag_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedBoard = { ...board };
      const updatedTask = updatedBoard.columns
        .flatMap((column) => column.tasks)
        .find((task) => task.task_id === task_id);
      const removedTagIndex = updatedTask.tags.findIndex(
        (tag) => tag.tag_id === tag_id
      );
      if (removedTagIndex !== -1) {
        updatedTask.tags.splice(removedTagIndex, 1);
      }

      setBoard(updatedBoard);
    } catch (e) {
      console.error(e);
      if (e.response.status === 401 || e.response.status === 500) {
        setError("You are not logged in! Redirecting to login page...");
        setRedirect(true);
      } else {
        setError(e.message);
      }
    }
  };

  const handleBoardTagDeletion = async (tag_id) => {
    const updatedBoard = { ...board };
    for (const column of updatedBoard.columns) {
      for (const task of column.tasks) {
        const removedTagIndex = task.tags.findIndex(
          (tag) => tag.tag_id === tag_id
        );
        if (removedTagIndex !== -1) {
          task.tags.splice(removedTagIndex, 1);
        }
      }
    }
  };

  return (
    <>
      {permission === false ? (
        error ? (
          <Error error={error} redirect={redirect}></Error>
        ) : (
          <div className="content">
            <Loader />
          </div>
        )
      ) : (
        <DndProvider backend={HTML5Backend}>
          {board.columns === undefined ? (
            <div className="content">
              <Loader />
            </div>
          ) : (
            <div className="content">
              <div className="title-bar">
                <h1 className="title-name">{board.name}</h1>
                <div className="title-bar-buttons">
                  <ul>
                    <li>
                      <span>{filterIcon}</span>
                      <p>Filter</p>
                    </li>
                    <li>
                      <span>{sortIcon}</span>
                      <p>Sort by</p>
                    </li>
                    <li
                      onMouseEnter={() => setIsHoveredAITitleBar(true)}
                      onMouseLeave={() => setIsHoveredAITitleBar(false)}
                      onClick={toggleAGIDropdown}
                      style={{
                        color:
                          isHoveredAITitleBar || isAGIOpen
                            ? "var(--off-white)"
                            : "var(--dark-gray)",
                      }}
                    >
                      <span
                        className="ai-button-on-title-bar"
                        style={{
                          color:
                            isHoveredAITitleBar || isAGIOpen
                              ? "var(--off-white)"
                              : "var(--dark-gray)",
                        }}
                      >
                        {aiIcon}
                      </span>
                      <p>Magic</p>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="div-container">
                {board.columns.map((column, index) => (
                  <Column
                    key={index}
                    divIndex={index}
                    moveColumnFrontend={moveColumnFrontend}
                    moveColumnBackend={moveColumnBackend}
                    onMouseEnter={() => handleMouseEnterOnColumn(index)}
                    onMouseLeave={handleMouseLeaveOnColumn}
                    zIndex={
                      columnIndex === index
                        ? columnZIndex
                        : () => setColumnZIndex(1)
                    }
                  >
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
                          <div
                            className="options"
                            style={{
                              visibility:
                                hoveredColumnId === index
                                  ? "visible"
                                  : "hidden",
                              transition: "visibility 0.1s ease",
                            }}
                          >
                            <span
                              className="dots"
                              onClick={(e) => handleDotsClick(e, index)}
                            >
                              {dotsIcon}
                            </span>
                          </div>
                        </>
                      )}
                      <div className="task-container">
                        {column.tasks.map((task, taskIndex) => (
                          <Task
                            key={task.task_id}
                            id={task.task_id}
                            index={taskIndex}
                            task={task}
                            column={column}
                            craftedPromptsTask={craftedPromptsTask}
                            divName={`div${index + 1}`}
                            favouriteTask={handleFavouriteTask}
                            unFavouriteTask={handleUnFavouriteTask}
                            deleteTask={handleDeleteTask}
                            setTaskAsInspectedTask={setTaskAsInspectedTask}
                            openGenerateTaskWithAGIPopup={
                              openGenerateTaskWithAGIPopup
                            }
                            moveCardFrontend={(
                              dragIndex,
                              hoverIndex,
                              sourceDiv,
                              targetDiv
                            ) =>
                              moveCardFrontend(
                                dragIndex,
                                hoverIndex,
                                parseInt(sourceDiv.substr(3)) - 1,
                                parseInt(targetDiv.substr(3)) - 1
                              )
                            }
                            moveCardBackend={(
                              dragIndex,
                              hoverIndex,
                              sourceDiv,
                              targetDiv
                            ) =>
                              moveCardBackend(
                                dragIndex,
                                hoverIndex,
                                parseInt(sourceDiv.substr(3)) - 1,
                                parseInt(targetDiv.substr(3)) - 1
                              )
                            }
                            generateDocumentationForTask={(task) =>
                              generateDocumentationForTask(task)
                            }
                            generateTasks={(task, column) =>
                              openGenerateTaskWithAGIPopup(task, column)
                            }
                            generateAttachmentLinks={(task) =>
                              openGenerateAttachmentLinkWithAGIPopup(task)
                            }
                            HandleCraftedPromptTaskClick={(
                              craftedPrompt,
                              task,
                              column
                            ) =>
                              HandleCraftedPromptTaskClick(
                                craftedPrompt,
                                task,
                                column
                              )
                            }
                          />
                        ))}
                      </div>
                      {column.is_finished === 0 ? (
                        <div
                          className="card addbtn"
                          onClick={() => handleAddTask(index)}
                        >
                          {plusIcon} Add new task
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>
                  </Column>
                ))}
                {
                  <div
                    className="card-container addbtn-column"
                    onClick={handleAddColumn}
                  >
                    {plusIcon} Add new column
                  </div>
                }
              </div>
            </div>
          )}
          {isAGIOpen && (
            <div
              className="agi-submenu"
              onMouseLeave={() => setIsAGIOpen(false)}
            >
              <p className="agi-menu-title"> AI menu </p>
              <ul className="agi-menu">
                <li
                  onMouseEnter={() => setIsHoveredPerformanceSummary(true)}
                  onMouseLeave={() => setIsHoveredPerformanceSummary(false)}
                  onClick={() => {
                    handleShowGeneratePerformanceSummaryPopup();
                  }}
                >
                  <span
                    className="craft-button"
                    style={{
                      color: isHoveredPerformanceSummary ? "var(--craft)" : "",
                    }}
                  >
                    {craftIcon}
                  </span>
                  <span>Generate performance summary</span>
                </li>
                <li
                  onMouseEnter={() => setIsHoveredCraft(true)}
                  onMouseLeave={() => setIsHoveredCraft(false)}
                  onClick={() => {
                    handleShowCraftPromptPopup();
                  }}
                >
                  <span
                    className="craft-button"
                    style={{
                      color: isHoveredCraft ? "var(--craft)" : "",
                    }}
                  >
                    {craftIcon}
                  </span>
                  <span>Craft Prompt</span>
                </li>
                <li
                  onMouseEnter={() => setIsHoveredDocumentation(true)}
                  onMouseLeave={() => setIsHoveredDocumentation(false)}
                  onClick={() => {
                    openDocumentationPopup();
                  }}
                >
                  <span
                    className="code-button"
                    style={{
                      color: isHoveredDocumentation ? "var(--code)" : "",
                    }}
                  >
                    {documentationIcon}
                  </span>
                  <span>Generate documentation for board</span>
                </li>
                <li
                  onMouseEnter={() => setIsHoveredCode(0)}
                  onMouseLeave={() => setIsHoveredCode(false)}
                  onClick={() => {
                    openCodePopup();
                  }}
                >
                  <span
                    className="code-button"
                    style={{
                      color: isHoveredCode === 0 ? "var(--code)" : "",
                    }}
                  >
                    {codeIcon}
                  </span>
                  <span>Code Review</span>
                </li>
                {codeReviewOrDocumentations.map((element, index) => (
                  <ul
                    className="code-review-or-documentation-container"
                    key={index}
                  >
                    <li className="code-review-or-documentation-title">
                      <span
                        onMouseEnter={() => setIsHoveredCode(index + 1)}
                        onMouseLeave={() => setIsHoveredCode(null)}
                        onClick={() => {
                          openCodePopup(element);
                        }}
                      >
                        <span
                          className="code-button"
                          style={{
                            color:
                              isHoveredCode === index + 1 ? "var(--code)" : "",
                          }}
                        >
                          {codeIcon}
                        </span>
                        Code review {index + 1}
                      </span>
                      <span
                        className="delete-code-review-or-documentation-button"
                        onClick={() => {
                          deleteCodeReviewOrDocumentation(element);
                        }}
                      >
                        {xMarkIcon}
                      </span>
                    </li>
                  </ul>
                ))}
              </ul>
            </div>
          )}
          {showIconContainer && (
            <div
              className="overlay"
              onClick={() => {
                setShowIconContainer(false);
                setColumnZIndex(1);
              }}
            >
              <div
                className="icon-container"
                style={{
                  position: "fixed",
                  left: iconContainerPosition.x + "px",
                  top: iconContainerPosition.y + "px",
                }}
              >
                <div
                  className="option"
                  onMouseEnter={() => setIsHoveredDocumentation(true)}
                  onMouseLeave={() => setIsHoveredDocumentation(false)}
                  onClick={() =>
                    generateDocumentationForColumn(board.columns[columnIndex])
                  }
                >
                  <span
                    className="ai-button"
                    style={{
                      color: isHoveredDocumentation ? "var(--magic)" : "",
                    }}
                  >
                    {documentationIcon}
                  </span>
                  <p>Generate documentation for column</p>
                </div>
                <div
                  className="option"
                  onMouseEnter={() => setIsHoveredAI(0)}
                  onMouseLeave={() => setIsHoveredAI(-1)}
                  onClick={() =>
                    openGenerateTaskWithAGIPopup(
                      null,
                      board.columns[columnIndex]
                    )
                  }
                >
                  <span
                    className="ai-button"
                    style={{
                      color: isHoveredAI === 0 ? "var(--magic)" : "",
                    }}
                  >
                    {aiIcon}
                  </span>
                  <p>Generate Tasks</p>
                </div>
                {craftedPromptsBoard.map((craftedPrompt, index) => (
                  <div
                    className="option"
                    key={index}
                    onMouseEnter={() => setIsHoveredClipboard(index + 1)}
                    onMouseLeave={() => setIsHoveredClipboard(-1)}
                    onClick={() =>
                      HandleCraftedPromptColumnClick(
                        craftedPrompt,
                        board.columns[columnIndex]
                      )
                    }
                    style={{
                      transform: "translateX(10px)",
                    }}
                  >
                    <span
                      className="clipboard-button"
                      style={{
                        color:
                          isHoveredClipboard === index + 1
                            ? "var(--light-blue)"
                            : "",
                      }}
                    >
                      {clipboardIcon}
                    </span>
                    <p>{craftedPrompt.crafted_prompt_title}</p>
                  </div>
                ))}
                <div
                  className="option"
                  onMouseEnter={() => setIsHoveredX(true)}
                  onMouseLeave={() => setIsHoveredX(false)}
                  onClick={(e) => handleDeleteButtonClick(e, columnIndex)}
                >
                  <span
                    className="delete-column-button"
                    style={{
                      color: isHoveredX ? "var(--important)" : "",
                    }}
                  >
                    {trashIcon}
                  </span>
                  <p>Delete Column</p>
                </div>
              </div>
            </div>
          )}
          {showGenerateAttachmentLinkWithAGIPopup && (
            <GenerateAttachmentLinkWithAGIPopup
              task={inspectedTask}
              onCancel={handleGenerateAttachmentLinkCancel}
            />
          )}
          {showCodePopup && (
            <CodePopup
              board_id={board_id}
              codeReviewOrDocumentation={inspectedCodeReviewOrDocumentation}
              reloadCodeReviewOrDocumentation={reloadCodeReviewOrDocumentation}
              onCancel={handleCodeCancel}
            />
          )}
          {showDocumentationPopup && (
            <DocumentationPopup
              board_id={board_id}
              task={inspectedTask}
              column={inspectedColumn}
              onCancel={handleDocumentationCancel}
            />
          )}
          {showGenerateTaskWithAGIPopup && (
            <GenerateTaskWithAGIPopup
              board_id={board_id}
              column={inspectedColumn}
              tasks={inspectedTask}
              fetchBoardData={fetchBoardData}
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
          {showCraftPromptPopup && (
            <CraftPromptPopup
              board_id={board.board_id}
              reloadCraftedPrompts={reloadCraftedPrompts}
              onCancel={() => setShowCraftPromptPopup(false)}
            />
          )}
          {showGeneratePerformanceSummaryPopup && (
            <GeneratePerformanceSummaryPopup
              board_id={board.board_id}
              onCancel={() => setShowGeneratePerformanceSummaryPopup(false)}
            />
          )}
        </DndProvider>
      )}
      {showPopup && (
        <Popup
          task={inspectedTask}
          onClose={handleClosePopup}
          onSave={handleSavePopup}
          board_id={board_id}
          addSubtask={handleAddSubtask}
          deleteSubtask={handleDeleteSubtask}
          favouriteSubtask={handleFavouriteSubtask}
          unFavouriteSubtask={handleUnFavouriteSubtask}
          handlePostComment={postComment}
          setTaskAsInspectedTask={setTaskAsInspectedTask}
          onPreviousTask={handleOpenPreviousTask}
          priorities={priorities}
          modifyPriority={handleModifyPriority}
          modifyDeadline={handleModifyDeadline}
          addAttachment={handleAddAttachment}
          deleteAttachment={handleDeleteAttachment}
          addMember={handleAddMember}
          deleteMember={handleDeleteMember}
          tags={inspectedTask.tags}
          placeTagOnTask={handlePlaceTagOnTask}
          removeTagFromTask={handleRemoveTagFromTask}
        />
      )}
    </>
  );
};

export default Board;
