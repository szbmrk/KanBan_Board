import React, { useState, useRef, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Card, plusIcon } from "./Card";
import { useDrop, useDrag } from "react-dnd";
import ConfirmationPopup from "./ConfirmationPopup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import "../styles/dragdrop.css";
import { useNavigate, useParams } from "react-router";
import axios from '../api/axios';
import Error from "./Error";

const DragDrop = () => {
    const { board_id } = useParams();
    const [permission, setPermission] = useState(false);
    const [error, setError] = useState(false);
    const [board, setBoard] = useState([]);

    useEffect(() => {
        fetchBoardData()
    }, []);

    const fetchBoardData = async () => {
        const token = sessionStorage.getItem('token');

        try {
            const response = await axios.get(`/boards/${board_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            setPermission(true);
            console.log(response.data.board);
            setBoard(response.data.board);
        }
        catch (e) {
            console.error(e)
            if (e.response.status === 403)
                setError("No permission");
            else
                setError("Board not found");
            setPermission(false);
        }
    }

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

    const [columnNewTitle, setColumnNewTitle] = useState("");

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

    const handleAddCard = (divIndex) => {
        const newCard = {
            id: Date.now(),
            title: `New Task`,
            description: `Description of New Card in ${board.columns[divIndex].title}`,
        };

        const newBoardData = [...board.columns];
        newBoardData[divIndex].tasks.push(newCard);
        setBoard({ ...board, columns: newBoardData });
    };

    const handleDeleteCard = (taskId, divIndex) => {
        const targetDiv = board.columns[divIndex];
        const updatedtasks = targetDiv.tasks.filter((task) => task.task_id !== taskId);

        const newBoardData = [...board.columns];
        newBoardData[divIndex] = { ...targetDiv, tasks: updatedtasks };

        setBoard({ ...board, columns: newBoardData });
    };

    const handleAddColumn = () => {
        const newColumn = {
            name: "New Column",
            tasks: [],
        };

        const newBoardData = [...board.columns, newColumn];
        setBoard({ ...board, columns: newBoardData });
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

    const handleColumnTitleBlur = (columnIndex, isCancelled) => {
        setEditingColumnIndex(null);
        if (isCancelled) {
            // Reset the title if the changes were cancelled
            const newColumnData = [...board.columns];
            newColumnData[columnIndex].name = originalTitle.current;
            setBoard({ ...board, columns: newColumnData });
        }
        else {
            // Update the title if the changes were saved
            if (columnNewTitle === "") {
                // Reset the title if the changes were cancelled
                const newColumnData = [...board.columns];
                newColumnData[columnIndex].name = originalTitle.current;
                setBoard({ ...board, columns: newColumnData });
            }
            else {
                const newColumnData = [...board.columns];
                newColumnData[columnIndex].name = columnNewTitle;
                setBoard({ ...board, columns: newColumnData });
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
        setColumnNewTitle(originalTitle.current)
        setEditingColumnIndex(columnIndex);
    };

    const handleDeleteButtonClick = (event, columnIndex) => {
        event.stopPropagation();
        setShowDeleteColumnConfirmation(true);
        setColumnToDeleteIndex(columnIndex);
    };

    const handleColumnDeleteConfirm = () => {
        console.log("confirm");
        // Create a copy of the board.columns array
        const newBoardData = [...board.columns];
        // Remove the column with the given columnIndex
        newBoardData.splice(columnToDeleteIndex, 1);
        // Update the state with the modified data
        setBoard({ ...board, columns: newBoardData });
        // Close the delete confirmation popup
        setShowDeleteColumnConfirmation(false);
        setColumnToDeleteIndex(null);
    };

    const handleColumnDeleteCancel = () => {
        console.log("cancel");
        setShowDeleteColumnConfirmation(false);
        setColumnToDeleteIndex(null);
    };

    const favouriteCard = (id, divIndex) => {
        const updatedBoard = [...board.columns];
        const cardIndex = updatedBoard[divIndex].tasks.findIndex(
            (card) => card.id === id
        );

        if (cardIndex !== -1) {
            updatedBoard[divIndex].tasks[cardIndex].isFavourite =
                !updatedBoard[divIndex].tasks[cardIndex].isFavourite;
        }

        setBoard({ ...board, columns: updatedBoard }); // Update the state with the updated div data
    };

    return (
        <>
            {permission === false ? <Error error={error}></Error> : <DndProvider backend={HTML5Backend}>
                {board === null ? (
                    <div className="loader"></div>
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
                                                key={task.task_id}
                                                id={task.task_id}
                                                text={task.title}
                                                description={task.description}
                                                isFavourite={false}
                                                index={taskIndex}
                                                divName={`div${index + 1}`}
                                                moveCard={(dragIndex, hoverIndex, sourceDiv, targetDiv) =>
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
                                                    favouriteCard(taskId, index)
                                                }
                                            />
                                        ))}
                                        <div
                                            className="addbtn"
                                            onClick={() => handleAddCard(index)}
                                        >
                                            {plusIcon} Add new task
                                        </div>
                                    </div>
                                </Column>
                            ))}
                            <div className="addbtn-column" onClick={handleAddColumn}>
                                {plusIcon} Add new column
                            </div>
                        </div>
                    </div>)}
                {showDeleteConfirmation && (
                    <ConfirmationPopup
                        text={board.columns[columnToDeleteIndex]?.title}
                        onCancel={handleColumnDeleteCancel}
                        onConfirm={handleColumnDeleteConfirm}
                    />
                )}
            </DndProvider>}
        </>
    );
};

export default DragDrop;
