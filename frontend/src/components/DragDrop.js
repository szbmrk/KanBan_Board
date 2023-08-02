import React, { useState, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Card, plusIcon } from "./Card";
import { useDrop, useDrag } from "react-dnd";
import ConfirmationPopup from "./ConfirmationPopup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import "../styles/dragdrop.css";

const DragDrop = () => {
  const initialDivData = [
    {
      title: "Div 1",
      cards: [
        { id: 1, text: "Div 1 - Card 1", description: "Div 1 - Card 1 Description", isFavourite: false },
        { id: 2, text: "Div 1 - Card 2", description: "Div 1 - Card 2 Description", isFavourite: true },
        { id: 3, text: "Div 1 - Card 3", description: "Div 1 - Card 3 Description", isFavourite: false },
      ],
    },
    {
      title: "Div 2",
      cards: [
        { id: 4, text: "Div 2 - Card 1", description: "Div 2 - Card 1 Description", isFavourite: false },
        { id: 5, text: "Div 2 - Card 2", description: "Div 2 - Card 2 Description", isFavourite: false },
        { id: 6, text: "Div 2 - Card 3", description: "Div 2 - Card 3 Description", isFavourite: false },
      ],
    },
    {
      title: "Div 3",
      cards: [
        { id: 7, text: "Div 3 - Card 1", description: "Div 3 - Card 1 Description", isFavourite: false },
        { id: 8, text: "Div 3 - Card 2", description: "Div 3 - Card 2 Description", isFavourite: false },
        { id: 9, text: "Div 3 - Card 3", description: "Div 3 - Card 3 Description", isFavourite: false },
      ],
    },
  ];

  const checkIcon = <FontAwesomeIcon icon={faCheck} />;
  const xMarkIcon = <FontAwesomeIcon icon={faXmark} />;

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

  const [divData, setDivData] = useState(initialDivData);
  const [editingColumnIndex, setEditingColumnIndex] = useState(null);
  const [showDeleteConfirmation, setShowDeleteColumnConfirmation] =
    useState(false);
  const [columnToDeleteIndex, setColumnToDeleteIndex] = useState(null);
  const originalTitle = useRef(null);
  const editBoxRef = useRef(null);

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
      description: `Description of New Card in ${divData[divIndex].title}`,
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

  const moveColumn = (dragIndex, hoverIndex) => {
    setEditingColumnIndex(null);
    console.log("dragIndex");
    console.log(dragIndex);
    console.log("hoverIndex");
    console.log(hoverIndex);
    const draggedDiv = divData[dragIndex];

    const newDivData = [...divData];
    newDivData.splice(dragIndex, 1);
    newDivData.splice(hoverIndex, 0, draggedDiv);

    setDivData(newDivData);
  };

  const handleColumnTitleChange = (event, columnIndex) => {
    const newTitle = event.target.value;

    // Check if the new title length is within the allowed range (3 to 20 characters)
    if (newTitle.length <= 20) {
      const newColumnData = [...divData];
      newColumnData[columnIndex].title = newTitle;
      setDivData(newColumnData);
    } else if (newTitle.length > 20) {
      // Truncate the title to a maximum of 20 characters
      const truncatedTitle = newTitle.substring(0, 20);
      const newColumnData = [...divData];
      newColumnData[columnIndex].title = truncatedTitle;
      setDivData(newColumnData);
    }
    // You can choose to handle the case when the new title length is less than 3, if desired.
    // In this example, the title will not be updated if it's less than 3 characters.
  };

  const handleColumnTitleBlur = (columnIndex, isCancelled) => {
    setEditingColumnIndex(null);
    if (isCancelled) {
      // Reset the title if the changes were cancelled
      const newColumnData = [...divData];
      newColumnData[columnIndex].title = originalTitle.current;
      setDivData(newColumnData);
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click was outside the title edit input box
      if (editBoxRef.current && !editBoxRef.current.contains(event.target)) {
        handleColumnTitleBlur(editingColumnIndex);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [editingColumnIndex]);

  const handleColumnTitleDoubleClick = (columnIndex) => {
    originalTitle.current = divData[columnIndex].title;
    setEditingColumnIndex(columnIndex);
  };

  const handleDeleteButtonClick = (event, columnIndex) => {
    event.stopPropagation();
    setShowDeleteColumnConfirmation(true);
    setColumnToDeleteIndex(columnIndex);
  };

  const handleColumnDeleteConfirm = () => {
    console.log("confirm");
    // Create a copy of the divData array
    const newDivData = [...divData];
    // Remove the column with the given columnIndex
    newDivData.splice(columnToDeleteIndex, 1);
    // Update the state with the modified data
    setDivData(newDivData);
    // Close the delete confirmation popup
    setShowDeleteColumnConfirmation(false);
    setColumnToDeleteIndex(null);
  };

  const handleColumnDeleteCancel = () => {
    console.log("cancel");
    setShowDeleteColumnConfirmation(false);
    setColumnToDeleteIndex(null);
  };

  const favouriteCard = (id, divIndex) => {
    const updatedDivData = [...divData];
    const cardIndex = updatedDivData[divIndex].cards.findIndex(
      (card) => card.id === id
    );

    if (cardIndex !== -1) {
      updatedDivData[divIndex].cards[cardIndex].isFavourite =
        !updatedDivData[divIndex].cards[cardIndex].isFavourite;
    }

    setDivData(updatedDivData); // Update the state with the updated div data
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="content col-10 col-s-10">
        <h1>React Drag and Drop Page</h1>
        <div className="div-container">
          {divData.map((div, divIndex) => (
            <Column key={divIndex} divIndex={divIndex} moveColumn={moveColumn}>
              <div className="div">
                <div className="card-container">
                  {editingColumnIndex === divIndex ? (
                    <div className="name-edit">
                      <input
                        type="text"
                        value={div.title}
                        onChange={(event) =>
                          handleColumnTitleChange(event, divIndex)
                        }
                        autoFocus
                        ref={editBoxRef} // Set the ref to the title edit input box
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleColumnTitleBlur(divIndex);
                          } else if (e.key === "Escape") {
                            handleColumnTitleBlur(divIndex, true); // Pass `true` to indicate that changes are cancelled
                          }
                        }}
                      />
                      <span
                        className="edit-action-button"
                        id="check-button"
                        onClick={() => handleColumnTitleBlur(divIndex)}
                      >
                        {checkIcon}
                      </span>
                      <span
                        className="edit-action-button"
                        id="cancel-button"
                        onClick={() => handleColumnTitleBlur(divIndex, true)}
                      >
                        {xMarkIcon}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div
                        className="column-title-container"
                        onDoubleClick={() =>
                          handleColumnTitleDoubleClick(divIndex)
                        }
                      >
                        <h2 className="card-title">{div.title}</h2>
                      </div>
                      <span
                        className="delete-column-button"
                        onClick={(e) => handleDeleteButtonClick(e, divIndex)}
                      >
                        {xMarkIcon}
                      </span>
                    </>
                  )}
                  {div.cards.map((card, cardIndex) => (
                    <Card
                      key={card.id}
                      id={card.id}
                      text={card.text}
                      description={card.description}
                      isFavourite={card.isFavourite}
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
                      favouriteCard={(cardId, divName) =>
                        favouriteCard(cardId, divIndex)
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
      {showDeleteConfirmation && (
        <ConfirmationPopup
          text={divData[columnToDeleteIndex]?.title}
          onCancel={handleColumnDeleteCancel}
          onConfirm={handleColumnDeleteConfirm}
        />
      )}
    </DndProvider>
  );
};

export default DragDrop;
