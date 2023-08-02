import React, { useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import Popup from "./Popup";
import ConfirmationPopup from "./ConfirmationPopup";
import "../styles/card.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPencil,
  faTrash,
  faStar as faSolidStar,
  faStar as faRegularStar
} from "@fortawesome/free-solid-svg-icons";

const ItemTypes = {
  CARD: "card",
};

export const plusIcon = <FontAwesomeIcon icon={faPlus} />;
export const pencilIcon = <FontAwesomeIcon icon={faPencil} />;
export const trashIcon = <FontAwesomeIcon icon={faTrash} />;
export const regularStarIcon = <FontAwesomeIcon icon={faRegularStar} />;
export const solidStarIcon = <FontAwesomeIcon icon={faSolidStar} />;

export const Card = ({
  id,
  text,
  isFavourite,
  index,
  divName,
  moveCard,
  deleteCard,
  favouriteCard,
}) => {
  const [{ isDragging: dragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: { id, index, divName },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [editedText, setEditedText] = useState(text);

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

  const handleSavePopup = (newText) => {
    // Update the text with the edited value
    setEditedText(newText);

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
        {editedText}
        <span className="edit" onClick={handleClick}>
          {pencilIcon}
        </span>
        <span className="delete-button" onClick={handleDelete}>
          {trashIcon}
        </span>
        <span className="favourite-button" onClick={handleFavourite}>
          {" "}
          {isFavourite ? solidStarIcon : regularStarIcon}
        </span>
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
          onClose={handleClosePopup}
          onSave={handleSavePopup}
        />
      )}
    </>
  );
};
