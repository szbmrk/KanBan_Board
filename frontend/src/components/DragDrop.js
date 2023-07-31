import React from "react";
import { DndProvider, useDrop, useDrag } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Card, plusIcon } from "./Card";
import "../styles/general.css";
import "../styles/dragdrop.css";

const DragDrop = () => {
  const initialDivData = [
    {
      title: "Div 1",
      cards: [
        { id: 1, text: "Div 1 - Card 1" },
        { id: 2, text: "Div 1 - Card 2" },
        { id: 3, text: "Div 1 - Card 3" },
      ],
    },
    {
      title: "Div 2",
      cards: [
        { id: 4, text: "Div 2 - Card 1" },
        { id: 5, text: "Div 2 - Card 2" },
        { id: 6, text: "Div 2 - Card 3" },
      ],
    },
    {
      title: "Div 3",
      cards: [
        { id: 7, text: "Div 3 - Card 1" },
        { id: 8, text: "Div 3 - Card 2" },
        { id: 9, text: "Div 3 - Card 3" },
      ],
    },
  ];

  const [divData, setDivData] = React.useState(initialDivData);

  const moveCard = (dragIndex, hoverIndex, sourceDivIndex, targetDivIndex) => {
    const sourceDiv = divData[sourceDivIndex];
    const targetDiv = divData[targetDivIndex];
    const draggedCard = sourceDiv.cards[dragIndex];

    // Remove the card from the source div
    sourceDiv.cards.splice(dragIndex, 1);
    // Add the card to the target div at the hover index
    targetDiv.cards.splice(hoverIndex, 0, draggedCard);

    // Update the state for both source and target divs
    const newDivData = [...divData];
    newDivData[sourceDivIndex] = { ...sourceDiv };
    newDivData[targetDivIndex] = { ...targetDiv };

    setDivData(newDivData);
  };

  const handleAddCard = (divIndex) => {
    const newCard = {
      id: Date.now(),
      text: `New Card in ${divData[divIndex].title}`,
    };

    const newDivData = [...divData];
    newDivData[divIndex].cards.push(newCard);
    setDivData(newDivData);
  };

  const handleDeleteCard = (cardId, divIndex) => {
    const targetDiv = divData[divIndex];
    const updatedCards = targetDiv.cards.filter((card) => card.id !== cardId);

    const newDivData = [...divData];
    newDivData[divIndex] = { ...targetDiv, cards: updatedCards };

    setDivData(newDivData);
  };

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

    return (
      <div ref={(node) => drag(drop(node))} style={{ opacity }}>
        {children}
      </div>
    );
  };

  const moveColumn = (dragIndex, hoverIndex) => {
    const draggedDiv = divData[dragIndex];

    const newDivData = [...divData];
    newDivData.splice(dragIndex, 1);
    newDivData.splice(hoverIndex, 0, draggedDiv);

    setDivData(newDivData);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="Test">
        <h1>React Drag and Drop Page</h1>
        <div className="div-container">
          {divData.map((div, divIndex) => (
            <Column key={divIndex} divIndex={divIndex} moveColumn={moveColumn}>
              <div className="div">
                <div className="card-container">
                  <h2 className="card-title">{div.title}</h2>
                  {div.cards.map((card, cardIndex) => (
                    <Card
                      key={card.id}
                      id={card.id}
                      text={card.text}
                      index={cardIndex}
                      divName={`div${divIndex + 1}`}
                      moveCard={(dragIndex, hoverIndex, sourceDiv, targetDiv) =>
                        moveCard(
                          dragIndex,
                          hoverIndex,
                          parseInt(sourceDiv.substr(3)) - 1,
                          parseInt(targetDiv.substr(3)) - 1
                        )
                      }
                      deleteCard={(cardId, divName) =>
                        handleDeleteCard(cardId, divIndex)
                      }
                    />
                  ))}
                  <div
                    className="addbtn"
                    onClick={() => handleAddCard(divIndex)}
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
