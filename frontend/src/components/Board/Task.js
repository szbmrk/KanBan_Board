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
    faListCheck,
    faStopwatch,
    faTags,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as faRegularStar } from "@fortawesome/free-regular-svg-icons";
import Tag from "../Tag";
import { aiIcon, documentationIcon } from "./Board";
const ItemTypes = {
    CARD: "card",
};

export const tagsIcon = <FontAwesomeIcon icon={faTags} />;
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
const subtaskIcon = <FontAwesomeIcon icon={faListCheck} />;
const stopwatchIcon = <FontAwesomeIcon icon={faStopwatch} />;

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
            addTags,
            generateDocumentationForTask,
            generateTasks,
            generateAttachmentLinks,
            HandleCraftedPromptTaskClick,
            clickable,
            onChildData,
            iconContainer,
            zIndex,
            isFilterActive,
            handleTaskDoubleClick,
            handleDeleteAttribute
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

        const [profileImageUrl, setProfileImageUrl] = useState(
            "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
        );

        const [{ isDragging: dragging }, drag] = useDrag({
            type: ItemTypes.CARD,
            item: { id, index, divName },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
            end: (item, monitor) => {
                if (item && isFilterActive === false) {
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
                ref
            );
        }, [
            iconContainerPosition,
            showIconContainer,
            cardZIndex,
            taskPosition,
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
                }
            }
        };

        const handlePosition = (rect) => {
            setTaskPosition({
                x: rect.x + window.scrollX,
                y: rect.y + window.scrollY,
            });
        };

        const options = [
            {
                onClick: () => setTaskAsInspectedTask(task),
                animation: "rotate 0.5s",
                iconClassName: "edit-button",
                hoverColor: "var(--edit)",
                icon: pencilIcon,
                hoveredIcon: pencilIcon,
                label: "Edit task",
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
                onClick: () => addTags(task),
                animation: "rotate 0.5s",
                iconClassName: "ai-button",
                hoverColor: "var(--edit)",
                icon: tagsIcon,
                hoveredIcon: tagsIcon,
                label: "Add tags",

            },
            {
                onClick: () => handleAI(),
                iconClassName: "ai-button",
                hoverColor: "var(--magic)",
                icon: aiIcon,
                hoveredIcon: aiIcon,
                label: "Generate subtasks",
            },
            {
                onClick: () => handleAttachmentLinks(),
                iconClassName: "ai-button",
                hoverColor: "var(--attachment-link)",
                icon: attachmentLinkIcon,
                hoveredIcon: attachmentLinkIcon,
                label: "Generate attachment links",
            },
            ...craftedPromptsTask.map((craftedPromptsTaskItem, index) => ({
                onClick: () =>
                    HandleCraftedPromptTaskClick(craftedPromptsTaskItem, task, column),
                iconClassName: "ai-button",
                hoverColor: getCSSForCraftedPrompt(craftedPromptsTaskItem),
                icon: getIconforCraftedPrompt(craftedPromptsTaskItem),
                hoveredIcon: getIconforCraftedPrompt(craftedPromptsTaskItem),
                label: craftedPromptsTaskItem.crafted_prompt_title,
            }))
            ,
            task.is_favourite
                ? {
                    onClick: () => unFavouriteTask(id, task.column_id),
                    iconClassName: "favourite-button solid-icon",
                    hoverColor: "var(--light-gray)",
                    icon: solidStarIcon,
                    hoveredIcon: regularStarIcon,
                    label: "Remove from favourites",
                }
                : {
                    onClick: () => favouriteTask(id, task.column_id),
                    iconClassName: "favourite-button regular-icon",
                    hoverColor: "var(--starred)",
                    icon: regularStarIcon,
                    hoveredIcon: regularStarIconBouncing,
                    label: "Add to favourites",
                },
            {
                onClick: () => deleteTask(task),
                iconClassName: "delete-task-button",
                hoverColor: "var(--important)",
                icon: trashIcon,
                hoveredIcon: trashIcon,
                label: "Delete task",
            },
        ];

        // Example function to send data back to the parent
        const sendDataToParent = (
            iconContainerPosition,
            showIconContainer,
            cardZIndex,
            taskPosition,
            ref
        ) => {
            onChildData(
                options,
                iconContainerPosition,
                showIconContainer,
                cardZIndex,
                taskPosition,
                ref
            );
        };

        const CountSubtasksDone = () => {
            let count = 0;
            task.subtasks.forEach((subtask) => {
                if (subtask.completed) {
                    count++;
                }
            });
            return count;
        };

        return (
            <>
                <div
                    ref={!isFilterActive ? (node) => drag(drop(node)) : null}
                    className="card"
                    style={{
                        opacity,
                        cursor: isFilterActive ? "default" : "grab",
                        zIndex: cardIndex === index ? cardZIndex : 1,
                    }}
                    onMouseEnter={() => handleMouseEnterOnCard(id)}
                    onMouseLeave={handleMouseLeaveOnCard}
                    onDoubleClick={handleTaskDoubleClick}
                >
                    <div className="task-title">{task.title}</div>
                    <div className="options">
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
                        {task.is_favourite === true && (
                            <span style={{ color: "var(--starred)" }}>{solidStarIcon}</span>
                        )}
                    </div>
                    <div className="tags">
                        {task.tags &&
                            task.tags.map((tag, tagIndex) => (
                                <Tag
                                    key={tagIndex}
                                    name={tag.name}
                                    color={tag.color}
                                    extraClassName={`tag-on-board ${activeTags.includes(task.tags) ? "clicked" : ""
                                        }`}
                                    enableClickBehavior={true}
                                    onClick={() => handleTagClick(task.tags)}
                                />
                            ))}
                    </div>
                    {task && task.subtasks.length > 0 && (
                        <div className="subtasks-oncard">
                            <span className="icon">{subtaskIcon}</span>
                            <p>
                                {"(" +
                                    CountSubtasksDone() +
                                    "/" +
                                    task.subtasks.length +
                                    ")"}
                            </p>
                        </div>)}
                    {task && task.members.length > 0 && (
                        <div className="members-oncard">
                            {task.members.map((member, index) => (
                                <img
                                    key={index}
                                    //todo change to actual profile picture
                                    src={profileImageUrl}
                                    alt={member.username}
                                    title={member.username}
                                />
                            ))}
                        </div>
                    )}
                    {task && task.due_date && (
                        <div>
                            <span className="icon stopwatch-margin">{stopwatchIcon}</span>
                            <small>{task.due_date}</small>
                            <span 
                                className="icon trash-margin"
                                style={{
                                    visibility: hoveredCardId === id ? "visible" : "hidden",
                                    transition: "visibility 0.1s ease",
                                }}
                                onClick={() => {
                                    handleDeleteAttribute("due_date", id)
                                }}
                            > 
                                {trashIcon}
                            </span>
                        </div>
                    )}
                </div>
            </>
        );
    }
);
