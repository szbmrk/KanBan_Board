import React, { useState, useCallback } from "react";
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
    faStar as faSolidStar,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as faRegularStar } from "@fortawesome/free-regular-svg-icons";

const ItemTypes = {
    CARD: "card",
};

export const plusIcon = <FontAwesomeIcon icon={faPlus} />;
export const pencilIcon = <FontAwesomeIcon icon={faPencil} />;
export const trashIcon = <FontAwesomeIcon icon={faTrash} />;
export const regularStarIcon = <FontAwesomeIcon icon={faRegularStar} />;
export const regularStarIconBouncing = <FontAwesomeIcon icon={faRegularStar} bounce />;
export const solidStarIcon = <FontAwesomeIcon icon={faSolidStar} />;

export const Card = ({
    id,
    text,
    description,
    isFavourite,
    index,
    divName,
    moveCard,
    deleteCard,
    favouriteCard,
    board_id
}) => {
    const [{ isDragging: dragging }, drag] = useDrag({
        type: ItemTypes.CARD,
        item: { id, index, divName },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [editedText, setEditedText] = useState(text);
    const [editedDescription, setEditedDescription] = useState(description);

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
            moveCard(dragIndex, hoverIndex, sourceDiv, targetDiv);
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
            const response = await axios.put(`/boards/${board_id}/tasks/${id}`, { title: newText, description: newDescription },
                {
                    headers: { Authorization: `Bearer ${token}` }

                });
            setEditedText(newText);
            setEditedDescription(newDescription);
        }
        catch (err) {
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
    const [isOverflown, setIsOverflown] = useState(false);

    const handleMouseEnterOnTaskTitle = () => {
        const taskTitle = document.getElementsByClassName("task-title")[index];
        if (taskTitle.textContent.length > 20) {
            setIsOverflown(true);
            setIsHovered(true);
        }
    };

    const handleMouseLeaveOnTaskTitle = () => {
        setIsOverflown(false);
        setIsHovered(false);
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
                <div className="task-title"
                    onMouseEnter={handleMouseEnterOnTaskTitle}
                    onMouseLeave={handleMouseLeaveOnTaskTitle}
                >
                    {editedText}
                </div>
                <div className="icon-container">
                    {isFavourite ?
                        <span className="favourite-button solid-icon"
                            onClick={handleFavourite}
                            style={{ display: isHovered ? "none" : "block" }}
                        >
                            {solidStarIcon}
                        </span> :
                        <span className="favourite-button regular-icon"
                            onClick={handleFavourite}
                            onMouseEnter={handleMouseEnterOnStarIcon}
                            onMouseLeave={handleMouseLeaveOnStarIcon}
                            style={{ display: isHovered ? "none" : "block" }}
                        >
                            {bouncingStarIcon}
                        </span>
                    }
                    <span className="edit"
                        onClick={handleClick}
                        style={{ display: isHovered ? "none" : "block" }}
                    >
                        {pencilIcon}
                    </span>
                    <span className="delete-button"
                        onClick={handleDelete}
                        style={{ display: isHovered ? "none" : "block" }}
                    >
                        {trashIcon}
                    </span>
                </div>
            </div>
            {showDeletePopup && (
                <ConfirmationPopup
                    text={text}
                    onCancel={handleCancelDelete}
                    onConfirm={handleConfirmDelete}
                />
            )}
            {showCustomPopup && (
                <Popup
                    text={editedText}
                    description={editedDescription}
                    onClose={handleClosePopup}
                    onSave={handleSavePopup}
                />
            )}
        </>
    );
};
