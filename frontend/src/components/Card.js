import React, { useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import Popup from "./Popup";
import "../styles/card.css";

const ItemTypes = {
  CARD: "card",
};

const Card = ({ id, text, index, divName, moveCard }) => {
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

  const [showPopup, setShowPopup] = useState(false);

  const handleClick = () => {
    if (!dragging) {
      setShowPopup(true);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <>
      <div
        ref={(node) => drag(drop(node))}
        onClick={handleClick}
        className="card"
        style={{
          opacity: isDragging ? 0.5 : 1,
          cursor: "move",
        }}
      >
        {text}
      </div>
      {showPopup && <Popup text={text} onClose={handleClosePopup} />}
    </>
  );
};

export default Card;