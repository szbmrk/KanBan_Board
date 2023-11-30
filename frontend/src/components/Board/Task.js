import React, { useState, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";
import "../../styles/card.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPencil,
  faTrash,
  faStar as faSolidStar,
  faEllipsis,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as faRegularStar } from "@fortawesome/free-regular-svg-icons";
import Tag from "../Tag";
import { aiIcon, documentationIcon } from "./Board";

const ItemTypes = {
  CARD: "card",
};

export const plusIcon = <FontAwesomeIcon icon={faPlus} />;
export const pencilIcon = <FontAwesomeIcon icon={faPencil} />;
export const trashIcon = <FontAwesomeIcon icon={faTrash} />;
export const regularStarIcon = <FontAwesomeIcon icon={faRegularStar} />;
export const regularStarIconBouncing = (
  <FontAwesomeIcon icon={faRegularStar} bounce />
);
export const solidStarIcon = <FontAwesomeIcon icon={faSolidStar} />;
export const dotsIcon = <FontAwesomeIcon icon={faEllipsis} />;
export const attachmentLinkIcon = <FontAwesomeIcon icon={faLink} />;

export const Task = ({
  id,
  index,
  task,
  column,
  craftedPromptsTask,
  divName,
  favouriteTask,
  unFavouriteTask,
  deleteTask,
  openGenerateTaskWithAGIPopup,
  moveCardFrontend,
  moveCardBackend,
  setTaskAsInspectedTask,
  generateDocumentationForTask,
  generateTasks,
  generateAttachmentLinks,
  HandleCraftedPromptTaskClick,
  permissions
}) => {
  const [bouncingStarIcon, setBouncingStarIcon] = useState(regularStarIcon);
  const [isHoveredEdit, setIsHoveredEdit] = useState(false);
  const [isHoveredAI, setIsHoveredAI] = useState(-1);
  const [isHoveredDocumentation, setIsHoveredDocumentation] = useState(false);
  const [isHoveredAttachmentLink, setIsHoveredAttachmentLink] = useState(false);
  const [isHoveredFavorite, setIsHoveredFavorite] = useState(false);
  const [isHoveredDelete, setIsHoveredDelete] = useState(false);
  const [iconContainerPosition, setIconContainerPosition] = useState({
    x: 0,
    y: 0,
  });
  const [showIconContainer, setShowIconContainer] = useState(false);
  const [cardZIndex, setCardZIndex] = useState(1);
  const [cardIndex, setCardIndex] = useState(null);
  const [columnIndex, setColumnIndex] = useState(null);

  const [{ isDragging: dragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: { id, index, divName },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (item) {
        const dragIndex = index;
        const hoverIndex = item.index;
        const sourceDiv = item.divName;
        const targetDiv = divName;
        moveCardBackend(dragIndex, hoverIndex, sourceDiv, targetDiv);
      }
    },
  });

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
      moveCardFrontend(dragIndex, hoverIndex, sourceDiv, targetDiv);
      item.index = hoverIndex;
      item.divName = targetDiv;
    },
  });

  const opacity = dragging ? 0 : 1;

  const handleMouseEnterOnStarIcon = () => {
    setBouncingStarIcon(regularStarIconBouncing);
  };

  const handleMouseLeaveOnStarIcon = () => {
    setBouncingStarIcon(regularStarIcon);
  };

  const handleDotsClick = (event, cardIndex, columnIndex) => {
    const buttonRect = event.target.getBoundingClientRect();
    const newX = buttonRect.right + 20;
    const newY = buttonRect.top;

    // Set the icon-container's position and show it
    setIconContainerPosition({ x: newX, y: newY });
    setShowIconContainer(!showIconContainer);

    setColumnIndex(columnIndex);
    setCardIndex(cardIndex);

    cardZIndex === 1 ? setCardZIndex(100) : setCardZIndex(1);
  };

  const [activeTags, setActiveTags] = useState([]);

  const handleTagClick = (clickedTag) => {
    if (activeTags.includes(clickedTag)) {
      setActiveTags(activeTags.filter((tags) => tags !== clickedTag));
    } else {
      setActiveTags([...activeTags, clickedTag]);
    }
  };

  const [hoveredCardId, setHoveredCardId] = useState(null);

  const handleMouseEnterOnCard = (taskId) => {
    setHoveredCardId(taskId);
  };

  const handleMouseLeaveOnCard = () => {
    setHoveredCardId(null);
  };

  const handleDocumentation = () => {
    generateDocumentationForTask(task);
  };

  const handleAI = () => {
    generateTasks(task, column);
  };

  const handleAttachmentLinks = () => {
    generateAttachmentLinks(task);
  };

  const getCSSForCraftedPrompt = (craftedPrompt) => {
    switch (craftedPrompt.action) {
      case "GENERATEATTACHMENTLINK":
        return "var(--attachment-link)";
      default:
        return "var(--magic)";
    }
  };

  const getIconforCraftedPrompt = (craftedPrompt) => {
    switch (craftedPrompt.action) {
      case "GENERATEATTACHMENTLINK":
        return attachmentLinkIcon;
      default:
        return aiIcon;
    }
  };

  const [theme, setTheme] = useState(sessionStorage.getItem("darkMode"));
    useEffect(() => {
        //ez
        const ResetTheme = () => {
            setTheme(sessionStorage.getItem("darkMode"))
        }


        console.log("Darkmode: " + sessionStorage.getItem("darkMode"))
        window.addEventListener('ChangingTheme', ResetTheme)

        return () => {
            window.removeEventListener('ChangingTheme', ResetTheme)
        }
        //eddig
    }, []);

  return (
    <>
    {task===null ? 
    (
      <div>

      </div>
    ) :
      (<div
        ref={(node) => drag(drop(node))}
        className="card"
        data-theme={theme}
        style={{
          opacity,
          cursor: "grab",
          zIndex: cardIndex === index ? cardZIndex : () => setCardZIndex(1),
        }}
        onMouseEnter={() => handleMouseEnterOnCard(id)}
        onMouseLeave={handleMouseLeaveOnCard}
      >
        
        
        <div className="task-title">{task.title}</div>
        <div
          className="options"
          style={{ visibility: hoveredCardId === id ? "visible" : "hidden" }}
        >
          <span
            className="dots"
            onClick={(e) => handleDotsClick(e, index, column)}
            style={{
              visibility: hoveredCardId === id ? "visible" : "hidden",
              transition: "visibility 0.1s ease",
            }}
          >
            {dotsIcon}
          </span>
        </div>
        <div className="tags">
          {task.tags &&
            task.tags.map((tag, tagIndex) => (
              <Tag
                key={tagIndex}
                name={tag.name}
                color={tag.color}
                extraClassName={`tag-on-board ${
                  activeTags.includes(task.tags) ? "clicked" : ""
                }`}
                enableClickBehavior={true}
                onClick={() => handleTagClick(task.tags)}
              />
            ))}
        </div>
      
      </div>)}
      {showIconContainer && (
        <div
          className="overlay"
          onClick={() => {
            setShowIconContainer(false);
            setCardZIndex(1);
          }}
        >
          <div
            className="icon-container"
            style={{
              position: "fixed",
              left: iconContainerPosition.x + "px",
              top: iconContainerPosition.y + "px",
            }}
          >
            {permissions.filter(permission => {return permission.permission==='task_management'}).length===1 &&
            <div
              className="option"
              onMouseEnter={() => setIsHoveredEdit(true)}
              onMouseLeave={() => setIsHoveredEdit(false)}
              onClick={() => setTaskAsInspectedTask(task)}
            >
              <span
                className="edit-button"
                style={{
                  color: isHoveredEdit ? "var(--edit)" : "",
                  animation: isHoveredEdit ? "rotate 0.5s" : "none",
                }}
              >
                {pencilIcon}
              </span>
              <p>Edit Task</p>
            </div>
            }
            <div
              className="option"
              onMouseEnter={() => setIsHoveredDocumentation(true)}
              onMouseLeave={() => setIsHoveredDocumentation(false)}
              onClick={() => handleDocumentation()}
            >
              <span
                className="ai-button"
                style={{
                  color: isHoveredDocumentation ? "var(--magic)" : "",
                }}
              >
                {documentationIcon}
              </span>
              <p>Generate documentation for task</p>
            </div>
            <div
              className="option"
              onMouseEnter={() => setIsHoveredAI(0)}
              onMouseLeave={() => setIsHoveredAI(-1)}
              onClick={() => handleAI()}
            >
              <span
                className="ai-button"
                style={{
                  color: isHoveredAI === 0 ? "var(--magic)" : "",
                }}
              >
                {aiIcon}
              </span>
              <p>Generate Subtasks</p>
            </div>
            <div
              className="option"
              onMouseEnter={() => setIsHoveredAttachmentLink(true)}
              onMouseLeave={() => setIsHoveredAttachmentLink(false)}
              onClick={() => handleAttachmentLinks()}
            >
              <span
                className="ai-button"
                style={{
                  color: isHoveredAttachmentLink
                    ? "var(--attachment-link)"
                    : "",
                }}
              >
                {attachmentLinkIcon}
              </span>
              <p>Generate Attachment Links</p>
            </div>
            {craftedPromptsTask.map((craftedPrompt, index) => (
              <div
                key={index}
                className="option"
                onMouseEnter={() => setIsHoveredAI(index + 1)}
                onMouseLeave={() => setIsHoveredAI(-1)}
                onClick={() =>
                  HandleCraftedPromptTaskClick(craftedPrompt, task, column)
                }
              >
                <span
                  className="ai-button"
                  style={{
                    color:
                      isHoveredAI === index + 1
                        ? getCSSForCraftedPrompt(craftedPrompt)
                        : "",
                  }}
                >
                  {getIconforCraftedPrompt(craftedPrompt)}
                </span>
                <p>{craftedPrompt.crafted_prompt_title}</p>
              </div>
            ))}
            {task.is_favourite ? (
              <div
                className="option"
                onMouseEnter={() => setIsHoveredFavorite(true)}
                onMouseLeave={() => setIsHoveredFavorite(false)}
                onClick={() => unFavouriteTask(id, task.column_id)}
              >
                <span
                  className="favourite-button solid-icon"
                  style={{
                    color: isHoveredFavorite ? "var(--light-gray)" : "",
                  }}
                >
                  {isHoveredFavorite ? regularStarIcon : solidStarIcon}
                </span>
                <p>Remove from Favourites</p>
              </div>
            ) : (
              <div
                className="option"
                onMouseEnter={() => setIsHoveredFavorite(true)}
                onMouseLeave={() => setIsHoveredFavorite(false)}
                onClick={() => favouriteTask(id, task.column_id)}
              >
                <span
                  className="favourite-button regular-icon"
                  onMouseEnter={handleMouseEnterOnStarIcon}
                  onMouseLeave={handleMouseLeaveOnStarIcon}
                  style={{ color: isHoveredFavorite ? "var(--starred)" : "" }}
                >
                  {bouncingStarIcon}
                </span>
                <p
                  onMouseEnter={handleMouseEnterOnStarIcon}
                  onMouseLeave={handleMouseLeaveOnStarIcon}
                >
                  Add to Favourites
                </p>
              </div>
            )}
            {permissions.filter(permission => {return permission.permission==='task_management'}).length===1 && 
            <div 
              className="option"
              onMouseEnter={() => setIsHoveredDelete(true)}
              onMouseLeave={() => setIsHoveredDelete(false)}
              onClick={() => deleteTask(id, task.column_id)}
            >
              <span
                className="delete-task-button"
                style={{ color: isHoveredDelete ? "var(--important)" : "" }}
              >
                {trashIcon}
              </span>
              <p>Delete Task</p>
            </div>
            }
          </div>
        </div>
      )}
    </>
  );
};
