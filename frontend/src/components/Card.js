import React, { useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import Popup from "./Popup";
import ConfirmationPopup from "./ConfirmationPopup";
import "../styles/card.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "../api/axios";
import {
    faPlus,
    faPencil,
    faTrash,
    faEllipsis,
    faStar as faSolidStar,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as faRegularStar } from "@fortawesome/free-regular-svg-icons";
import Tag from "./Tag";

const ItemTypes = {
    CARD: "card",
};

export const plusIcon = <FontAwesomeIcon icon={faPlus} />;
export const pencilIcon = <FontAwesomeIcon icon={faPencil} />;
export const trashIcon = <FontAwesomeIcon icon={faTrash} />;
export const regularStarIcon = <FontAwesomeIcon icon={faRegularStar} />;
export const regularStarIconBouncing = (
    <FontAwesomeIcon icon={faRegularStar} bounce />
);
export const solidStarIcon = <FontAwesomeIcon icon={faSolidStar} />;
export const dotsIcon = <FontAwesomeIcon icon={faEllipsis} />;

export const Card = ({
    id,
    text,
    description,
    isFavourite,
    index,
    divName,
    handleEditTask,
    moveCardFrontend,
    moveCardBackend,
    deleteCard,
    favouriteCard,
    board_id,
    column_id,
    tags,
}) => {
    const [{ isDragging: dragging }, drag] = useDrag({
        type: ItemTypes.CARD,
        item: { id, index, divName },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        end: (item, monitor) => {
            if (item) {
                const dragIndex = index;
                const hoverIndex = item.index;
                const sourceDiv = item.divName;
                const targetDiv = divName;
                moveCardBackend(dragIndex, hoverIndex, sourceDiv, targetDiv);
            }
        },
    });

    const [, drop] = useDrop({
        accept: ItemTypes.CARD,
        hover: (item, monitor) => {
            if (!item || !divName) return;
            if (item.id === id && item.divName === divName) return;

            const dragIndex = item.index;
            const hoverIndex = index;
            const sourceDiv = item.divName;
            const targetDiv = divName;

            if (dragIndex === hoverIndex && sourceDiv === targetDiv) {
                return;
            }
            moveCardFrontend(dragIndex, hoverIndex, sourceDiv, targetDiv);
            item.index = hoverIndex;
            item.divName = targetDiv;
        },
    });

    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [showCustomPopup, setShowCustomPopup] = useState(false);

    const opacity = dragging ? 0 : 1;

    const handleClick = () => {
        if (!dragging && !showDeletePopup) {
            setShowCustomPopup(true);
            setShowDeletePopup(false);
        }
    };

    const handleClosePopup = () => {
        setShowCustomPopup(false);
    };

    const handleSavePopup = async (newText, newDescription) => {
        // Update the text with the edited value

        try {
            const token = sessionStorage.getItem("token");
            await axios.put(
                `/boards/${board_id}/tasks/${id}`,
                { title: newText, description: newDescription },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            handleEditTask(id, column_id, newText, newDescription);
        } catch (err) {
            console.log(err);
        }

        // Close the popup
        setShowCustomPopup(false);
    };

    const handleDelete = () => {
        setShowCustomPopup(false); // Close the custom popup
        setShowDeletePopup(true); // Show the delete confirmation popup
    };

    const handleCancelDelete = () => {
        setShowDeletePopup(false); // Close the delete confirmation popup
    };

    const handleConfirmDelete = () => {
        setShowDeletePopup(false); // Close the delete confirmation popup
        deleteCard(id, divName); // Call the deleteCard method with the correct arguments
    };

    const handleFavourite = () => {
        favouriteCard(id, divName);
    };

    const [bouncingStarIcon, setBouncingStarIcon] = useState(regularStarIcon);

    const handleMouseEnterOnStarIcon = () => {
        setBouncingStarIcon(regularStarIconBouncing);
    };

    const handleMouseLeaveOnStarIcon = () => {
        setBouncingStarIcon(regularStarIcon);
    };

    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnterOnTaskTitle = () => {
        const taskTitle = document.getElementsByClassName("task-title")[index];
        if (taskTitle.textContent.length > 20) {
            setIsHovered(true);
        }
    };

    const handleMouseLeaveOnTaskTitle = () => {
        setIsHovered(false);
    };

    const [showIconContainer, setShowIconContainer] = useState(false);
    const [iconContainerPosition, setIconContainerPosition] = useState({
        x: 0,
        y: 0,
    });

    const handleDotsClick = (event) => {
        // Calculate the position of the icon-container relative to the clicked dots span
        const rect = event.target.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;

        // Set the icon-container's position and show it
        setIconContainerPosition({ x: offsetX, y: offsetY });
        setShowIconContainer(!showIconContainer);
    };

    const searchAllTags = (tags) => {
        let allTags = document.getElementsByClassName("tag-on-board");
        console.log(allTags);
    };

    return (
        <>
            <div
                ref={(node) => drag(drop(node))}
                className="card"
                style={{
                    opacity,
                    cursor: "grab",
                }}
            >
                <div
                    className="task-title"
                    onMouseEnter={handleMouseEnterOnTaskTitle}
                    onMouseLeave={handleMouseLeaveOnTaskTitle}
                >
                    {text}
                </div>
                <div className="options">
                    <span className="dots" onClick={handleDotsClick}>
                        {dotsIcon}
                    </span>
                </div>
                <div className="tags-container">
                    {tags &&
                        tags.map((tag, tagIndex) => (
                            <Tag
                                key={tagIndex}
                                name={tag.name}
                                color={tag.color}
                                extraClassName="tag-on-board"
                                enableClickBehavior={true}
                            />
                        ))}
                </div>
            </div>
            {showIconContainer && (
                <div
                    className="icon-container"
                    style={{
                        position: "absolute",
                        left: iconContainerPosition.x + 20 + "px",
                        top: iconContainerPosition.y + 20 + "px",
                        zIndex: 1000, // Make sure the popup is above other content
                    }}
                    onMouseLeave={() => setShowIconContainer(false)}
                >
                    {isFavourite ? (
                        <span
                            className="favourite-button solid-icon"
                            onClick={handleFavourite}
                        >
                            {solidStarIcon}
                        </span>
                    ) : (
                        <span
                            className="favourite-button regular-icon"
                            onClick={handleFavourite}
                            onMouseEnter={handleMouseEnterOnStarIcon}
                            onMouseLeave={handleMouseLeaveOnStarIcon}
                        >
                            {bouncingStarIcon}
                        </span>
                    )}
                    <span className="edit" onClick={handleClick}>
                        {pencilIcon}
                    </span>
                    <span className="delete-button" onClick={handleDelete}>
                        {trashIcon}
                    </span>
                </div>
            )}
            {showDeletePopup && (
                <ConfirmationPopup
                    text={text}
                    onCancel={handleCancelDelete}
                    onConfirm={handleConfirmDelete}
                />
            )}
            {showCustomPopup && (
                <Popup
                    text={text}
                    description={description}
                    onClose={handleClosePopup}
                    onSave={handleSavePopup}
                />
            )}
        </>
    );
};
