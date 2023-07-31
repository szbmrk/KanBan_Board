import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Card, plusIcon } from "./Card";
import { Column } from "./Column";
import "../styles/general.css";
import "../styles/dragdrop.css";

const DragDrop = () => {
  const initialColumnData = [
    {
      title: "Column 1",
      cards: [
        { id: 1, text: "Column 1 - Card 1" },
        { id: 2, text: "Column 1 - Card 2" },
        { id: 3, text: "Column 1 - Card 3" },
      ],
    },
    {
      title: "Column 2",
      cards: [
        { id: 4, text: "Column 2 - Card 1" },
        { id: 5, text: "Column 2 - Card 2" },
        { id: 6, text: "Column 2 - Card 3" },
      ],
    },
    {
      title: "Column 3",
      cards: [
        { id: 7, text: "Column 3 - Card 1" },
        { id: 8, text: "Column 3 - Card 2" },
        { id: 9, text: "Column 3 - Card 3" },
      ],
    },
  ];

  const [columnData, setColumnData] = React.useState(initialColumnData);

  const moveCard = (
    dragIndex,
    hoverIndex,
    sourceColumnIndex,
    targetColumnIndex
  ) => {
    const sourceColumn = columnData[sourceColumnIndex];
    const targetColumn = columnData[targetColumnIndex];
    const draggedCard = sourceColumn.cards[dragIndex];

    // Remove the card from the source column
    sourceColumn.cards.splice(dragIndex, 1);
    // Add the card to the target column at the hover index
    targetColumn.cards.splice(hoverIndex, 0, draggedCard);

    // Update the state for both source and target columns
    const newColumnData = [...columnData];
    newColumnData[sourceColumnIndex] = { ...sourceColumn };
    newColumnData[targetColumnIndex] = { ...targetColumn };

    setColumnData(newColumnData);
  };

  const handleAddCard = (columnIndex) => {
    const newCard = {
      id: Date.now(),
      text: `New Card in ${columnData[columnIndex].title}`,
    };

    const newColumnData = [...columnData];
    newColumnData[columnIndex].cards.push(newCard);
    setColumnData(newColumnData);
  };

  const handleDeleteCard = (cardId, columnIndex) => {
    const targetColumn = columnData[columnIndex];
    const updatedCards = targetColumn.cards.filter(
      (card) => card.id !== cardId
    );

    const newColumnData = [...columnData];
    newColumnData[columnIndex] = { ...targetColumn, cards: updatedCards };

    setColumnData(newColumnData);
  };

  const moveColumn = (dragIndex, hoverIndex) => {
    const draggedColumn = columnData[dragIndex];

    const newColumnData = [...columnData];
    newColumnData.splice(dragIndex, 1);
    newColumnData.splice(hoverIndex, 0, draggedColumn);

    setColumnData(newColumnData);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="Test">
        <h1>React Drag and Drop Page</h1>
        <div className="column-container">
          {columnData.map((column, columnIndex) => (
            <Column
              key={columnIndex}
              columnIndex={columnIndex}
              moveColumn={moveColumn}
            >
              <div className="column">
                <div className="card-container">
                  <h2 className="card-title">{column.title}</h2>
                  {column.cards.map((card, cardIndex) => (
                    <Card
                      key={card.id}
                      id={card.id}
                      text={card.text}
                      index={cardIndex}
                      columnName={`Column${columnIndex + 1}`}
                      moveCard={(
                        dragIndex,
                        hoverIndex,
                        sourceColumn,
                        targetColumn
                      ) =>
                        moveCard(
                          dragIndex,
                          hoverIndex,
                          parseInt(sourceColumn.substr(6)) - 1,
                          parseInt(targetColumn.substr(6)) - 1
                        )
                      }
                      deleteCard={(cardId, columnName) =>
                        handleDeleteCard(cardId, columnIndex)
                      }
                    />
                  ))}
                  <div
                    className="addbtn"
                    onClick={() => handleAddCard(columnIndex)}
                  >
                    {plusIcon} Add new task
                  </div>
                </div>
              </div>
            </Column>
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default DragDrop;
