import React from "react";
import { useDrop, useDrag } from "react-dnd";

export const Column = ({ columnIndex, moveColumn, children }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "COLUMN",
    item: { index: columnIndex },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "COLUMN",
    hover(item, monitor) {
      const sourceColumnIndex = item.index;
      const targetColumnIndex = columnIndex;

      if (sourceColumnIndex === targetColumnIndex) {
        return;
      }

      moveColumn(sourceColumnIndex, targetColumnIndex);
      item.index = targetColumnIndex;
    },
  });

  const opacity = isDragging ? 0.5 : 1;

  return (
    <div ref={(node) => drag(drop(node))} style={{ opacity }}>
      {children}
    </div>
  );
};
