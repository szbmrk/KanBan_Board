import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {Card, plusIcon} from "./Card";
import "../styles/general.css";
import "../styles/dragdrop.css";

const DragDrop = () => {
  const [div1Cards, setDiv1Cards] = React.useState([
    { id: 1, text: "Div 1 - Card 1" },
    { id: 2, text: "Div 1 - Card 2" },
    { id: 3, text: "Div 1 - Card 3" },
  ]);

  const [div2Cards, setDiv2Cards] = React.useState([
    { id: 4, text: "Div 2 - Card 1" },
    { id: 5, text: "Div 2 - Card 2" },
    { id: 6, text: "Div 2 - Card 3" },
  ]);

  const [div3Cards, setDiv3Cards] = React.useState([
    { id: 7, text: "Div 3 - Card 1" },
    { id: 8, text: "Div 3 - Card 2" },
    { id: 9, text: "Div 3 - Card 3" },
  ]);

  const moveCard = (dragIndex, hoverIndex, sourceDiv, targetDiv) => {
    let draggedCard;
    let sourceCards;
    let targetCards;

    switch (sourceDiv) {
      case "div1":
        sourceCards = div1Cards;
        break;
      case "div2":
        sourceCards = div2Cards;
        break;
      case "div3":
        sourceCards = div3Cards;
        break;
      default:
        return;
    }

    switch (targetDiv) {
      case "div1":
        targetCards = div1Cards;
        break;
      case "div2":
        targetCards = div2Cards;
        break;
      case "div3":
        targetCards = div3Cards;
        break;
      default:
        return;
    }

    draggedCard = sourceCards[dragIndex];

    // Remove the card from the source div
    sourceCards.splice(dragIndex, 1);
    // Add the card to the target div at the hover index
    targetCards.splice(hoverIndex, 0, draggedCard);

    // Update the state for both source and target divs
    switch (sourceDiv) {
      case "div1":
        setDiv1Cards([...sourceCards]);
        break;
      case "div2":
        setDiv2Cards([...sourceCards]);
        break;
      case "div3":
        setDiv3Cards([...sourceCards]);
        break;
      default:
        break;
    }

    switch (targetDiv) {
      case "div1":
        setDiv1Cards([...targetCards]);
        break;
      case "div2":
        setDiv2Cards([...targetCards]);
        break;
      case "div3":
        setDiv3Cards([...targetCards]);
        break;
      default:
        break;
    }
  };

  const handleAddCard = (divName) => {
    const newCard = {
      id: Date.now(), // Create a unique ID (can use any other method to generate a unique ID)
      text: `New Card in ${divName}`, // Modify the text as per your requirement
    };

    switch (divName) {
      case "div1":
        setDiv1Cards((prevCards) => [...prevCards, newCard]);
        break;
      case "div2":
        setDiv2Cards((prevCards) => [...prevCards, newCard]);
        break;
      case "div3":
        setDiv3Cards((prevCards) => [...prevCards, newCard]);
        break;
      default:
        break;
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="Test">
        <h1>React Drag and Drop Page</h1>
        <div className="div-container">
          <div className="div">
            <h2>Div 1</h2>
            <div className="card-container">
              {div1Cards.map((card, index) => (
                <Card
                  key={card.id}
                  id={card.id}
                  text={card.text}
                  index={index}
                  divName="div1"
                  moveCard={(dragIndex, hoverIndex, sourceDiv, targetDiv) =>
                    moveCard(dragIndex, hoverIndex, sourceDiv, targetDiv)
                  }
                />
              ))}
              <div className="addbtn" onClick={() => handleAddCard("div3")}>{plusIcon} Add item</div>
            </div>
          </div>

          <div className="div">
            <h2>Div 2</h2>
            <div className="card-container">
              {div2Cards.map((card, index) => (
                <Card
                  key={card.id}
                  id={card.id}
                  text={card.text}
                  index={index}
                  divName="div2"
                  moveCard={(dragIndex, hoverIndex, sourceDiv, targetDiv) =>
                    moveCard(dragIndex, hoverIndex, sourceDiv, targetDiv)
                  }
                />
              ))}
              <div className="addbtn" onClick={() => handleAddCard("div3")}>{plusIcon} Add item</div>
            </div>
          </div>

          <div className="div">
            <h2>Div 3</h2>
            <div className="card-container">
              {div3Cards.map((card, index) => (
                <Card
                  key={card.id}
                  id={card.id}
                  text={card.text}
                  index={index}
                  divName="div3"
                  moveCard={(dragIndex, hoverIndex, sourceDiv, targetDiv) =>
                    moveCard(dragIndex, hoverIndex, sourceDiv, targetDiv)
                  }
                />
              ))}
              <div className="addbtn" onClick={() => handleAddCard("div3")}>{plusIcon} Add item</div>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default DragDrop;
