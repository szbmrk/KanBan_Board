import React, { useState, useRef, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Task, plusIcon } from "./Task";
import { TaskPlaceholder } from "./TaskPlaceholder";
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
    faStar,
    faFilter,
    faFilterCircleXmark,
    faSort,
    faArrowDownAZ,
    faCalendarDays,
    faCircleExclamation,
    faBook,
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
import GenerateTaskWithAGIPopup from "../AGI/GenerateTaskWithAGIPopup";
import GenerateAttachmentLinkWithAGIPopup from "../AGI/GenerateAttachmentLinkWithAGIPopup";
import CraftPromptPopup from "../AGI/CraftPromptPopup";
import CraftedPromptListPopup from "../AGI/CraftedPromptListPopup";
import { useNavigate } from "react-router-dom";
import CodePopup from "../AGI/CodePopup";
import IconContainer from "./IconContainer";
import DocumentationPopup from "../AGI/DocumentationPopup";
import GeneratePerformanceSummaryPopup from "../AGI/GeneratePerformanceSummaryPopup";
import SimpleTextPopup from "../SimpleTextPopup";
import AddColumnPopup from "../AddColumnPopup";
import SimpleLabelPopup from "../SimpleLabelPopup";
import SimpleLoaderPopup from "../SimpleLoaderPopup";
import DatePicker from "react-datepicker";
import ErrorWrapper from "../../ErrorWrapper";
import Echo from "laravel-echo";
import {
    REACT_APP_PUSHER_KEY,
    REACT_APP_PUSHER_CLUSTER,
    REACT_APP_PUSHER_PORT,
    REACT_APP_PUSHER_HOST,
    REACT_APP_PUSHER_PATH
} from "../../api/config.js";
import LogComponent from "./Logs.js";

export const documentationIcon = <FontAwesomeIcon icon={faFileLines} />;
export const aiIcon = <FontAwesomeIcon icon={faWandMagicSparkles} />;
export const dotsIcon = <FontAwesomeIcon icon={faEllipsis} />;
export const trashIcon = <FontAwesomeIcon icon={faTrash} />;
export const bookIcon = <FontAwesomeIcon icon={faBook} />;

