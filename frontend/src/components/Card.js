import React, { useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import Popup from "./Popup";
import ConfirmationPopup from "./ConfirmationPopup";
import "../styles/general.css";
import "../styles/card.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";

const ItemTypes = {
  CARD: "card",
};

export const plusIcon = <FontAwesomeIcon icon={faPlus} />;
export const pencilIcon = <FontAwesomeIcon icon={faPencil} />;
export const trashIcon = <FontAwesomeIcon icon={faTrash} />;

export const Card = ({ id, text, index, columnName, moveCard, deleteCard }) => {
  const [{ isDragging: dragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: { id, index, columnName },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.CARD,
    hover: (item, monitor) => {
      if (!item || !columnName) return;
      if (item.id === id && item.columnName === columnName) return;

      const dragIndex = item.index;
      const hoverIndex = index;
      const sourceColumn = item.columnName;
      const targetColumn = columnName;

      if (dragIndex === hoverIndex && sourceColumn === targetColumn) {
        return;
      }
      moveCard(dragIndex, hoverIndex, sourceColumn, targetColumn);
      item.index = hoverIndex;
      item.columnName = targetColumn;
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

  const handleDelete = () => {
    setShowCustomPopup(false); // Close the custom popup
    setShowDeletePopup(true); // Show the delete confirmation popup
  };

  const handleCancelDelete = () => {
    setShowDeletePopup(false); // Close the delete confirmation popup
  };

  const handleConfirmDelete = () => {
    setShowDeletePopup(false); // Close the delete confirmation popup
    deleteCard(id, columnName); // Call the deleteCard method with the correct arguments
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
        {text}
        <span className="edit" onClick={handleClick}>
          {pencilIcon}
        </span>
        <span className="delete-button" onClick={handleDelete}>
          {trashIcon}
        </span>
      </div>
      {showDeletePopup && (
        <ConfirmationPopup
          text={text}
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
        />
      )}
      {showCustomPopup && <Popup text={text} onClose={handleClosePopup} />}
    </>
  );
};
