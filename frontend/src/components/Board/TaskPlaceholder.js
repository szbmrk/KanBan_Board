import React, { forwardRef } from "react";
import { useDrop } from "react-dnd";
import "../../styles/TaskPlaceholder.css";
const ItemTypes = {
  CARD: "card",
};

export const TaskPlaceholder = forwardRef(
  ({ column, divName, moveCardFrontend, isFilterActive }, ref) => {
    const [, drop] = useDrop({
      accept: ItemTypes.CARD,
      hover: (item, monitor) => {
        if (!item || !divName) return;
        if (item.divName === divName) return;

        const dragIndex = item.index;
        const hoverIndex = 0;
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

    return (
      <>
        <div
          ref={!isFilterActive ? (node) => drop(node) : null}
          className="placeholder"
        >
          <div className="placeholder-title">&gt;&gt; Drop here &lt;&lt;</div>
        </div>
      </>
    );
  }
);
