import React, { useEffect, useState, useRef, forwardRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import "../../styles/card.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPencil,
  faTrash,
  faStar as faSolidStar,
  faEllipsis,
  faClipboard,
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
export const clipboardIcon = <FontAwesomeIcon icon={faClipboard} />;

export const Task = forwardRef(
  (
    {
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
      clickable,
      onChildData,
      iconContainer,
      zIndex,
    },
    ref
  ) => {
    const [iconContainerPosition, setIconContainerPosition] = useState({
      x: 0,
      y: 0,
    });
    const [taskPosition, setTaskPosition] = useState({
      x: 0,
      y: 0,
    });
    const [showIconContainer, setShowIconContainer] = useState(iconContainer);
    const [cardZIndex, setCardZIndex] = useState(zIndex);
    const [cardIndex, setCardIndex] = useState(null);
    const [taskToShow, setTaskToShow] = useState(null);
    const [bouncingStarIcon, setBouncingStarIcon] = useState(regularStarIcon);
    const [isHoveredEdit, setIsHoveredEdit] = useState(false);
    const [isHoveredAI, setIsHoveredAI] = useState(-1);
    const [isHoveredDocumentation, setIsHoveredDocumentation] = useState(false);
    const [isHoveredAttachmentLink, setIsHoveredAttachmentLink] =
      useState(false);
    const [isHoveredFavorite, setIsHoveredFavorite] = useState(false);
    const [isHoveredDelete, setIsHoveredDelete] = useState(false);

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

    const handleDotsClick = (event, cardIndex) => {
      const buttonRect = event.target.getBoundingClientRect();
      const newX = buttonRect.right + 20;
      const newY = buttonRect.top;

      // Set the icon-container's position and show it
      setIconContainerPosition({ x: newX, y: newY });
      setShowIconContainer(true);

      setCardIndex(cardIndex);

      setCardZIndex(100);

      getTaskPosition(cardIndex);
    };

    useEffect(() => {
      sendDataToParent(
        iconContainerPosition,
        showIconContainer,
        cardZIndex,
        taskPosition,
        taskToShow,
        ref
      );
    }, [
      iconContainerPosition,
      showIconContainer,
      cardZIndex,
      taskPosition,
      taskToShow,
      ref,
    ]);

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
      clickable && setHoveredCardId(taskId);
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

    const getTaskPosition = (index) => {
      const tasks = document.getElementsByClassName("card");
      for (let i = 0; i < tasks.length; i++) {
        if (i === index) {
          handlePosition(tasks[i].getBoundingClientRect());
          setTaskToShow(tasks[i]);
        }
      }
    };

    const handlePosition = (rect) => {
      setTaskPosition({
        x: rect.x + window.scrollX,
        y: rect.y + window.scrollY,
      });
    };

    // Example function to send data back to the parent
    const sendDataToParent = (
      iconContainerPosition,
      isIconContainerShowable
    ) => {
      onChildData(
        options,
        iconContainerPosition,
        isIconContainerShowable,
        cardZIndex,
        taskPosition,
        taskToShow,
        ref
      );
    };

    const options = [
      {
        onClick: () => setTaskAsInspectedTask(task),
        animation: "rotate 0.5s",
        iconClassName: "edit-button",
        hoverColor: "var(--edit)",
        icon: pencilIcon,
        hoveredIcon: pencilIcon,
        label: "Edit Task",
      },
      {
        onClick: () => handleDocumentation(),
        animation: "rotate 0.5s",
        iconClassName: "ai-button",
        hoverColor: "var(--edit)",
        icon: documentationIcon,
        hoveredIcon: documentationIcon,
        label: "Generate documentation for task",
      },
      {
        onClick: () => handleAI(),
        iconClassName: "ai-button",
        hoverColor: "var(--magic)",
        icon: aiIcon,
        hoveredIcon: aiIcon,
        label: "Generate Subtasks",
      },
      {
        onClick: () => handleAttachmentLinks(),
        iconClassName: "ai-button",
        hoverColor: "var(--attachment-link)",
        icon: attachmentLinkIcon,
        hoveredIcon: attachmentLinkIcon,
        label: "Generate Attachment Links",
      },
      ...craftedPromptsTask.map((craftedPromptsTaskItem, index) => ({
        onClick: () =>
          HandleCraftedPromptTaskClick(craftedPromptsTaskItem, task, column),
        iconClassName: "ai-button",
        hoverColor: getCSSForCraftedPrompt(craftedPromptsTaskItem),
        icon: getIconforCraftedPrompt(craftedPromptsTaskItem),
        hoveredIcon: getIconforCraftedPrompt(craftedPromptsTaskItem),
        label: craftedPromptsTaskItem.crafted_prompt_title,
      })),
      task.is_favourite
        ? {
            onClick: () => unFavouriteTask(id, task.column_id),
            iconClassName: "favourite-button solid-icon",
            hoverColor: "var(--light-gray)",
            icon: solidStarIcon,
            hoveredIcon: regularStarIcon,
            label: "Remove from Favourites",
          }
        : {
            onClick: () => favouriteTask(id, task.column_id),
            iconClassName: "favourite-button regular-icon",
            hoverColor: "var(--starred)",
            icon: regularStarIcon,
            hoveredIcon: regularStarIconBouncing,
            label: "Add to Favourites",
          },
      {
        onClick: () => deleteTask(id, task.column_id),
        iconClassName: "delete-task-button",
        hoverColor: "var(--important)",
        icon: trashIcon,
        hoveredIcon: trashIcon,
        label: "Delete Task",
      },
    ];

    return (
      <>
        <div
          ref={(node) => drag(drop(node))}
          className="card"
          style={{
            opacity,
            cursor: "grab",
            zIndex: cardIndex === index ? cardZIndex : 1,
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
              onClick={(e) => handleDotsClick(e, index)}
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
        </div>
        {/*{showIconContainer && (
                <div
                    className='overlay'
                    onClick={() => {
                        setShowIconContainer(false);
                        setCardZIndex(1);
                    }}
                >
                    <div
                        className='icon-container'
                        style={{
                            position: 'fixed',
                            left: iconContainerPosition.x + 'px',
                            top: iconContainerPosition.y + 'px',
                        }}
                    >
                        <div
                            className='option'
                            onMouseEnter={() => setIsHoveredEdit(true)}
                            onMouseLeave={() => setIsHoveredEdit(false)}
                            onClick={() => setTaskAsInspectedTask(task)}
                        >
                            <span
                                className='edit-button'
                                style={{
                                    color: isHoveredEdit ? 'var(--edit)' : '',
                                    animation: isHoveredEdit ? 'rotate 0.5s' : 'none',
                                }}
                            >
                                {pencilIcon}
                            </span>
                            <p>Edit Task</p>
                        </div>
                        <div
                            className='option'
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
                                className='ai-button'
                                style={{
                                    color: isHoveredAI === 0 ? 'var(--magic)' : '',
                                }}
                            >
                                {aiIcon}
                            </span>
                            <p>Generate Subtasks</p>
                        </div>
                        <div
                            className='option'
                            onMouseEnter={() => setIsHoveredAttachmentLink(true)}
                            onMouseLeave={() => setIsHoveredAttachmentLink(false)}
                            onClick={() => handleAttachmentLinks()}
                        >
                            <span
                                className='ai-button'
                                style={{
                                    color: isHoveredAttachmentLink ? 'var(--attachment-link)' : '',
                                }}
                            >
                                {attachmentLinkIcon}2
                            </span>
                            <p>Generate Attachment Links</p>
                        </div>
                        {craftedPromptsTask.map((craftedPrompt, index) => (
                            <div
                                key={index}
                                className='option'
                                onMouseEnter={() => setIsHoveredAI(index + 1)}
                                onMouseLeave={() => setIsHoveredAI(-1)}
                                onClick={() => HandleCraftedPromptTaskClick(craftedPrompt, task, column)}
                            >
                                <span
                                    className='ai-button'
                                    style={{
                                        color: isHoveredAI === index + 1 ? getCSSForCraftedPrompt(craftedPrompt) : '',
                                    }}
                                >
                                    {getIconforCraftedPrompt(craftedPrompt)}
                                </span>
                                <p>{craftedPrompt.crafted_prompt_title}</p>
                            </div>
                        ))}
                        {task.is_favourite ? (
                            <div
                                className='option'
                                onMouseEnter={() => setIsHoveredFavorite(true)}
                                onMouseLeave={() => setIsHoveredFavorite(false)}
                                onClick={() => unFavouriteTask(id, task.column_id)}
                            >
                                <span
                                    className='favourite-button solid-icon'
                                    style={{
                                        color: isHoveredFavorite ? 'var(--light-gray)' : '',
                                    }}
                                >
                                    {isHoveredFavorite ? regularStarIcon : solidStarIcon}
                                </span>
                                <p>Remove from Favourites</p>
                            </div>
                        ) : (
                            <div
                                className='option'
                                onMouseEnter={() => setIsHoveredFavorite(true)}
                                onMouseLeave={() => setIsHoveredFavorite(false)}
                                onClick={() => favouriteTask(id, task.column_id)}
                            >
                                <span
                                    className='favourite-button regular-icon'
                                    onMouseEnter={handleMouseEnterOnStarIcon}
                                    onMouseLeave={handleMouseLeaveOnStarIcon}
                                    style={{ color: isHoveredFavorite ? 'var(--starred)' : '' }}
                                >
                                    {bouncingStarIcon}
                                </span>
                                <p onMouseEnter={handleMouseEnterOnStarIcon} onMouseLeave={handleMouseLeaveOnStarIcon}>
                                    Add to Favourites
                                </p>
                            </div>
                        )}
                        <div
                            className='option'
                            onMouseEnter={() => setIsHoveredDelete(true)}
                            onMouseLeave={() => setIsHoveredDelete(false)}
                            onClick={() => deleteTask(id, task.column_id)}
                        >
                            <span
                                className='delete-task-button'
                                style={{ color: isHoveredDelete ? 'var(--important)' : '' }}
                            >
                                {trashIcon}
                            </span>
                            <p>Delete Task</p>
                        </div>
                </div>
                      </div>
            )}*/}
      </>
    );
  }
);
