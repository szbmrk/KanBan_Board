import React, { useState, useRef, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card, plusIcon } from './Card';
import { useDrop, useDrag } from 'react-dnd';
import ConfirmationPopup from './ConfirmationPopup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import '../styles/dragdrop.css';
import { useParams } from 'react-router';
import axios from '../api/axios';
import Error from './Error';
import Loader from './Loader';

const DragDrop = () => {
    const { board_id } = useParams();
    const [permission, setPermission] = useState(false);
    const [error, setError] = useState(false);
    const [board, setBoard] = useState([]);
    const [columnPositions, setColumnPositions] = useState([]);

    useEffect(() => {
        fetchBoardData();
    }, []);

    const fetchBoardData = async () => {
        const token = sessionStorage.getItem('token');

        try {
            const response = await axios.get(`/boards/${board_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setPermission(true);
            let tempBoard = response.data.board;
            const user_id = sessionStorage.getItem('user_id');
            const response1 = await axios.get(`/favourite/${user_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            let tempColumns = tempBoard.columns.map((column) => {
                const filteredTasks = column.tasks.filter((task) => task.parent_task_id === null);

                const tasks = filteredTasks.map((task) => {
                    const is_favourite = response1.data.favourites.some(
                        (favourite) => favourite.task_id === task.task_id
                    );
                    return { ...task, is_favourite };
                });

                return { ...column, tasks };
            });

            // Sort the columns and tasks by position
            tempColumns.map((column) => column.tasks.sort((a, b) => a.position - b.position));
            tempBoard.columns = tempColumns.sort((a, b) => a.position - b.position);

            let tempColumnPositions = tempBoard.columns.map((column) => column.column_id);
            setColumnPositions(tempColumnPositions);

            console.log(tempBoard.columns);

            setBoard(tempBoard);
        } catch (e) {
            console.error(e);
            if (e.response.status === 403) setError('No permission');
            else setError('Board not found');
            setPermission(false);
        }
    };

    const checkIcon = <FontAwesomeIcon icon={faCheck} />;
    const xMarkIcon = <FontAwesomeIcon icon={faXmark} />;

    const Column = ({ divIndex, moveColumnFrontend, moveColumnBackend, children }) => {
        const [originalPos, setOriginalPos] = useState(null);

        const [{ isDragging }, drag] = useDrag({
            type: 'DIV',
            item() {
                setOriginalPos(divIndex);
                return { index: divIndex };
            },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
            end: (item, monitor) => {
                if (originalPos !== undefined && item.hoverIndex !== undefined) {
                    if (originalPos === item.hoverIndex) return;
                    moveColumnBackend(originalPos, item.hoverIndex);
                }
            },
        });

        const [, drop] = useDrop({
            accept: 'DIV',
            hover(item, monitor) {
                const sourceDivIndex = item.index;
                const targetDivIndex = divIndex;

                // Don't replace items with themselves
                if (sourceDivIndex === targetDivIndex) {
                    return;
                }

                item.hoverIndex = targetDivIndex;
                item.index = targetDivIndex;
                moveColumnFrontend(sourceDivIndex, targetDivIndex);
            },
        });

        const opacity = isDragging ? 0.75 : 1;
        const display = 'flex';

        return (
            <div ref={(node) => drag(drop(node))} style={{ opacity, display }}>
                {children}
            </div>
        );
    };

    const [editingColumnIndex, setEditingColumnIndex] = useState(null);
    const [showDeleteConfirmation, setShowDeleteColumnConfirmation] = useState(false);
    const [columnToDeleteIndex, setColumnToDeleteIndex] = useState(null);
    const originalTitle = useRef(null);
    const editBoxRef = useRef(null);

    const [columnNewTitle, setColumnNewTitle] = useState('');

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
        const token = sessionStorage.getItem('token');

        try {
            await axios.post(
                `/columns/${board_id}/tasks/positions`,
                {
                    tasks: [{ task_id: task_to_modify_id, position: position, column_id: to_column_id }],
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

    const handleAddCard = async (divIndex) => {
        try {
            const newTask = {
                column_id: board.columns[divIndex].column_id,
                title: `New Task`,
                description: `Description of New Card in ${board.columns[divIndex].name}`,
            };

            const board_id = board.columns[divIndex].board_id;
            const token = sessionStorage.getItem('token');
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

    const handleDeleteCard = async (taskId, divIndex) => {
        try {
            const board_id = board.columns[divIndex].board_id;
            const token = sessionStorage.getItem('token');
            await axios.delete(`/boards/${board_id}/tasks/${taskId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const targetDiv = board.columns[divIndex];
            const updatedtasks = targetDiv.tasks.filter((task) => task.task_id !== taskId);

            const newBoardData = [...board.columns];
            newBoardData[divIndex] = { ...targetDiv, tasks: updatedtasks };

            setBoard({ ...board, columns: newBoardData });
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddColumn = async () => {
        try {
            const token = sessionStorage.getItem('token');
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
            const token = sessionStorage.getItem('token');
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
            if (columnNewTitle === '') {
                // Reset the title if the changes were cancelled
                try {
                    const token = sessionStorage.getItem('token');
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
                    const token = sessionStorage.getItem('token');
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

    const handleEditTask = (task_id, column_id, title, description) => {
        const newTaskData = [...board.columns];
        const columnIndex = newTaskData.findIndex((column) => column.column_id === column_id);
        const taskIndex = newTaskData[columnIndex].tasks.findIndex((task) => task.task_id === task_id);
        newTaskData[columnIndex].tasks[taskIndex].title = title;
        newTaskData[columnIndex].tasks[taskIndex].description = description;
        setBoard({ ...board, columns: newTaskData });
    };

    React.useEffect(() => {
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
        console.log('confirm');

        try {
            const token = sessionStorage.getItem('token');
            const res = axios.delete(`/boards/${board_id}/columns/${board.columns[columnToDeleteIndex].column_id}`, {
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

    const favouriteCard = (id, divIndex) => {
        try {
            const token = sessionStorage.getItem('token');
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
            const token = sessionStorage.getItem('token');
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
                        <Loader />
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
                                                    <span
                                                        className='delete-column-button'
                                                        onClick={(e) => handleDeleteButtonClick(e, index)}
                                                    >
                                                        {xMarkIcon}
                                                    </span>
                                                </>
                                            )}
                                            <div className='task-container'>
                                                {column.tasks.map((task, taskIndex) => (
                                                    <Card
                                                        key={task.task_id}
                                                        board_id={board_id}
                                                        column_id={column.column_id}
                                                        handleEditTask={handleEditTask}
                                                        id={task.task_id}
                                                        text={task.title}
                                                        description={task.description}
                                                        isFavourite={task.is_favourite === true}
                                                        index={taskIndex}
                                                        divName={`div${index + 1}`}
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
                                                        deleteCard={(taskId, divName) =>
                                                            handleDeleteCard(taskId, index)
                                                        }
                                                        favouriteCard={(taskId, divName) =>
                                                            task.is_favourite === false
                                                                ? favouriteCard(taskId, index)
                                                                : unFavouriteCard(taskId, index)
                                                        }
                                                        tags={task.tags}
                                                    />
                                                ))}
                                            </div>
                                            {column.is_finished === 0 ? (
                                                <div className='card addbtn' onClick={() => handleAddCard(index)}>
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
