import React, { useState, useRef, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Task, plusIcon } from './Task';
import ConfirmationPopup from './ConfirmationPopup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faXmark, faWandMagicSparkles, faEllipsis } from '@fortawesome/free-solid-svg-icons';
import '../../styles/board.css';
import '../../styles/popup.css';
import { useParams } from 'react-router';
import axios from '../../api/axios';
import Error from '../Error';
import Loader from '../Loader';
import { Column } from './Columns';
import Popup from './Popup';
import cloneDeep from 'lodash/cloneDeep';
import GenerateTaskWithAGIPopup from '../GenerateTaskWithAGIPopup';
import { useNavigate } from 'react-router-dom';

export const aiIcon = <FontAwesomeIcon icon={faWandMagicSparkles} />;
export const dotsIcon = <FontAwesomeIcon icon={faEllipsis} />;

const Board = () => {
    const { board_id, column_to_show_id, task_to_show_id } = useParams();
    const [permission, setPermission] = useState(false);
    const [error, setError] = useState(false);
    const [board, setBoard] = useState([]);
    const [columnPositions, setColumnPositions] = useState([]);
    const [editingColumnIndex, setEditingColumnIndex] = useState(null);
    const [columnToDeleteIndex, setColumnToDeleteIndex] = useState(null);
    const [showDeleteConfirmation, setShowDeleteColumnConfirmation] = useState(false);
    const originalTitle = useRef(null);
    const editBoxRef = useRef(null);
    const [columnNewTitle, setColumnNewTitle] = useState('');
    const [showGenerateTaskWithAGIPopup, setShowGenerateTaskWithAGIPopup] = useState(false);
    const [cardZIndex, setCardZIndex] = useState(1);
    const [iconContainerPosition, setIconContainerPosition] = useState({ x: 0, y: 0 });
    const [showIconContainer, setShowIconContainer] = useState(false);
    const [isHoveredAI, setIsHoveredAI] = useState(false);
    const [isHoveredX, setIsHoveredX] = useState(false);
    const [columnIndex, setColumnIndex] = useState(null);
    const navigate = useNavigate();

    const checkIcon = <FontAwesomeIcon icon={faCheck} />;
    const xMarkIcon = <FontAwesomeIcon icon={faXmark} />;

    const token = sessionStorage.getItem('token');

    useEffect(() => {
        document.title = 'Board'
        fetchBoardData();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if the click was outside the title edit input box
            if (editBoxRef.current && !editBoxRef.current.contains(event.target)) {
                handleColumnTitleBlur(editingColumnIndex);
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [editingColumnIndex]);

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
            tempColumns.map((column) => column.tasks.sort((a, b) => a.position - b.position));
            tempBoard.columns = tempColumns.sort((a, b) => a.position - b.position);

            let tempColumnPositions = tempBoard.columns.map((column) => column.column_id);
            setColumnPositions(tempColumnPositions);

            console.log('Columns: ', tempBoard.columns);

            setBoard(tempBoard);

            if (task_to_show_id) {
                const columnIndex = tempBoard.columns.findIndex((column) => column.column_id === parseInt(column_to_show_id));
                const task = findTaskById(tempBoard.columns[columnIndex].tasks, parseInt(task_to_show_id));
                if (task) {
                    setTaskAsInspectedTask(task);
                }
                navigate(`/board/${board_id}`)
            }
        } catch (e) {
            console.error(e);
            if (e.response.status === 403) setError('No permission');
            else setError(e);
            setPermission(false);
        }
    };

    const handleAddColumn = async () => {
        try {
            const formData = new FormData();
            formData.append('name', 'New Column');
            formData.append('is_finished', 0);
            formData.append('task_limit', 5);
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
        }
    };

    const moveColumnBackend = async (dragIndex, hoverIndex) => {
        try {
            setEditingColumnIndex(null);

            let tempPositions = columnPositions;
            tempPositions.splice(hoverIndex, 0, tempPositions.splice(dragIndex, 1)[0]);
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
        }
    };

    const handleDeleteButtonClick = (event, columnIndex) => {
        event.stopPropagation();
        setShowDeleteColumnConfirmation(true);
        setColumnToDeleteIndex(columnIndex);
        setShowIconContainer(false);
    };

    const handleColumnDeleteConfirm = () => {
        console.log('confirm');

        try {
            axios.delete(`/boards/${board_id}/columns/${board.columns[columnToDeleteIndex].column_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const newBoardData = [...board.columns];
            newBoardData.splice(columnToDeleteIndex, 1);
            setColumnPositions(newBoardData.map((column) => column.column_id));
            setBoard({ ...board, columns: newBoardData });
        } catch (e) {
            console.error(e);
        }

        setShowDeleteColumnConfirmation(false);
        setColumnToDeleteIndex(null);
    };

    const handleColumnDeleteCancel = () => {
        console.log('cancel');
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
            if (columnNewTitle === '') {
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
        }
    };

    const moveCardFrontend = (dragIndex, hoverIndex, sourceDivIndex, targetDivIndex) => {
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

    const moveCardBackend = async (dragIndex, hoverIndex, sourceDivIndex, targetDivIndex) => {
        const sourceDiv = board.columns[sourceDivIndex];
        const task_to_modify_id = sourceDiv.tasks[hoverIndex].task_id;
        const to_column_id = sourceDiv.column_id;
        if (hoverIndex === 0) {
            sourceDiv.tasks[hoverIndex].position = sourceDiv.tasks[hoverIndex + 1].position / 2;
        } else if (hoverIndex === sourceDiv.tasks.length - 1) {
            sourceDiv.tasks[hoverIndex].position = sourceDiv.tasks[hoverIndex - 1].position + 1;
        } else {
            sourceDiv.tasks[hoverIndex].position =
                (sourceDiv.tasks[hoverIndex - 1].position + sourceDiv.tasks[hoverIndex + 1].position) / 2;
        }

        const position = sourceDiv.tasks[hoverIndex].position;

        try {
            await axios.post(
                `/columns/${board_id}/tasks/positions`,
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
            const columnIndex = newTaskData.findIndex((column) => column.column_id === column_id);
            const taskIndex = newTaskData[columnIndex].tasks.findIndex((task) => task.task_id === task_id);
            newTaskData[columnIndex].tasks[taskIndex].title = title;
            newTaskData[columnIndex].tasks[taskIndex].description = description;
            setBoard({ ...board, columns: newTaskData });
        } catch (err) {
            console.log(err);
        }
    };

    const handleDeleteTask = async (taskId, column_id) => {
        try {

            await axios.delete(`/boards/${board_id}/tasks/${taskId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const targetDiv = board.columns.find((column) => column.column_id === column_id);
            const updatedtasks = targetDiv.tasks.filter((task) => task.task_id !== taskId);
            const newColumnData = [...board.columns];
            const columnIndex = newColumnData.findIndex((column) => column.column_id === column_id);
            newColumnData[columnIndex] = { ...targetDiv, tasks: updatedtasks };
            setBoard({ ...board, columns: newColumnData });
        } catch (e) {
            console.error(e);
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
        }
    };

    const handleAddSubtask = async (parent_task_id, column_id) => {
        try {
            const response = await axios.post(
                `/boards/${board_id}/tasks/${parent_task_id}/subtasks`,
                { title: 'New subtask' },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const newSubtask = response.data.task;
            const newBoardData = [...board.columns];
            const columnIndex = newBoardData.findIndex((column) => column.column_id === column_id);
            const task = findTaskById(newBoardData[columnIndex].tasks, parent_task_id);
            task.subtasks.push(newSubtask);
            setBoard({ ...board, columns: newBoardData });
        } catch (err) {
            console.log(err);
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
            const columnIndex = newBoardData.findIndex((column) => column.column_id === column_id);
            const task = findTaskById(newBoardData[columnIndex].tasks, parent_task_id);
            task.subtasks.splice(
                task.subtasks.findIndex((subtask) => subtask.task_id === subtask_id),
                1
            );
            setBoard({ ...board, columns: newBoardData });
        } catch (e) {
            console.error(e);
        }
    };

    const handleEditSubtask = async (subtask_id, parent_task_id, column_id, title, description) => {
        try {
            await axios.put(
                `/boards/${board_id}/subtasks/${subtask_id}`,
                { title: title, description: description },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const newBoardData = [...board.columns];
            const columnIndex = newBoardData.findIndex((column) => column.column_id === column_id);
            const task = findTaskById(newBoardData[columnIndex].tasks, parent_task_id);
            task.subtasks.map((subtask) => {
                if (subtask.task_id === subtask_id) {
                    subtask.title = title;
                    subtask.description = description;
                }
            });
            setBoard({ ...board, columns: newBoardData });

            handleOpenPreviousTask(parent_task_id, column_id);
        } catch (err) {
            console.log(err);
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
            const columnIndex = newBoardData.findIndex((column) => column.column_id === column_id);
            const task = findTaskById(newBoardData[columnIndex].tasks, parent_task_id);
            task.subtasks.map((subtask) => {
                if (subtask.task_id === subtask_id) {
                    subtask.is_favourite = true;
                }
            });
            setBoard({ ...board, columns: newBoardData });
        } catch (e) {
            console.error(e);
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
            const columnIndex = newBoardData.findIndex((column) => column.column_id === column_id);
            const task = findTaskById(newBoardData[columnIndex].tasks, parent_task_id);
            task.subtasks.map((subtask) => {
                if (subtask.task_id === subtask_id) {
                    subtask.is_favourite = false;
                }
            });
            setBoard({ ...board, columns: newBoardData });
        } catch (e) {
            console.error(e);
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
            const columnIndex = newBoardData.findIndex((column) => column.column_id === column_id);
            const task = findTaskById(newBoardData[columnIndex].tasks, task_id);
            task.comments.push(newComment);
            setBoard({ ...board, columns: newBoardData });
        } catch (err) {
            console.log(err);
        }
    };

    //popup
    const [showPopup, setShowPopup] = useState(false);
    const [inspectedTask, setInspectedTask] = useState(null);

    const setTaskAsInspectedTask = (task) => {
        setInspectedTask(task);
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
    };

    const handleOpenPreviousTask = (previousTask_id, column_id) => {
        setShowPopup(false);
        const tasks = board.columns.find((column) => column.column_id === column_id).tasks;
        const previousTask = findTaskById(tasks, previousTask_id);
        setInspectedTask(previousTask);
        setShowPopup(true);
    };

    const handleSavePopup = async (task_id, parent_task_id, column_id, newTitle, newDescription) => {
        if (parent_task_id === null) {
            await handleEditTask(task_id, column_id, newTitle, newDescription);
            setShowPopup(false);
        } else {
            await handleEditSubtask(task_id, parent_task_id, column_id, newTitle, newDescription);
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

    const openGenerateTaskWithAGIPopup = (task) => {
        setShowGenerateTaskWithAGIPopup(true);
        console.log(task);
        if (task) {
            setInspectedTask([cloneDeep(task)]);
        }
    };

    const handleGenerateTaskCancel = () => {
        setShowGenerateTaskWithAGIPopup(false);
        setInspectedTask(null);
    };

    const handleDotsClick = (event, columnIndex) => {
        const buttonRect = event.target.getBoundingClientRect();
        const newX = buttonRect.right + 20;
        const newY = buttonRect.top;

        setColumnIndex(columnIndex);
        setIconContainerPosition({ x: newX, y: newY });
        setShowIconContainer(!showIconContainer);
        cardZIndex === 1 ? setCardZIndex(100) : setCardZIndex(1);
    };

    return (
        <>
            {permission === false ? (
                error ? (
                    <Error error={error}></Error>
                ) : (
                    <div className='content'>
                        <Loader />
                    </div>
                )
            ) : (
                <DndProvider backend={HTML5Backend}>
                    {board.columns === undefined ? (
                        <div className='content'>
                            <Loader />
                        </div>
                    ) : (
                        <div className='content'>
                            <h1>{board.name}</h1>
                            <div className='div-container'>
                                {board.columns.map((column, index) => (
                                    <Column
                                        key={index}
                                        divIndex={index}
                                        moveColumnFrontend={moveColumnFrontend}
                                        moveColumnBackend={moveColumnBackend}
                                    >
                                        <div className='card-container'>
                                            {editingColumnIndex === index ? (
                                                <div className='name-edit'>
                                                    <input
                                                        type='text'
                                                        value={columnNewTitle}
                                                        onChange={(event) => handleColumnTitleChange(event, index)}
                                                        autoFocus
                                                        ref={editBoxRef} // Set the ref to the title edit input box
                                                        onClick={(e) => e.stopPropagation()}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handleColumnTitleBlur(index);
                                                            } else if (e.key === 'Escape') {
                                                                handleColumnTitleBlur(index, true); // Pass `true` to indicate that changes are cancelled
                                                            }
                                                        }}
                                                    />
                                                    <span
                                                        className='edit-action-button'
                                                        id='check-button'
                                                        onClick={() => handleColumnTitleBlur(index)}
                                                    >
                                                        {checkIcon}
                                                    </span>
                                                    <span
                                                        className='edit-action-button'
                                                        id='cancel-button'
                                                        onClick={() => handleColumnTitleBlur(index, true)}
                                                    >
                                                        {xMarkIcon}
                                                    </span>
                                                </div>
                                            ) : (
                                                <>
                                                    <div
                                                        className='column-title-container'
                                                        onDoubleClick={() => handleColumnTitleDoubleClick(index)}
                                                    >
                                                        <h2 className='card-title'>{column.name}</h2>
                                                    </div>
                                                    {/*index === 0 && (
                                                        <span
                                                            className='ai-button generate-task-button'
                                                            onClick={() => openGenerateTaskWithAGIPopup(null)}
                                                        >
                                                            {aiIcon}
                                                        </span>
                                                    )*/}
                                                    <div className='options' style={{ visibility: 'visible' }}>
                                                        <span
                                                            className='dots'
                                                            onClick={(e) => handleDotsClick(e, index)}
                                                            style={{
                                                                visibility: 'visible',
                                                                transition: 'visibility 0.1s ease',
                                                            }}
                                                        >
                                                            {dotsIcon}
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                            <div className='task-container'>
                                                {column.tasks.map((task, taskIndex) => (
                                                    <Task
                                                        key={task.task_id}
                                                        id={task.task_id}
                                                        index={taskIndex}
                                                        task={task}
                                                        divName={`div${index + 1}`}
                                                        favouriteTask={handleFavouriteTask}
                                                        unFavouriteTask={handleUnFavouriteTask}
                                                        deleteTask={handleDeleteTask}
                                                        setTaskAsInspectedTask={setTaskAsInspectedTask}
                                                        openGenerateTaskWithAGIPopup={openGenerateTaskWithAGIPopup}
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
                                                        generateTasks={(task) => openGenerateTaskWithAGIPopup(task)}
                                                    />
                                                ))}
                                            </div>
                                            {column.is_finished === 0 ? (
                                                <div className='card addbtn' onClick={() => handleAddTask(index)}>
                                                    {plusIcon} Add new task
                                                </div>
                                            ) : (
                                                <></>
                                            )}
                                        </div>
                                    </Column>
                                ))}
                                <div className='card-container addbtn-column' onClick={handleAddColumn}>
                                    {plusIcon} Add new column
                                </div>
                            </div>
                        </div>
                    )}
                    {showIconContainer && (
                        <div
                            className='overlay'
                            onClick={() => {
                                setShowIconContainer(false);
                                setCardZIndex(1);
                            }}
                        >
                            <div
                                className='icon-container'
                                style={{
                                    position: 'fixed',
                                    left: iconContainerPosition.x + 'px',
                                    top: iconContainerPosition.y + 'px',
                                }}
                            >
                                <div
                                    className='option'
                                    onMouseEnter={() => setIsHoveredAI(true)}
                                    onMouseLeave={() => setIsHoveredAI(false)}
                                    onClick={() => openGenerateTaskWithAGIPopup(null)}
                                >
                                    <span
                                        className='ai-button'
                                        style={{
                                            color: isHoveredAI ? 'var(--magic)' : '',
                                        }}
                                    >
                                        {aiIcon}
                                    </span>
                                    <p>Generate Subtasks</p>
                                </div>
                                <div
                                    className='option'
                                    onMouseEnter={() => setIsHoveredX(true)}
                                    onMouseLeave={() => setIsHoveredX(false)}
                                    onClick={(e) => handleDeleteButtonClick(e, columnIndex)}
                                >
                                    <span
                                        className='delete-column-button'
                                        style={{
                                            color: isHoveredX ? 'var(--important)' : '',
                                        }}
                                    >
                                        {xMarkIcon}
                                    </span>
                                    <p>Delete Column</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {showGenerateTaskWithAGIPopup && (
                        <GenerateTaskWithAGIPopup tasks={inspectedTask} onCancel={handleGenerateTaskCancel} />
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
                />
            )}
        </>
    );
};

export default Board;
