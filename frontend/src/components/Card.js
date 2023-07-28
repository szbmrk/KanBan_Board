import React, { useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import Popup from "./Popup";
import ConfirmationPopup from "./ConfirmationPopup";
import "../styles/general.css";
import "../styles/general.css";
import "../styles/card.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEllipsis } from "@fortawesome/free-solid-svg-icons";

const ItemTypes = {
  CARD: "card",
};

export const plusIcon = <FontAwesomeIcon icon={faPlus} />;
export const dotsIcon = <FontAwesomeIcon icon={faEllipsis} />;

export const Card = ({ id, text, index, divName, moveCard, deleteCard }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [{ isDragging: dragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: { id, index, divName },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.CARD,
    hover: (item, monitor) => {
      if (!item) return;
      if (item.id === id && item.divName === divName) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      const sourceDiv = item.divName;
      const targetDiv = divName;
      moveCard(dragIndex, hoverIndex, sourceDiv, targetDiv);
      item.index = hoverIndex;
      item.divName = targetDiv;
    },
  });

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showCustomPopup, setShowCustomPopup] = useState(false);

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
    deleteCard(id, divName); // Call the deleteCard method with the correct arguments
  };

  return (
    <>
      <div
        ref={(node) => drag(drop(node))}
        className="card"
        style={{
          opacity: isDragging ? 0.8 : 1,
          cursor: "grab",
        }}
      >
        {text}
        <span className="dots" onClick={handleClick}>
          {dotsIcon}
        </span>
        <button className="delete-button" onClick={handleDelete}>
          X
        </button>
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