const Board = () => {
    const { board_id, column_to_show_id, task_to_show_id } = useParams();
    const [permission, setPermission] = useState(false);
    const [error, setError] = useState(false);
    const [board, setBoard] = useState([]);
    const [boardIsFavourite, setBoardIsFavourite] = useState(false);
    const [columnPositions, setColumnPositions] = useState([]);
    const [editingColumnIndex, setEditingColumnIndex] = useState(null);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [columnToDeleteIndex, setColumnToDeleteIndex] = useState(null);
    const [
        codeReviewOrDocumentationToDelete,
        setCodeReviewOrDocumentationToDelete,
    ] = useState(null);
    const [showDeleteTaskConfirmation, setShowDeleteTaskConfirmation] =
        useState(false);
    const [showDeleteColumnConfirmation, setShowDeleteColumnConfirmation] =
        useState(false);
    const [
        showDeleteCodeReviewOrDocumentationConfirmation,
        setShowDeleteCodeReviewOrDocumentationConfirmation,
    ] = useState(false);
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
    const [taskPosition, setTaskPosition] = useState({
        x: 0,
        y: 0,
    });
    const [openTagsOnStart, setOpenTagsOnStart] = useState(false);
    const [showIconContainer, setShowIconContainer] = useState(false);
    const [showIconContainer1, setShowIconContainer1] = useState(false);
    const [showCraftedPromptListPopup, setShowCraftedPromptListPopup] =
        useState(false);
    const [showCraftPromptPopup, setShowCraftPromptPopup] = useState(false);
    const [
        showGeneratePerformanceSummaryPopup,
        setShowGeneratePerformanceSummaryPopup,
    ] = useState(false);
    const [showCodePopup, setShowCodePopup] = useState(false);
    const [showDocumentationPopup, setShowDocumentationPopup] = useState(false);
    const [showSuccessfulDeletePopup, setShowSuccessfulDeletePopup] =
        useState(false);
    const [showAIGeneratingLoaderPopup, setShowAIGeneratingLoaderPopup] =
        useState(false);
    const [isHoveredAI, setIsHoveredAI] = useState(-1);
    const [isHoveredClipboard, setIsHoveredClipboard] = useState(-1);
    const [isHoveredCode, setIsHoveredCode] = useState(false);
    const [isHoveredCraftList, setIsHoveredCraftList] = useState(false);
    const [isHoveredCraft, setIsHoveredCraft] = useState(false);
    const [isHoveredPerformanceSummary, setIsHoveredPerformanceSummary] =
        useState(false);
    const [isHoveredDocumentation, setIsHoveredDocumentation] = useState(false);
    const [isHoveredX, setIsHoveredX] = useState(false);
    const [columnIndex, setColumnIndex] = useState(null);
    const [priorities, setPriorities] = useState([]);
    const [redirect, setRedirect] = useState(false);
    const [craftedPrompts, setCraftedPrompts] = useState([]);
    const craftedPromptsRef = useRef(craftedPrompts);
    const [craftedPromptsBoard, setCraftedPromptsBoard] = useState([]);
    const craftedPromptsBoardRef = useRef(craftedPromptsBoard);
    const [craftedPromptsTask, setCraftedPromptsTask] = useState([]);
    const craftedPromptsTaskRef = useRef(craftedPromptsTask);
    const [isHoveredAITitleBar, setIsHoveredAITitleBar] = useState(false);
    const [isHoveredLogTitleBar, setIsHoveredLogTitleBar] = useState(false);
    const [codeReviewOrDocumentations, setCodeReviewOrDocumentation] = useState(
        []
    );
    const codeReviewOrDocumentationsRef = useRef(codeReviewOrDocumentations);
    const navigate = useNavigate();
    const [hoveredColumnId, setHoveredColumnId] = useState(null);
    const [isAGIOpen, setIsAGIOpen] = useState(false);
    const [isLogOpen, setIsLogOpen] = useState(false);
    const [taskIsClickable, setTaskIsClickable] = useState(true);
    const [childData, setChildData] = useState(null);
    const [iconContainerOptions, setIconContainerOptions] = useState(null);
    const [isTaskDotsIconClicked, setIsTaskDotsIconClicked] = useState(false);
    const [cardZIndex, setCardZIndex] = useState(1);
    const [showableTaskRef, setShowableTaskRef] = useState(null);
    const [showTaskNamePopup, setShowTaskNamePopup] = useState(false);
    const [showColumnNamePopup, setShowColumnNamePopup] = useState(false);
    const [currentDivIndex, setCurrentDivIndex] = useState(null);
    const showableTask = useRef(null);

    const checkIcon = <FontAwesomeIcon icon={faCheck} />;
    const xMarkIcon = <FontAwesomeIcon icon={faXmark} />;
    const codeIcon = <FontAwesomeIcon icon={faCode} />;
    const craftIcon = <FontAwesomeIcon icon={faPenRuler} />;
    const clipboardIcon = <FontAwesomeIcon icon={faClipboard} />;
    const starIcon = <FontAwesomeIcon icon={faStar} />
    const filterIcon = <FontAwesomeIcon icon={faFilter} />;
    const filterDeleteIcon = <FontAwesomeIcon icon={faFilterCircleXmark} />;
    const sortIcon = <FontAwesomeIcon icon={faSort} />;
    const [tags, setTags] = useState([]);
    const [members, setMembers] = useState([]);
    const [isHoveredName, setIsHoveredName] = useState(false);
    const [isHoveredDeadline, setIsHoveredDeadline] = useState(false);
    const [isHoveredPriority, setIsHoveredPriority] = useState(false);
    const [isHoveredFavouriteTitleBar, setIsHoveredFavouriteTitleBar] = useState(false);
    const [isHoveredSortByTitleBar, setIsHoveredSortByTitleBar] = useState(false);
    const [isHoveredFilterByTitleBar, setIsHoveredFilterByTitleBar] =
        useState(false);
    const [isHoveredClearFilterByTitleBar, setIsHoveredClearFilterByTitleBar] =
        useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const sortNameIcon = <FontAwesomeIcon icon={faArrowDownAZ} />;
    const sortDeadlineIcon = <FontAwesomeIcon icon={faCalendarDays} />;
    const sortPriorityIcon = <FontAwesomeIcon icon={faCircleExclamation} />;
    const token = sessionStorage.getItem("token");
    const user_id = sessionStorage.getItem("user_id");
    const team_member = JSON.parse(sessionStorage.getItem("team_members"));
    const permissions = JSON.parse(
        sessionStorage.getItem("permissions")
    ).teams.filter((permission) => {
        return parseInt(permission.board_id) === parseInt(board_id);
    });

    const [priorityFilter, setPriorityFilter] = useState([]);
    const [tagFilter, setTagFilter] = useState([]);
    const [memberFilter, setMemberFilter] = useState([]);
    const [deadlineFilter, setDeadlineFilter] = useState(null);
    const [isFilterActive, setIsFilterActive] = useState(false);
    const [filterCount, setFilterCount] = useState(0);

    const [logs, setLogs] = useState([]);

    const [boardTitle, setBoardTitle] = useState("");
    const [showBoardTitleEdit, setShowBoardTitleEdit] = useState(false);
    const boardRef = useRef(board);
    const popupRef = useRef(null);
    const columnPositionsRef = useRef(columnPositions);

    const reloadData = () => {
        document.title = "KanBan | Board";

        reloadPriorities();

        fetchBoardData();

        reloadCodeReviewOrDocumentation();
        reloadCraftedPrompts();
    };


    useEffect(() => {
        reloadData();
    }, []);

    useEffect(() => {
        setBoard([]);
        
        reloadData();
    }, [board_id]);

    useEffect(() => {
        window.Pusher = require("pusher-js");
        window.Pusher.logToConsole = true;

        const echo = new Echo({
            broadcaster: "pusher",
            key: REACT_APP_PUSHER_KEY,
            cluster: REACT_APP_PUSHER_CLUSTER,
            wsHost: REACT_APP_PUSHER_HOST || window.location.hostname,
            wsPort: REACT_APP_PUSHER_PORT || 6001,
            wssPort: 443,
            wsPath: REACT_APP_PUSHER_PATH || '',
            enableStats: false,
            forceTLS: false,
            enabledTransports: ["ws", "wss"],
        });

        const channel = echo.channel(`BoardChange`);

        channel.listen(
            `.board.${board_id}`,
            (e) => {
                handleWebSocket(e);
            },
            []
        );

        return () => {
            window.log("Cleanup");
            channel.unsubscribe();
        };
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

    // Update the board reference whenever the board state changes
    useEffect(() => {
        boardRef.current = board;
        if (board.name != undefined) document.title = "KanBan | " + board.name;
    }, [board]);

    useEffect(() => {
        codeReviewOrDocumentationsRef.current = codeReviewOrDocumentations;
    }, [codeReviewOrDocumentations]);

    useEffect(() => {
        craftedPromptsRef.current = craftedPrompts;
    }, [craftedPrompts]);

    useEffect(() => {
        craftedPromptsBoardRef.current = craftedPromptsBoard;
    }, [craftedPromptsBoard]);

    useEffect(() => {
        craftedPromptsTaskRef.current = craftedPromptsTask;
    }, [craftedPromptsTask]);

    const handleWebSocket = async (websocket) => {
        window.log("DATA");
        window.log(websocket.data);
        switch (websocket.changeType) {
            case "FAVOURITE_TASK":
                webSocketFavouriteTask(websocket.data);
                break;
            case "UNFAVOURITE_TASK":
                webSocketUnfavouriteTask(websocket.data);
                break;
            case "CREATED_TASK":
                webSocketAddTask(websocket.data);
                break;
            case "UPDATED_TASK":
                webSocketUpdateTask(websocket.data);
                break;
            case "POSITION_UPDATED_TASK":
                webSocketPositionUpdateTask(websocket.data);
                break;
            case "DELETED_TASK":
                webSocketDeleteTask(websocket.data);
                break;
            case "CREATED_MULTIPLE_TASKS":
                webSocketCreateMultipleTasks(websocket.data);
                break;
            case "CREATED_TASK_TAG":
                webSocketCreateTaskTag(websocket.data);
                break;
            case "DELETED_TASK_TAG":
                webSocketDeleteTaskTag(websocket.data);
                break;
            case "UPDATED_TAG":
                webSocketUpdateTag(websocket.data);
                break;
            case "DELETED_TAG":
                webSocketDeleteTag(websocket.data);
                break;
            case "CREATED_COMMENT":
                webSocketCreateComment(websocket.data);
                break;
            case "DELETED_COMMENT":
                webSocketDeleteComment(websocket.data);
                break;
            case "CREATED_ATTACHMENT":
                webSocketCreateAttachment(websocket.data);
                break;
            case "DELETED_ATTACHMENT":
                webSocketDeleteAttachment(websocket.data);
                break;
            case "CREATED_MULTIPLE_ATTACHMENT":
                webSocketCreateMultipleAttachment(websocket.data);
                break;
            case "CREATED_USER_TASK":
                webSocketCreateUserTask(websocket.data);
                break;
            case "DELETED_USER_TASK":
                webSocketDeleteUserTask(websocket.data);
                break;
            case "CREATED_SUBTASK":
                webSocketCreateSubtask(websocket.data);
                break;
            case "CHANGE_ISDONE_SUBTASK":
                webSocketUpdateSubtaskIsDone(websocket.data);
                break;
            case "DELETED_SUBTASK":
                webSocketDeleteSubtask(websocket.data);
                break;
            case "CREATED_COLUMN":
                webSocketAddColumn(websocket.data);
                break;
            case "UPDATED_COLUMN":
                webSocketUpdateColumn(websocket.data);
                break;
            case "POSITION_UPDATED_COLUMN":
                webSocketPositionUpdateColumn(websocket.data);
                break;
            case "DELETED_COLUMN":
                webSocketDeleteColumn(websocket.data);
                break;
            case "UPDATED_BOARD_NAME":
                webSocketChangeBoardName(websocket.data);
                break;
            case "GENERATED_CODE_REVIEW_OR_DOCUMENTATION":
                webSocketGeneratedCodeReviewOrDocumentation(websocket.data);
                break;
            case "DELETED_CODE_REVIEW_OR_DOCUMENTATION":
                webSocketDeleteCodeReviewOrDocumentation(websocket.data);
                break;
            case "CREATED_PROMPT":
                webSocketCreatePrompt(websocket.data);
                break;
            case "UPDATED_PROMPT":
                webSocketUpdatePrompt(websocket.data);
                break;
            case "DELETED_PROMPT":
                webSocketDeletePrompt(websocket.data);
                break;
            case "FAVOURITE":
                if (websocket.data.user_id == user_id) {
                    setBoardIsFavourite(true);
                }
                break;
            case "UNFAVOURITE":
                if (websocket.data.user_id == user_id) {
                    setBoardIsFavourite(false);
                }
                break;
            default:
                break;
        }
    };

    const webSocketFavouriteTask = async (data) => {
        if (data.user_id.toString() !== user_id.toString()) {
            return;
        }

        favouriteTask(data.task);
    };

    const webSocketUnfavouriteTask = async (data) => {
        if (data.user_id.toString() !== user_id.toString()) {
            return;
        }

        unfavouriteTask(data.task);
    };

    const webSocketAddTask = async (data) => {
        window.log("BOARD");
        window.log(boardRef.current);
        window.log(boardRef.current.columns);
        const newBoardData = [...boardRef.current.columns];
        const targetColumn = newBoardData.find(
            (column) => column.column_id === data.task.column_id
        );
        if (targetColumn) {
            targetColumn.tasks.push(data.task);
            setBoard({ ...board, columns: newBoardData });
        }
    };

    const webSocketCreateMultipleTasks = async (data) => {
        window.log("CreateMultipleTasks");
        window.log(data);

        const newBoardData = [...boardRef.current.columns];
        const targetColumn = newBoardData.find(
            (column) => column.column_id === data.column_id
        );
        if (targetColumn) {
            data.tasks.forEach((currentTask) => {
                // Check if the task_id of currentTask does not exist in any task_id in targetColumn.tasks array
                const existingTask = targetColumn.tasks.find(
                    (task) => task.task_id === currentTask.task_id
                );

                // If currentTask's task_id does not exist, push it to targetColumn.tasks
                if (!existingTask) {
                    targetColumn.tasks.push(currentTask);
                } else {
                    if (existingTask.subtasks) {
                        currentTask.subtasks.forEach((currentSubtask) => {
                            existingTask.subtasks.push(currentSubtask);
                        });
                    } else {
                        existingTask.subtasks = currentTask.subtasks;
                    }
                }
            });
            setBoard({ ...board, columns: newBoardData });
        }
    };

    const webSocketUpdateTask = async (data) => {
        window.log("BOARD");
        window.log(boardRef.current);
        window.log("UPDATED TASK");
        window.log(data.task);

        const newTaskData = [...boardRef.current.columns];
        const columnIndex = newTaskData.findIndex(
            (column) => column.column_id === data.task.column_id
        );
        if (columnIndex === -1) {
            return;
        }
        const taskExists = findTaskById(
            newTaskData[columnIndex].tasks,
            data.task.task_id
        );
        if (!taskExists) {
            return;
        }
        updateTaskBasicProperties(taskExists, data.task);
        taskExists.priority = data.task.priority;
        taskExists.completed = data.task.completed;
        setBoard({ ...boardRef.current, columns: newTaskData });

        if (inspectedTaskRef?.current?.task_id === data.task.task_id) {
            popupRef?.current?.setTask(data.task);
        }
    };

    const updateTaskBasicProperties = (taskToUpdate, newTask) => {
        taskToUpdate.title = newTask.title;
        taskToUpdate.description = newTask.description;
        taskToUpdate.due_date = newTask.due_date;
        taskToUpdate.priority_id = newTask.priority_id;
    };

    const webSocketPositionUpdateTask = async (data) => {
        window.log("BOARD");
        window.log(boardRef.current);
        window.log("POSITION UPDATED task");
        window.log(data);
        const newBoardData = [...boardRef.current.columns];

        data.tasks.forEach((task) => {
            window.log(boardRef.current.columns);
            const oldColumn = newBoardData.find(
                (column) => task.old_column_id === column.column_id
            );

            const newColumn = newBoardData.find(
                (column) => task.column_id === column.column_id
            );

            const taskExist = newColumn.tasks.find(
                (currentTask) => task.task_id === currentTask.task_id
            );

            window.log("Task Exist");
            window.log(taskExist);

            //Ha már alapból az adott oszlopban van a task (csak sorrendet cseréltünk) akkor elég frissíteni a pozícióját majd újrarendezni az oszlopot position alapján
            if (taskExist) {
                taskExist.position = task.position;
                newColumn.tasks.sort((a, b) => a.position - b.position);
            } else {
                oldColumn.tasks = oldColumn.tasks.filter(
                    (taskInColumn) => taskInColumn.task_id !== task.task_id
                );

                newColumn.tasks.push(task.task);
                newColumn.tasks.sort((a, b) => a.position - b.position);
            }
        });

        setBoard({ ...board, columns: newBoardData });
    };

    const webSocketCreateTaskTag = async (data) => {
        window.log("CreatedTaskTag");
        window.log(boardRef.current);

        placeTagOnTask(data.task.task_id, data.tag, data.task.column_id);
    };

    const webSocketDeleteTaskTag = async (data) => {
        window.log("CreatedTaskTag");
        window.log(boardRef.current);

        removeTagFromTask(data.task.task_id, data.tag.tag_id, data.task.column_id);
    };

    const webSocketUpdateTag = (data) => {
        window.log("webSocketUpdateTag");
        window.log(boardRef.current);

        let newBoardData = [...boardRef.current.columns];

        newBoardData.forEach((currentColumn) => {
            newBoardData.tasks = updateTagsWithTagId(currentColumn.tasks, data.tag);
        });

        setBoard({ ...boardRef.current, columns: newBoardData });
    };

    const updateTagsWithTagId = (tasks, tag) => {
        tasks.forEach((currentTask) => {
            if (currentTask.tags) {
                currentTask.tags.forEach((currentTag, index) => {
                    if (currentTag.tag_id === tag.tag_id) {
                        currentTask.tags[index] = tag;
                    }
                });
            }
            if (currentTask.subtasks) {
                currentTask.subtasks = updateTagsWithTagId(currentTask.subtasks, tag);
            }
        });
        return tasks;
    };

    const webSocketDeleteTag = (data) => {
        window.log("webSocketDeleteTag");
        window.log(boardRef.current);

        let newBoardData = [...boardRef.current.columns];

        newBoardData.forEach((currentColumn) => {
            newBoardData.tasks = DeleteTagByTagId(
                currentColumn.tasks,
                data.tag.tag_id
            );
        });

        setBoard({ ...boardRef.current, columns: newBoardData });
    };

    const DeleteTagByTagId = (tasks, tag_id) => {
        tasks.forEach((currentTask) => {
            if (currentTask.tags) {
                currentTask.tags = currentTask.tags.filter(
                    (currentTag) => currentTag.tag_id !== tag_id
                );
            }
            if (currentTask.subtasks) {
                currentTask.subtasks = DeleteTagByTagId(currentTask.subtasks, tag_id);
            }
        });
        return tasks;
    };

    const webSocketCreateComment = async (data) => {
        window.log("webSocketCreateComment");
        window.log(boardRef.current);

        const newTaskData = [...boardRef.current.columns];
        const columnIndex = newTaskData.findIndex(
            (column) => column.column_id === data.task.column_id
        );
        if (columnIndex === -1) {
            return;
        }
        const taskExists = findTaskById(
            newTaskData[columnIndex].tasks,
            data.task.task_id
        );
        if (!taskExists) {
            return;
        }
        if (!taskExists.comments) {
            taskExists.comments = [];
        }
        taskExists.comments.push(data.comment);

        setBoard({ ...boardRef.current, columns: newTaskData });
    };

    const webSocketDeleteComment = async (data) => {
        window.log("webSocketDeleteComment");
        window.log(boardRef.current);

        window.log("comment");
        window.log(data.task);
        window.log(inspectedTaskRef.current);
        window.log(data.comment);

        const newTaskData = [...boardRef.current.columns];
        const columnIndex = newTaskData.findIndex(
            (column) => column.column_id === data.task.column_id
        );
        if (columnIndex === -1) {
            return;
        }
        const taskExists = findTaskById(
            newTaskData[columnIndex].tasks,
            data.task.task_id
        );
        if (!taskExists) {
            return;
        }
        if (taskExists.comments) {
            taskExists.comments = taskExists.comments.filter(
                (comment) => comment.comment_id !== data.comment.comment_id
            );
        }

        setBoard({ ...boardRef.current, columns: newTaskData });
    };

    const webSocketCreateAttachment = async (data) => {
        window.log("webSocketCreateAttachment");
        window.log(boardRef.current);

        addAttachment(data.task.task_id, data.task.column_id, data.attachment);
    };

    const webSocketDeleteAttachment = async (data) => {
        window.log("webSocketCreateAttachment");
        window.log(boardRef.current);

        deleteAttachment(data.task.task_id, data.task.column_id, data.attachment);
    };

    const webSocketCreateMultipleAttachment = async (data) => {
        window.log(data);

        addMultipleAttachment(
            data.task.task_id,
            data.task.column_id,
            data.attachments
        );
    };

    const webSocketCreateUserTask = async (data) => {
        window.log("webSocketCreateUserTask");
        window.log(boardRef.current);

        addMember(data.task.task_id, data.task.column_id, data.member);
        popupRef?.current?.handleAddedMemberToTask(data.member);
    };

    const webSocketDeleteUserTask = async (data) => {
        window.log("webSocketCreateUserTask");
        window.log(boardRef.current);

        popupRef?.current?.handleDeletedMemberFromTask(data.member);
    };

    const webSocketDeleteTask = async (data) => {
        window.log("BOARD");
        window.log(boardRef.current);
        window.log(boardRef.current.columns);
        const newBoardData = [...boardRef.current.columns];
        const targetColumn = newBoardData.find(
            (column) => column.column_id === data.task.column_id
        );
        window.log("DELETE TASK");
        window.log(inspectedTaskRef?.current);
        window.log(data.task);
        if (inspectedTaskRef?.current?.task_id === data.task.task_id) {
            handleClosePopup();
        }
        if (targetColumn) {
            // Remove the task with the same ID from the target column
            targetColumn.tasks = targetColumn.tasks.filter(
                (taskInColumn) => taskInColumn.task_id !== data.task.task_id
            );
            setBoard({ ...boardRef.current, columns: newBoardData });
        }
    };

    const webSocketCreateSubtask = async (data) => {
        addSubtask(data.subtask);
    };

    const webSocketUpdateSubtaskIsDone = async (data) => {
        const modifiedSubtask = data.subtask;
        const newBoardData = [...boardRef.current.columns];
        const columnIndex = newBoardData.findIndex(
            (column) => column.column_id === modifiedSubtask.column_id
        );
        const task = findTaskById(
            newBoardData[columnIndex].tasks,
            modifiedSubtask.parent_task_id
        );
        window.log("TASK");
        task.subtasks.map((subtask) => {
            window.log(subtask, modifiedSubtask);
            if (subtask.task_id === modifiedSubtask.task_id) {
                subtask.completed = modifiedSubtask.completed ? 1 : 0;
            }
        });

        setBoard({ ...boardRef.current, columns: newBoardData });
    };

    const webSocketDeleteSubtask = async (data) => {
        deleteSubtask(data.subtask);
    };

    const webSocketAddColumn = async (data) => {
        window.log("BOARD");
        window.log(boardRef.current);
        window.log(boardRef.current.columns);
        window.log("NEW column");
        window.log(data.column);
        data.column.is_finished = data.is_finished === "1" ? 1 : 0;
        data.column.task_limit = data.task_limit;
        data.column.tasks = [];

        const newBoardData = [...boardRef.current.columns, data.column];
        let tempPositions = columnPositionsRef.current;
        tempPositions.push(data.column.column_id);
        setColumnPositions(tempPositions);
        setBoard({ ...boardRef.current, columns: newBoardData });
        window.log("BOARDREF");
        window.log(boardRef.current);
    };

    const webSocketPositionUpdateColumn = async (data) => {
        window.log("BOARD");
        window.log(boardRef.current);
        window.log("POSITION UPDATED column");
        window.log(data);
        setColumnPositions(data.columns);

        const indexMap = boardRef.current.columns.reduce((acc, column, index) => {
            acc[column.column_id] = index;
            return acc;
        }, {});

        // Sort the first array based on the order of column_ids in the second array
        const sortedColumns = [...boardRef.current.columns].sort(
            (a, b) =>
                data.columns.indexOf(a.column_id) - data.columns.indexOf(b.column_id)
        );

        setColumnPositions(data.columns);
        setBoard({ ...boardRef.current, columns: sortedColumns });
    };

    const webSocketUpdateColumn = async (data) => {
        const newBoardData = [...boardRef.current.columns];

        const column = newBoardData.find(
            (currentColumn) => currentColumn.column_id === data.column.column_id
        );

        column.name = data.column.name;
        column.is_finished = data.column.is_finished === 1 ? 1 : 0;
        column.task_limit = data.column.task_limit;

        setBoard({ ...boardRef.current, columns: newBoardData });
    };

    const webSocketDeleteColumn = async (data) => {
        window.log("BOARD");
        window.log(boardRef.current);
        window.log(boardRef.current.columns);

        let newBoardData = [...boardRef.current.columns];
        newBoardData = newBoardData.filter(
            (currentColumn) => data.column.column_id !== currentColumn.column_id
        );
        setColumnPositions(newBoardData.map((column) => column.position));
        setBoard({ ...boardRef.current, columns: newBoardData });
    };

    const webSocketChangeBoardName = async (data) => {
        window.log("BOARD");
        window.log(boardRef.current);
        setBoardTitle(data.name);
    };

    const webSocketGeneratedCodeReviewOrDocumentation = async (data) => {
        let newCodeReviewOrDocumentations = [
            ...codeReviewOrDocumentationsRef.current,
        ];
        newCodeReviewOrDocumentations.push(data.codeReviewOrDocumentation);
        setCodeReviewOrDocumentation(newCodeReviewOrDocumentations);
    };

    const webSocketDeleteCodeReviewOrDocumentation = async (data) => {
        deleteCodeReviewOrDocumentation(data.codeReviewOrDocumentation);
    };

    const webSocketCreatePrompt = async (data) => {
        craftedPromptsRef.current.push(data.craftedPrompt);
        setCraftedPrompts(craftedPromptsRef.current);

        if (data.craftedPrompt.action === "GENERATETASK") {
            craftedPromptsBoardRef.current.push(data.craftedPrompt);
            setCraftedPromptsBoard(craftedPromptsBoardRef.current);
        } else {
            craftedPromptsTaskRef.current.push(data.craftedPrompt);
            setCraftedPromptsTask(craftedPromptsTaskRef.current);
        }
    };

    const webSocketUpdatePrompt = async (data) => {
        craftedPromptsRef.current.forEach((currentPrompt, index) => {
            if (
                data.craftedPrompt.crafted_prompt_id === currentPrompt.crafted_prompt_id
            ) {
                craftedPromptsRef.current[index] = data.craftedPrompt;
            }
        });
        setCraftedPrompts(craftedPromptsRef.current);

        craftedPromptsBoardRef.current.forEach((currentPrompt, index) => {
            if (
                data.craftedPrompt.crafted_prompt_id === currentPrompt.crafted_prompt_id
            ) {
                craftedPromptsBoardRef.current[index] = data.craftedPrompt;
            }
        });
        setCraftedPromptsBoard(craftedPromptsBoardRef.current);

        craftedPromptsTaskRef.current.forEach((currentPrompt, index) => {
            if (
                data.craftedPrompt.crafted_prompt_id === currentPrompt.crafted_prompt_id
            ) {
                craftedPromptsTaskRef.current[index] = data.craftedPrompt;
            }
        });
        setCraftedPromptsTask(craftedPromptsTaskRef.current);
    };

    const webSocketDeletePrompt = async (data) => {
        craftedPromptsRef.current = craftedPromptsRef.current.filter(
            (currentPrompt) =>
                data.craftedPrompt.crafted_prompt_id !== currentPrompt.crafted_prompt_id
        );
        setCraftedPrompts(craftedPromptsRef.current);

        craftedPromptsBoardRef.current = craftedPromptsBoardRef.current.filter(
            (currentPrompt) =>
                data.craftedPrompt.crafted_prompt_id !== currentPrompt.crafted_prompt_id
        );
        setCraftedPromptsBoard(craftedPromptsBoardRef.current);

        craftedPromptsTaskRef.current = craftedPromptsTaskRef.current.filter(
            (currentPrompt) =>
                data.craftedPrompt.crafted_prompt_id !== currentPrompt.crafted_prompt_id
        );
        setCraftedPromptsTask(craftedPromptsTaskRef.current);
    };

    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);

        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Months are zero-indexed
        const day = String(date.getUTCDate()).padStart(2, "0");
        const hours = String(date.getUTCHours()).padStart(2, "0");
        const minutes = String(date.getUTCMinutes()).padStart(2, "0");

        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }
    const reloadPriorities = async () => {
        try {
            const prioritiesResponse = await axios.get("/priorities", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setPriorities(prioritiesResponse.data.priorities);
        } catch (e) {
            console.error(e);
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
            }
            if (e?.response?.status === 403) setError(e);
            else setError(e);
        }
    };

    const fetchBoardData = async () => {
        try {
            const response1 = await axios.get(`/boards/${board_id}/tags`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setTags(response1.data.tags);

            const response = await axios.get(`/boards/${board_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            window.log(response);

            setPermission(true);
            let tempBoard = response.data.board;
            let tempColumns = tempBoard.columns;

            setBoardTitle(tempBoard.name);
            setBoardIsFavourite(tempBoard.favourite);

            // Sort the columns and tasks by position
            tempColumns.map((column) =>
                column.tasks.sort((a, b) => a.position - b.position)
            );
            tempBoard.columns = tempColumns.sort((a, b) => a.position - b.position);
            let tempColumnPositions = tempBoard.columns.map(
                (column) => column.column_id
            );

            setColumnPositions(tempColumnPositions);

            setBoard(tempBoard);

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
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
            }
            if (e?.response?.status === 403) setError(e);
            else setError(e);
            setPermission(false);
        }
    };

    const getLogs = async () => {
        try {
            const response = await axios.get(`/boards/${board_id}/logs`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const sortedLogs = response.data.logs.sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at)
            );

            window.log(sortedLogs);
            setLogs(sortedLogs);
        } catch (e) {
            console.error(e);
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
            }
        }
    };

    const handleColumnNameConfirm = async (data) => {
        setShowColumnNamePopup(false);
        try {
            const formData = new FormData();
            formData.append("name", data.columnName);
            formData.append("is_finished", data.isFinished ? 1 : 0);
            if (data.taskLimit > 0) formData.append("task_limit", data.taskLimit);
            const res = await axios.post(`/boards/${board_id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (e) {
            console.error(e);
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
            }
        }
    };

    const handleAddColumn = () => {
        setShowColumnNamePopup(true);
    };

    const handleColumnNameCancel = () => {
        setShowColumnNamePopup(false);
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
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
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
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
            }
        }
    };

    const handleDeleteColumnButtonClick = (event, columnIndex) => {
        event.stopPropagation();
        setShowDeleteColumnConfirmation(true);
        setColumnToDeleteIndex(columnIndex);
        setShowIconContainer1(false);
    };

    const handleDeleteColumnConfirm = () => {
        try {
            axios.delete(
                `/boards/${board_id}/columns/${board.columns[columnToDeleteIndex].column_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (e) {
            console.error(e);
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
            }
        }

        setShowDeleteColumnConfirmation(false);
        setColumnToDeleteIndex(null);
    };

    const handleDeleteColumnCancel = () => {
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
                    if (e?.response?.status === 401 || e?.response?.status === 500) {
                        setError({
                            message: "You are not logged in! Redirecting to login page...",
                        });
                        setRedirect(true);
                    } else {
                        setError(e);
                    }
                }
            } else {
                try {
                    const column_id = board.columns[columnIndex].column_id;
                    const isFinished = board.columns[columnIndex].is_finished;
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
                    newColumnData[columnIndex].is_finished = isFinished;
                    setBoard({ ...board, columns: newColumnData });
                } catch (e) {
                    console.error(e);
                    if (e?.response?.status === 401 || e?.response?.status === 500) {
                        setError({
                            message: "You are not logged in! Redirecting to login page...",
                        });
                        setRedirect(true);
                    } else {
                        setError(e);
                    }
                }
            }
        }
    };

    const handleAddTask = async (divIndex) => {
        setShowTaskNamePopup(true);
        setCurrentDivIndex(divIndex);
    };

    const handleTaskNameConfirm = async (name) => {
        handleTaskNameCancel();
        try {
            if (!/^[0-9a-zA-Z]/.test(name)) {
                setError({
                    message: "The task can only start with a number, or a letter!"
                });
                return;
            }
            const newTask = {
                column_id: board.columns[currentDivIndex].column_id,
                title: name,
                description: ``,
            };

            const board_id = board.columns[currentDivIndex].board_id;
            const res = await axios.post(`/boards/${board_id}/task`, newTask, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            window.log("NEW TASK");
            window.log(res.data);
        } catch (e) {
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e?.response?.data);
            }
        }
    };

    const handleTaskNameCancel = () => {
        setShowTaskNamePopup(false);
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

        if (sourceDiv === targetDiv && sourceDiv.tasks.length === 1) {
            return;
        }

        let task_to_modify_id;
        let from_column_id = targetDiv.column_id;
        let to_column_id = sourceDiv.column_id;
        let position;
        window.log("FROM");
        window.log(from_column_id);

        if (hoverIndex) {
            task_to_modify_id = sourceDiv.tasks[hoverIndex].task_id;
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

            position = sourceDiv.tasks[hoverIndex].position;
            window.log("POSITION");
            window.log(position);
        } else {
            task_to_modify_id = sourceDiv.tasks[0].task_id;
            position = 1;
        }

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

            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e?.response?.data);
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
            window.log(e);
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
            }
        }
    };

    const handleDeleteTaskButtonClick = async (task) => {
        setShowDeleteTaskConfirmation(true);
        setTaskToDelete(task);
        setShowIconContainer1(false);
    };

    const handleDeleteTaskConfirm = async () => {
        try {
            await axios.delete(`/boards/${board_id}/tasks/${taskToDelete.task_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const targetDiv = board.columns.find(
                (column) => column.column_id === taskToDelete.column_id
            );
            const updatedtasks = targetDiv.tasks.filter(
                (task) => task.task_id !== taskToDelete.task_id
            );
            const newColumnData = [...board.columns];
            const columnIndex = newColumnData.findIndex(
                (column) => column.column_id === taskToDelete.column_id
            );
            newColumnData[columnIndex] = { ...targetDiv, tasks: updatedtasks };
            setBoard({ ...board, columns: newColumnData });

            handleDeleteTaskCancel();
        } catch (e) {
            console.error(e);
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
            }
        }
    };

    const handleDeleteTaskCancel = async () => {
        setShowDeleteTaskConfirmation(false);
        setTaskToDelete(null);
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
        } catch (e) {
            console.error(e);
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
            }
        }
    };

    const favouriteTask = (favouritedTask) => {
        const newBoardData = [...boardRef.current.columns];
        newBoardData.map((column) => {
            if (column.column_id === favouritedTask.column_id) {
                column.tasks.map((task) => {
                    if (task.task_id === favouritedTask.task_id) {
                        task.is_favourite = true;
                    }
                });
            }
        });
        setBoard({ ...boardRef.current, columns: newBoardData });
    };

    const handleUnFavouriteTask = (id, column_id) => {
        try {
            axios.delete(`/boards/${board_id}/tasks/${id}/favourite`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (e) {
            console.error(e);
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
            }
        }
    };

    const unfavouriteTask = (unfavouritedTask) => {
        const newBoardData = [...boardRef.current.columns];
        newBoardData.map((column) => {
            if (column.column_id === unfavouritedTask.column_id) {
                column.tasks.map((task) => {
                    if (task.task_id === unfavouritedTask.task_id) {
                        task.is_favourite = false;
                    }
                });
            }
        });
        setBoard({ ...boardRef.current, columns: newBoardData });
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
        } catch (e) {
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
            }
        }
    };

    const addSubtask = async (newSubtask) => {
        newSubtask.description = "";
        const newBoardData = [...boardRef.current.columns];
        const columnIndex = newBoardData.findIndex(
            (column) => column.column_id === newSubtask.column_id
        );
        const task = findTaskById(
            newBoardData[columnIndex].tasks,
            newSubtask.parent_task_id
        );
        task.subtasks.push(newSubtask);
        setBoard({ ...boardRef.current, columns: newBoardData });
    };

    const handleDeleteSubtask = async (subtask_id, parent_task_id, column_id) => {
        try {
            await axios.delete(`/boards/${board_id}/subtasks/${subtask_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (e) {
            console.error(e);
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
            }
        }
    };

    const deleteSubtask = (deletedSubtask) => {
        const newBoardData = [...boardRef.current.columns];
        const columnIndex = newBoardData.findIndex(
            (column) => column.column_id === deletedSubtask.column_id
        );
        const task = findTaskById(
            newBoardData[columnIndex].tasks,
            deletedSubtask.parent_task_id
        );
        task.subtasks = task.subtasks.filter(
            (subtask) => subtask.task_id !== deletedSubtask.task_id
        );
        setBoard({ ...boardRef.current, columns: newBoardData });
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
        } catch (e) {
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
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
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
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
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
            }
        }
    };

    const handleIsDoneSubTask = (
        isDone,
        subtask_id,
        parent_task_id,
        column_id
    ) => {
        window.log("xxx");
        try {
            if (isDone) {
                axios.post(`/boards/${board_id}/tasks/${subtask_id}/isDone`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            } else {
                axios.delete(`/boards/${board_id}/tasks/${subtask_id}/isDone`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            }
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
                    subtask.completed = isDone;
                }
            });
            setBoard({ ...board, columns: newBoardData });
        } catch (e) {
            console.error(e);
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
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
        } catch (e) {
            window.log(e);
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
            }
        }
    };

    const deleteComment = async (comment_id, column_id, task_id) => {
        try {
            await axios.delete(`/tasks/comments/${comment_id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const newBoardData = [...board.columns];
            const columnIndex = newBoardData.findIndex(
                (column) => column.column_id === column_id
            );
            const task = findTaskById(newBoardData[columnIndex].tasks, task_id);
            task.comments = task.comments.filter(
                (comment) => comment.comment_id !== comment_id
            );
            setBoard({ ...board, columns: newBoardData });
        } catch (e) {
            window.log(e);
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
            }
        }
    };

    //popup
    const [showPopup, setShowPopup] = useState(false);
    const [inspectedTask, setInspectedTask] = useState(null);
    const inspectedTaskRef = useRef(inspectedTask);
    useEffect(() => {
        inspectedTaskRef.current = inspectedTask;
    }, [inspectedTask]);
    const [inspectedColumn, setInspectedColumn] = useState(null);
    const [
        inspectedCodeReviewOrDocumentation,
        setInspectedCodeReviewOrDocumentation,
    ] = useState(null);
    const [inspectedAttachmentLinks, setInspectedAttachmentLinks] =
        useState(null);
    const setTaskAsInspectedTask = (task) => {
        window.log("inspected task");
        window.log(task);
        setInspectedTask(task);
        setShowPopup(true);
    };
    const addTags = (task) => {
        setOpenTagsOnStart(true);
        setInspectedTask(task);
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        setOpenTagsOnStart(false);
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
        setShowGenerateTaskWithAGIPopup(true);
        setInspectedTask(null);
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

            setCraftedPrompts(craftedPromptsResponse.data);
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
        } catch (e) {
            console.error(e);
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
            }
            if (e?.response?.status === 403) setError(e);
            else setError(e);
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

            setCodeReviewOrDocumentation(codeReviewOrDocumentationResponse.data);
        } catch (e) {
            console.error(e);
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
            }
            if (e?.response?.status === 403) setError(e);
            else setError(e);
        }
    };

    const openCraftPromptPopup = () => {
        setShowCraftPromptPopup(true);
    };
    const handleCraftPromptCancel = () => {
        setShowCraftPromptPopup(false);
    };

    const openCodePopup = (codeReviewOrDocumentation) => {
        setInspectedCodeReviewOrDocumentation(codeReviewOrDocumentation);
        setShowCodePopup(true);
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

    const handleDeleteCodeReviewOrDocumentationButtonClick = async (
        codeReviewOrDocumentation
    ) => {
        setCodeReviewOrDocumentationToDelete(codeReviewOrDocumentation);
        setShowDeleteCodeReviewOrDocumentationConfirmation(true);
        setShowIconContainer1(false);
        setIsAGIOpen(false);
    };

    const handleDeleteCodeReviewOrDocumentationConfirm = async () => {
        await axios.delete(
            `/AGI/CodeReviewOrDocumentation/boards/${board_id}/agiAnswer/${codeReviewOrDocumentationToDelete.agi_answer_id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        handleDeleteCodeReviewOrDocumentationCancel();
    };

    const deleteCodeReviewOrDocumentation = async (
        deletedCodeReviewOrDocumentation
    ) => {
        const filteredCodeReviewOrDocumentations =
            codeReviewOrDocumentationsRef.current.filter(
                (codeReviewOrDocumentation) =>
                    codeReviewOrDocumentation.agi_answer_id !==
                    deletedCodeReviewOrDocumentation.agi_answer_id
            );
        setCodeReviewOrDocumentation(filteredCodeReviewOrDocumentations);
    };

    const handleDeleteCodeReviewOrDocumentationCancel = async () => {
        setShowDeleteCodeReviewOrDocumentationConfirmation(false);
        setCodeReviewOrDocumentationToDelete(null);
        setIsAGIOpen(false);
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
        try {
            setShowAIGeneratingLoaderPopup(true);
            const res = await getCraftedPromptResult(craftedPrompt);
            setShowAIGeneratingLoaderPopup(false);

            switch (craftedPrompt.action) {
                case "GENERATETASK":
                    openGenerateTaskWithAGIPopup(res.data, column);
                    /* setShowGenerateTaskWithAGIPopup(true);
                                                                                setInspectedTask(res.data); */
                    break;
                default:
                    break;
            }
        } catch (e) {
            console.error(e);
            setShowAIGeneratingLoaderPopup(false);
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
            }
        }
    };

    const useCrafterPromptOnTask = async (craftedPrompt, task, column) => {
        try {
            setShowAIGeneratingLoaderPopup(true);
            const res = await getCraftedPromptResult(craftedPrompt);
            setShowAIGeneratingLoaderPopup(false);

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
        } catch (e) {
            setShowAIGeneratingLoaderPopup(false);
            console.error(e);
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
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
        setShowIconContainer1(!showIconContainer1);
        columnZIndex === 1 ? setColumnZIndex(100) : setColumnZIndex(1);
    };

    const deleteAttribute = async (attribute, task_id) => {
        try {
            await axios.delete(
                `/boards/${board_id}/tasks/${task_id}/attributes`, {
                    data: {
                        attributes: [attribute]
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
        } catch (err) {
            if (err?.response?.status === 401 || err?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(err);
            }
        }
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
        } catch (e) {
            console.error(e);
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
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
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
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
        } catch (e) {
            console.error(e);
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
            }
        }
    };

    const addAttachment = async (task_id, column_id, attachment) => {
        const newBoardData = [...boardRef.current.columns];
        const columnIndex = newBoardData.findIndex(
            (column) => column.column_id === column_id
        );
        const task = findTaskById(newBoardData[columnIndex].tasks, task_id);
        if (!task.attachments) {
            task.attachments = [];
        }
        task.attachments.push(attachment);
        setBoard({ ...boardRef.current, columns: newBoardData });
    };

    const addMultipleAttachment = async (task_id, column_id, attachments) => {
        const newBoardData = [...boardRef.current.columns];
        const columnIndex = newBoardData.findIndex(
            (column) => column.column_id === column_id
        );
        const task = findTaskById(newBoardData[columnIndex].tasks, task_id);
        if (!task.attachments) {
            task.attachments = [];
        }

        attachments.forEach((attachment) => {
            task.attachments.push(attachment);
        });
        setBoard({ ...boardRef.current, columns: newBoardData });
    };

    const handleDeleteAttachment = async (task_id, column_id, attachment_id) => {
        try {
            await axios.delete(`/attachments/${attachment_id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (e) {
            console.error(e);
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
            }
        }
    };

    const deleteAttachment = async (task_id, column_id, attachment) => {
        const newBoardData = [...boardRef.current.columns];
        const columnIndex = newBoardData.findIndex(
            (column) => column.column_id === column_id
        );
        const task = findTaskById(newBoardData[columnIndex].tasks, task_id);
        task.attachments.splice(
            task.attachments.findIndex(
                (currentAttachment) =>
                    currentAttachment.attachment_id === attachment.attachment_id
            ),
            1
        );
        setBoard({ ...boardRef.current, columns: newBoardData });
    };

    const handleShowCraftPromptPopup = () => {
        setShowCraftPromptPopup(true);
        setIsAGIOpen(false);
        setIsHoveredCraft(false);
    };

    const handleShowCraftedPromptListPopup = () => {
        setShowCraftedPromptListPopup(true);
        setIsAGIOpen(false);
        setIsHoveredCraftList(false);
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
        } catch (e) {
            console.error(e);
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
            }
        }
    };

    const addMember = async (task_id, column_id, newMember) => {
        const newBoardData = [...boardRef.current.columns];
        const columnIndex = newBoardData.findIndex(
            (column) => column.column_id === column_id
        );
        const task = findTaskById(newBoardData[columnIndex].tasks, task_id);
        if (!task.members) {
            task.members = [];
        }
        task.members.push(newMember);
        setBoard({ ...boardRef.current, columns: newBoardData });
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
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
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

    const toggleLogDropdown = () => {
        getLogs();
        setIsLogOpen(!isLogOpen);
    };

    const toggleSortDropdown = () => {
        setIsSortOpen(!isSortOpen);
    };

    const toggleFilterDropdown = () => {
        setIsFilterOpen(!isFilterOpen);
    };

    const toggleFavourite = async () => {
        try {
            if (!boardIsFavourite) {
                await axios.post("/favourite/boards", {
                    board_id: board_id
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                });
            } else {
                await axios.delete("/favourite/boards", {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    data: {
                        board_id: board_id
                    }
                });
            }
            setBoardIsFavourite(!boardIsFavourite);
        } catch (err) {
            if (err?.response?.status === 401 || err?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(err);
            }
        }


    }

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

    const handlePlaceTagOnTask = async (task_id, tag, column_id) => {
        try {
            await axios.post(
                `/boards/${board_id}/tasks/${task_id}/tags/${tag.tag_id}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (e) {
            console.error(e);
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
            }
        }
    };

    const placeTagOnTask = async (task_id, tag, column_id) => {
        window.log("placeTagOnTask");
        window.log(task_id);
        window.log(tag);
        window.log(column_id);
        const newBoardData = [...boardRef.current.columns];
        const columnIndex = newBoardData.findIndex(
            (column) => column.column_id === column_id
        );
        window.log(newBoardData);
        window.log(columnIndex);
        const updatedTask = findTaskById(newBoardData[columnIndex].tasks, task_id);
        window.log(updatedTask);
        if (!updatedTask) {
            return;
        }
        if (!updatedTask.tags) {
            updatedTask.tags = [];
        }
        const existingTag = updatedTask.tags.find((t) => t.tag_id === tag.tag_id);
        if (existingTag) {
            return;
        }
        window.log(existingTag);
        updatedTask.tags.push(tag);
        updatedTask.tags.sort((a, b) => a.tag_id - b.tag_id);

        setBoard({ ...boardRef.current, columns: newBoardData });
    };

    const handleRemoveTagFromTask = async (task_id, tag_id) => {
        try {
            await axios.delete(
                `/boards/${board_id}/tasks/${task_id}/tags/${tag_id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
        } catch (e) {
            console.error(e);
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
            }
        }
    };

    const removeTagFromTask = async (task_id, tag_id, column_id) => {
        const newBoardData = [...boardRef.current.columns];
        const columnIndex = newBoardData.findIndex(
            (column) => column.column_id === column_id
        );
        if (columnIndex === -1) {
            return;
        }
        const taskExists = findTaskById(newBoardData[columnIndex].tasks, task_id);
        if (!taskExists) {
            return;
        }

        taskExists.tags = taskExists.tags.filter(
            (currentTag) => currentTag.tag_id !== tag_id
        );

        setBoard({ ...boardRef.current, columns: newBoardData });
    };

    const sortByCardName = () => {
        //frontend sorting
        const newBoardData = [...board.columns];
        newBoardData.map((column) => {
            column.tasks.sort((a, b) => a.title.localeCompare(b.title));
        });
        setBoard({ ...board, columns: newBoardData });

        //backend sorting
        board.columns.map((column) => {
            const tasks = column.tasks.map((task, index) => {
                axios.post(
                    `/columns/${column.column_id}/tasks/positions`,
                    {
                        tasks: [
                            {
                                task_id: task.task_id,
                                position: index,
                                column_id: column.column_id,
                            },
                        ],
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            });
        });
    };

    const sortByCardDeadline = () => {
        //frontend sorting
        const newBoardData = [...board.columns];
        newBoardData.map((column) => {
            column.tasks.sort((a, b) =>
                a.due_date === null
                    ? 1
                    : b.due_date === null
                        ? -1
                        : a.due_date.localeCompare(b.due_date)
            );
        });
        setBoard({ ...board, columns: newBoardData });

        //backend sorting
        board.columns.map((column) => {
            const tasks = column.tasks.map((task, index) => {
                axios.post(
                    `/columns/${column.column_id}/tasks/positions`,
                    {
                        tasks: [
                            {
                                task_id: task.task_id,
                                position: index,
                                column_id: column.column_id,
                            },
                        ],
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            });
        });
    };

    const sortByCardPriority = () => {
        //frontend sorting
        const newBoardData = [...board.columns];
        newBoardData.map((column) => {
            column.tasks.sort((a, b) =>
                a.priority_id === null
                    ? 1
                    : b.priority_id === null
                        ? -1
                        : a.priority_id - b.priority_id
            );
        });
        setBoard({ ...board, columns: newBoardData });

        //backend sorting
        board.columns.map((column) => {
            const tasks = column.tasks.map((task, index) => {
                axios.post(
                    `/columns/${column.column_id}/tasks/positions`,
                    {
                        tasks: [
                            {
                                task_id: task.task_id,
                                position: index,
                                column_id: column.column_id,
                            },
                        ],
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            });
        });
    };

    const selectAllPriorityFilter = () => {
        let newPriorityFilter = [];
        priorities.map((priority) => {
            newPriorityFilter.push(priority.priority_id);
        });
        setPriorityFilter(newPriorityFilter);
        countFilterCounts(newPriorityFilter, tagFilter);
    };

    const selectAllTagFilter = () => {
        let newTagFilter = [];
        tags.map((tag) => {
            newTagFilter.push(tag.tag_id);
        });
        setTagFilter(newTagFilter);
        countFilterCounts(priorityFilter, newTagFilter);
    };

    const deSelectAllPriorityFilter = () => {
        setPriorityFilter([]);
        countFilterCounts([], tagFilter);
    };

    const deSelectAllTagFilter = () => {
        setTagFilter([]);
        countFilterCounts(priorityFilter, []);
    };

    const checkPriorityFilter = (priority_id) => {
        let newPriorityFilter = [...priorityFilter];
        if (newPriorityFilter.includes(priority_id)) {
            newPriorityFilter = newPriorityFilter.filter(
                (priority) => priority !== priority_id
            );
        } else {
            newPriorityFilter = [...newPriorityFilter, priority_id];
        }

        setPriorityFilter(newPriorityFilter);
        countFilterCounts(newPriorityFilter, tagFilter);
    };

    const changeTagFilter = (tag_id) => {
        let newTagFilter = [...tagFilter];
        if (newTagFilter.includes(tag_id)) {
            newTagFilter = newTagFilter.filter((tag) => tag !== tag_id);
        } else {
            newTagFilter = [...newTagFilter, tag_id];
        }

        setTagFilter(newTagFilter);
        countFilterCounts(priorityFilter, newTagFilter);
    };

    const countFilterCounts = (priorityFilter, tagFilter) => {
        let count = priorityFilter.length + tagFilter.length;
        setFilterCount(count);
        if (count > 0) {
            setIsFilterActive(true);
        } else {
            setIsFilterActive(false);
        }
    };

    const clearFilters = () => {
        deSelectAllPriorityFilter();
        deSelectAllTagFilter();
        setIsFilterActive(false);
        setFilterCount(0);
        setIsHoveredClearFilterByTitleBar(false);
    };

    const handleChildData = (
        options,
        iconContainerPosition,
        showIconContainer,
        zIndex,
        taskPosition,
        task
    ) => {
        setIconContainerOptions(options);
        setIconContainerPosition(iconContainerPosition);
        setIsTaskDotsIconClicked(!isTaskDotsIconClicked);
        isTaskDotsIconClicked ? setCardZIndex(zIndex) : setCardZIndex(1);
        setShowIconContainer(showIconContainer);
        setTaskPosition(taskPosition);
        showableTask.current = task;
    };

    const getCodeReviewOrDocumentationTypeLabel = (codeReviewOrDocumentation) => {
        return codeReviewOrDocumentation.codeReviewOrDocumentationType ===
            "CODE REVIEW"
            ? "Code review"
            : "Documentation";
    };

    const confirmTitleChange = async () => {
        setBoardTitle(boardTitle);
        setShowBoardTitleEdit(false);

        try {
            await axios.put(
                `/boards/board/${board_id}`,
                {
                    name: boardTitle,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const newBoardData = { ...board };
            newBoardData.name = boardTitle;
            setBoard(newBoardData);
        } catch (e) {
            console.error(e);
            e?.response?.status === 401 || e?.response?.status === 500
                ? setError({
                    message: "You are not logged in! Redirecting to login page...",
                })
                : setError(e);
        }
    };

    const declineTitleChange = () => {
        setBoardTitle(board.name);
        setShowBoardTitleEdit(false);
    };

    const handleTitleChange = (event) => {
        setBoardTitle(event.target.value);
        setShowBoardTitleEdit(true);
    };

    const handleBlurTitle = (e) => {
        if (
            e.relatedTarget &&
            e.relatedTarget.tagName === "SPAN" &&
            e.relatedTarget.id === "check-button"
        ) {
            return;
        }
        declineTitleChange();
    };

    useEffect(() => {
        if (showBoardTitleEdit) {
            document.querySelector(".title-name-input").focus();
        }
    }, [showBoardTitleEdit]);

    return (
        <>
            {permission === false ? (
                error ? (
                    <Error error={error} redirect={redirect}></Error>
                ) : (
                    <div className="content col-10">
                        <Loader />
                    </div>
                )
            ) : (
                <DndProvider backend={HTML5Backend}>
                    {board.columns === undefined ? (
                        <div className="content col-10">
                            <Loader />
                        </div>
                    ) : (
                        <div className="content col-10" >
                            <div className="title-bar">
                                <div>
                                    {showBoardTitleEdit === false && (
                                        <h1
                                            className="title-name"
                                            onClick={() => setShowBoardTitleEdit(true)}
                                        >
                                            {boardTitle}
                                        </h1>
                                    )}
                                    {showBoardTitleEdit && (
                                        <>
                                            <input
                                                className="title-name-input"
                                                type="text"
                                                value={boardTitle}
                                                onChange={handleTitleChange}
                                                onBlur={handleBlurTitle}
                                            />
                                            <span
                                                className="edit-action-button"
                                                id="check-button"
                                                onClick={() => confirmTitleChange()}
                                                tabIndex={0}
                                            >
                                                {checkIcon}
                                            </span>
                                            <span
                                                className="edit-action-button"
                                                id="cancel-button"
                                                onClick={() => declineTitleChange()}
                                                tabIndex={0}
                                            >
                                                {xMarkIcon}
                                            </span>
                                        </>
                                    )}
                                </div>
                                <div className="title-bar-buttons">
                                    <ul>
                                        <li
                                            onMouseEnter={() => setIsHoveredFavouriteTitleBar(true)}
                                            onMouseLeave={() => setIsHoveredFavouriteTitleBar(false)}
                                            onClick={toggleFavourite}
                                            style={{
                                                color:
                                                    isHoveredFavouriteTitleBar
                                                        ? "var(--off-white)"
                                                        : "var(--dark-gray)",
                                            }}
                                        >
                                            <span
                                                className="log-button-on-title-bar"
                                                style={{
                                                    color:
                                                        isHoveredFavouriteTitleBar && boardIsFavourite
                                                            ? "yellow"
                                                            : isHoveredFavouriteTitleBar
                                                                ? "var(--off-white)"
                                                                : "var(--dark-gray)",
                                                }}
                                            >
                                                {starIcon}
                                            </span>
                                            <p>{boardIsFavourite ? "Unfavourite" : "Favourite"}</p>
                                        </li>
                                        {isFilterActive && (
                                            <li
                                                onMouseEnter={() =>
                                                    setIsHoveredClearFilterByTitleBar(true)
                                                }
                                                onMouseLeave={() =>
                                                    setIsHoveredClearFilterByTitleBar(false)
                                                }
                                                onClick={clearFilters}
                                                style={{
                                                    color: isHoveredClearFilterByTitleBar
                                                        ? "var(--off-white)"
                                                        : "var(--dark-gray)",
                                                }}
                                            >
                                                <span>{filterDeleteIcon}</span>
                                                <p>Clear filters</p>
                                            </li>
                                        )}
                                        <li
                                            onMouseEnter={() => setIsHoveredFilterByTitleBar(true)}
                                            onMouseLeave={() => setIsHoveredFilterByTitleBar(false)}
                                            onClick={toggleFilterDropdown}
                                            style={{
                                                color:
                                                    isHoveredFilterByTitleBar || isFilterOpen
                                                        ? "var(--off-white)"
                                                        : "var(--dark-gray)",
                                            }}
                                        >
                                            <span>{filterIcon}</span>
                                            <p>
                                                Filter {filterCount > 0 ? "(" + filterCount + ")" : ""}
                                            </p>
                                        </li>
                                        {isFilterActive === false ? (
                                            <li
                                                onMouseEnter={() => setIsHoveredSortByTitleBar(true)}
                                                onMouseLeave={() => setIsHoveredSortByTitleBar(false)}
                                                onClick={toggleSortDropdown}
                                                style={{
                                                    color:
                                                        isHoveredSortByTitleBar || isSortOpen
                                                            ? "var(--off-white)"
                                                            : "var(--dark-gray)",
                                                }}
                                            >
                                                <span>{sortIcon}</span>
                                                <p>Sort by</p>
                                            </li>
                                        ) : (
                                            <li
                                                style={{
                                                    color: "rgba(var(--dark-grayRGB), 0.3)",
                                                    cursor: "not-allowed",
                                                }}
                                            >
                                                <span>{sortIcon}</span>
                                                <p>Sort by</p>
                                            </li>
                                        )}
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
                                        <li
                                            onMouseEnter={() => setIsHoveredLogTitleBar(true)}
                                            onMouseLeave={() => setIsHoveredLogTitleBar(false)}
                                            onClick={toggleLogDropdown}
                                            style={{
                                                color:
                                                    isHoveredLogTitleBar || isLogOpen
                                                        ? "var(--off-white)"
                                                        : "var(--dark-gray)",
                                            }}
                                        >
                                            <span
                                                className="log-button-on-title-bar"
                                                style={{
                                                    color:
                                                        isHoveredLogTitleBar || isLogOpen
                                                            ? "var(--off-white)"
                                                            : "var(--dark-gray)",
                                                }}
                                            >
                                                {bookIcon}
                                            </span>
                                            <p>Log</p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="Board_Without_title">
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
                                            canMove={editingColumnIndex !== index}
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
                                                                if (
                                                                    e.key === "Enter" &&
                                                                    columnNewTitle?.length > 0
                                                                ) {
                                                                    handleColumnTitleBlur(index);
                                                                } else if (e.key === "Escape") {
                                                                    handleColumnTitleBlur(index, true); // Pass `true` to indicate that changes are cancelled
                                                                }
                                                            }}
                                                        />
                                                        <button
                                                            className="edit-action-button"
                                                            id="check-button"
                                                            disabled={columnNewTitle?.length < 1}
                                                            onClick={() => handleColumnTitleBlur(index)}
                                                        >
                                                            {checkIcon}
                                                        </button>
                                                        <button
                                                            className="edit-action-button"
                                                            id="cancel-button"
                                                            onClick={() => handleColumnTitleBlur(index, true)}
                                                        >
                                                            {xMarkIcon}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div
                                                            className="column-title-container"
                                                            onDoubleClick={() => {
                                                                const permissionsFilter = permissions.filter(
                                                                    (permission) =>
                                                                        permission.permission ===
                                                                        "column_management"
                                                                );
                                                                if (permissionsFilter.length === 1) {
                                                                    handleColumnTitleDoubleClick(index);
                                                                }
                                                            }}
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
                                                {column.task_limit != 0 &&
                                                    column.task_limit != null && (
                                                        <p
                                                            style={{
                                                                marginTop: "-25px",
                                                                color: "var(--light-gray)",
                                                            }}
                                                        >
                                                            {column.tasks.length + "/" + column.task_limit}
                                                        </p>
                                                    )}
                                                <div className="task-container">
                                                    {/*get tasks that match the filters*/}
                                                    {column.tasks.length === 0 ? (
                                                        // Render the default task if no tasks exist
                                                        <TaskPlaceholder
                                                            key={index}
                                                            column={column}
                                                            divName={`div${index + 1}`}
                                                            isFilterActive={isFilterActive}
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
                                                        />
                                                    ) : (
                                                        column.tasks
                                                            .filter((task) => {
                                                                if (
                                                                    priorityFilter.length == 0 &&
                                                                    tagFilter.length == 0
                                                                ) {
                                                                    return true;
                                                                } else if (priorityFilter.length == 0) {
                                                                    return task.tags.some((tag) =>
                                                                        tagFilter.includes(tag.tag_id)
                                                                    );
                                                                } else if (tagFilter.length == 0) {
                                                                    return priorityFilter.includes(
                                                                        task.priority_id
                                                                    );
                                                                } else {
                                                                    return (
                                                                        priorityFilter.includes(task.priority_id) &&
                                                                        task.tags.some((tag) =>
                                                                            tagFilter.includes(tag.tag_id)
                                                                        )
                                                                    );
                                                                }
                                                            })
                                                            .map((task, taskIndex) => (
                                                                <Task
                                                                    permissions={permissions}
                                                                    key={task.task_id}
                                                                    id={task.task_id}
                                                                    index={taskIndex}
                                                                    task={task}
                                                                    column={column}
                                                                    ref={showableTask}
                                                                    craftedPromptsTask={craftedPromptsTask}
                                                                    divName={`div${index + 1}`}
                                                                    favouriteTask={handleFavouriteTask}
                                                                    unFavouriteTask={handleUnFavouriteTask}
                                                                    deleteTask={handleDeleteTaskButtonClick}
                                                                    setTaskAsInspectedTask={
                                                                        setTaskAsInspectedTask
                                                                    }
                                                                    openGenerateTaskWithAGIPopup={
                                                                        openGenerateTaskWithAGIPopup
                                                                    }
                                                                    clickable={taskIsClickable}
                                                                    handleTaskDoubleClick={() =>
                                                                        setTaskAsInspectedTask(task)
                                                                    }
                                                                    addTags={addTags}
                                                                    onChildData={handleChildData}
                                                                    showIconContainer={showIconContainer}
                                                                    zIndex={cardZIndex}
                                                                    isFilterActive={isFilterActive}
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
                                                                    handleAddMember={handleAddMember}
                                                                />
                                                            ))
                                                    )}
                                                </div>
                                                {column.is_finished === 0 &&
                                                    permissions.filter((permission) => {
                                                        return permission.permission === "task_management";
                                                    }).length === 1 ? (
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
                                    {/*check permission for loumn magamegemt*/}
                                    {permissions.filter((permission) => {
                                        return permission.permission === "column_management";
                                    }).length === 1 && (
                                            <div
                                                className="card-container addbtn-column"
                                                onClick={handleAddColumn}
                                            >
                                                {plusIcon} Add new column
                                            </div>
                                        )}
                                </div>
                            </div>
                        </div>
                    )}
                    {isSortOpen && (
                        <>
                            <div
                                className="overlay3"
                                onClick={() => {
                                    setIsSortOpen(false);
                                }}
                            ></div>
                            <div className="sort-submenu" >
                                <p className="sort-menu-title"> Sort menu </p>
                                <ul className="sort-menu">
                                    <li
                                        onMouseEnter={() => setIsHoveredName(true)}
                                        onMouseLeave={() => setIsHoveredName(false)}
                                        onClick={() => {
                                            sortByCardName();
                                        }}
                                    >
                                        <span
                                            className="craft-button"
                                            style={{
                                                color: isHoveredName ? "var(--magic)" : "",
                                            }}
                                        >
                                            {sortNameIcon}
                                        </span>
                                        <span>Sort by name</span>
                                    </li>
                                    <li
                                        onMouseEnter={() => setIsHoveredDeadline(true)}
                                        onMouseLeave={() => setIsHoveredDeadline(false)}
                                        onClick={() => {
                                            sortByCardDeadline();
                                        }}
                                    >
                                        <span
                                            className="craft-button"
                                            style={{
                                                color: isHoveredDeadline ? "var(--edit)" : "",
                                            }}
                                        >
                                            {sortDeadlineIcon}
                                        </span>
                                        <span>Sort by deadline</span>
                                    </li>
                                    <li
                                        onMouseEnter={() => setIsHoveredPriority(true)}
                                        onMouseLeave={() => setIsHoveredPriority(false)}
                                        onClick={() => {
                                            sortByCardPriority();
                                        }}
                                    >
                                        <span
                                            className="craft-button"
                                            style={{
                                                color: isHoveredPriority ? "var(--important)" : "",
                                            }}
                                        >
                                            {sortPriorityIcon}
                                        </span>
                                        <span>Sort by priority</span>
                                    </li>
                                </ul>
                            </div>
                        </>
                    )}
                    {isFilterOpen && (
                        <>
                            <div
                                className="overlay3"
                                onClick={() => {
                                    setIsFilterOpen(false);
                                }}
                            ></div>
                            <div className="filter-submenu" >
                                <p className="filter-menu-title"> Filter menu </p>
                                <div className="filter-menu">
                                    <div className="filter-category">
                                        <p>Priority:</p>
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "start",
                                                gap: "10px",
                                                marginTop: "20px",
                                            }}
                                        >
                                            <button
                                                className="select-all-button"
                                                onClick={selectAllPriorityFilter}
                                            >
                                                select all
                                            </button>
                                            <button
                                                className="select-all-button"
                                                onClick={deSelectAllPriorityFilter}
                                            >
                                                unselect all
                                            </button>
                                        </div>
                                        <div className="filter-checkbox-container">
                                            {priorities.map((priority) => (
                                                <div
                                                    key={priority.priority_id}
                                                    className="filter-checkbox-item"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        id={priority.priority_id}
                                                        onChange={() =>
                                                            checkPriorityFilter(priority.priority_id)
                                                        }
                                                        checked={priorityFilter.includes(
                                                            priority.priority_id
                                                        )}
                                                    />
                                                    <label htmlFor={priority.priority_id}>
                                                        {priority.priority}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="filter-category">
                                        <p>Tag:</p>
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "start",
                                                gap: "10px",
                                                marginTop: "20px",
                                            }}
                                        >
                                            <button
                                                className="select-all-button"
                                                onClick={selectAllTagFilter}
                                            >
                                                select all
                                            </button>
                                            <button
                                                className="select-all-button"
                                                onClick={deSelectAllTagFilter}
                                            >
                                                unselect all
                                            </button>
                                        </div>
                                        <div className="filter-checkbox-container">
                                            {tags.map((tag) => (
                                                <div
                                                    key={"tag: " + tag.tag_id}
                                                    className="filter-checkbox-item"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        id={"tag: " + tag.tag_id}
                                                        onChange={() => changeTagFilter(tag.tag_id)}
                                                        checked={tagFilter.includes(tag.tag_id)}
                                                    />
                                                    <label
                                                        className="tag-filter-label"
                                                        htmlFor={"tag: " + tag.tag_id}
                                                        style={{
                                                            backgroundColor: tag.color,
                                                        }}
                                                    >
                                                        <p style={{margin: '2px 10px 2px 10px'}}
                                                        >{tag.name}</p>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                    {isAGIOpen && (
                        <>
                            <div
                                className="overlay3"
                                onClick={() => {
                                    setIsAGIOpen(false);
                                }}
                            ></div>
                            <div className="agi-submenu" >
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
                                                color: isHoveredPerformanceSummary
                                                    ? "var(--craft)"
                                                    : "",
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
                                        onMouseEnter={() => setIsHoveredCraftList(true)}
                                        onMouseLeave={() => setIsHoveredCraftList(false)}
                                        onClick={() => {
                                            handleShowCraftedPromptListPopup();
                                        }}
                                    >
                                        <span
                                            className="craft-button"
                                            style={{
                                                color: isHoveredCraftList ? "var(--craft)" : "",
                                            }}
                                        >
                                            {craftIcon}
                                        </span>
                                        <span>Crafted Prompts</span>
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
                                        <span>Code Review or Documentation</span>
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
                                                                isHoveredCode === index + 1
                                                                    ? "var(--code)"
                                                                    : "",
                                                        }}
                                                    >
                                                        {codeIcon}
                                                    </span>
                                                    {getCodeReviewOrDocumentationTypeLabel(element) +
                                                        " " +
                                                        (index + 1)}
                                                </span>
                                                <span
                                                    className="delete-code-review-or-documentation-button"
                                                    onClick={() => {
                                                        handleDeleteCodeReviewOrDocumentationButtonClick(
                                                            element
                                                        );
                                                    }}
                                                >
                                                    {xMarkIcon}
                                                </span>
                                            </li>
                                        </ul>
                                    ))}
                                </ul>
                            </div>
                        </>
                    )}
                    {isLogOpen && (
                        <>
                            <div
                                className="overlay3"
                                onClick={() => {
                                    setIsLogOpen(false);
                                }}
                            ></div>
                            <LogComponent
                                logs={logs}
                            />
                        </>
                    )}
                    {showIconContainer && (
                        <div
                            className="overlay"
                            onClick={() => {
                                setShowIconContainer(false);
                                setColumnZIndex(1);
                            }}
                        >
                            <IconContainer
                                iconContainerPosition={iconContainerPosition}
                                options={iconContainerOptions}
                            />
                        </div>
                    )}
                    {showIconContainer1 && (
                        <div
                            className="overlay"
                            onClick={() => {
                                setShowIconContainer1(false);
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
                                {permissions.filter(
                                    (permission) => permission.permission === "column_management"
                                ).length === 1 && (
                                        <div
                                            className="option"
                                            onMouseEnter={() => setIsHoveredX(true)}
                                            onMouseLeave={() => setIsHoveredX(false)}
                                            onClick={(e) =>
                                                handleDeleteColumnButtonClick(e, columnIndex)
                                            }
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
                                    )}
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
                            onCancel={handleGenerateTaskCancel}
                        />
                    )}
                    {showTaskNamePopup && (
                        <SimpleTextPopup
                            title={"Task name:"}
                            minLength={1}
                            onConfirm={handleTaskNameConfirm}
                            onCancel={handleTaskNameCancel}
                        />
                    )}
                    {showColumnNamePopup && (
                        <AddColumnPopup
                            minLength={1}
                            onConfirm={handleColumnNameConfirm}
                            onCancel={handleColumnNameCancel}
                        />
                    )}
                    {showDeleteTaskConfirmation && (
                        <ConfirmationPopup
                            action="Delete"
                            text={taskToDelete.title}
                            onCancel={handleDeleteTaskCancel}
                            onConfirm={handleDeleteTaskConfirm}
                        />
                    )}
                    {showDeleteColumnConfirmation && (
                        <ConfirmationPopup
                            action="Delete"
                            text={board.columns[columnToDeleteIndex]?.name}
                            onCancel={handleDeleteColumnCancel}
                            onConfirm={handleDeleteColumnConfirm}
                        />
                    )}
                    {showDeleteCodeReviewOrDocumentationConfirmation && (
                        <ConfirmationPopup
                            action="Delete"
                            text={getCodeReviewOrDocumentationTypeLabel(
                                codeReviewOrDocumentationToDelete
                            )}
                            onCancel={handleDeleteCodeReviewOrDocumentationCancel}
                            onConfirm={handleDeleteCodeReviewOrDocumentationConfirm}
                        />
                    )}
                    {showCraftedPromptListPopup && (
                        <CraftedPromptListPopup
                            board_id={board_id}
                            craftedPrompts={craftedPrompts}
                            onCancel={() => setShowCraftedPromptListPopup(false)}
                        />
                    )}
                    {showCraftPromptPopup && (
                        <CraftPromptPopup
                            board_id={board_id}
                            onCancel={() => setShowCraftPromptPopup(false)}
                        />
                    )}
                    {showGeneratePerformanceSummaryPopup && (
                        <GeneratePerformanceSummaryPopup
                            board_id={board_id}
                            onCancel={() => setShowGeneratePerformanceSummaryPopup(false)}
                        />
                    )}
                    {showSuccessfulDeletePopup && (
                        <SimpleLabelPopup
                            title={"Successfully deleted"}
                            onCancel={() => setShowSuccessfulDeletePopup(false)}
                        />
                    )}
                    {showAIGeneratingLoaderPopup && (
                        <SimpleLoaderPopup title={"Generating..."} />
                    )}
                </DndProvider>
            )}
            {showPopup && (
                <Popup
                    task={inspectedTask}
                    openTagsOnStart={openTagsOnStart}
                    onClose={handleClosePopup}
                    onSave={handleSavePopup}
                    board_id={board_id}
                    addSubtask={handleAddSubtask}
                    deleteSubtask={handleDeleteSubtask}
                    changeIsDoneSubTask={handleIsDoneSubTask}
                    favouriteSubtask={handleFavouriteSubtask}
                    unFavouriteSubtask={handleUnFavouriteSubtask}
                    handlePostComment={postComment}
                    handleDeleteComment={deleteComment}
                    setTaskAsInspectedTask={setTaskAsInspectedTask}
                    onPreviousTask={handleOpenPreviousTask}
                    priorities={priorities}
                    modifyPriority={handleModifyPriority}
                    modifyDeadline={handleModifyDeadline}
                    deleteAttribute={deleteAttribute}
                    addAttachment={handleAddAttachment}
                    deleteAttachment={handleDeleteAttachment}
                    addMember={handleAddMember}
                    deleteMember={handleDeleteMember}
                    tags={inspectedTask.tags}
                    placeTagOnTask={handlePlaceTagOnTask}
                    removeTagFromTask={handleRemoveTagFromTask}
                    ref={popupRef}
                />
            )}
            {error && (
                <ErrorWrapper
                    originalError={error}
                    onClose={() => {
                        setError(null);
                    }}
                />
            )}
        </>
    );
};

export default Board;
