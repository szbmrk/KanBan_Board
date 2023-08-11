import React, { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import '../../styles/card.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPencil, faTrash, faStar as faSolidStar, faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { faStar as faRegularStar } from '@fortawesome/free-regular-svg-icons';
import Tag from '../Tag';

const ItemTypes = {
    CARD: 'card',
};

export const plusIcon = <FontAwesomeIcon icon={faPlus} />;
export const pencilIcon = <FontAwesomeIcon icon={faPencil} />;
export const trashIcon = <FontAwesomeIcon icon={faTrash} />;
export const regularStarIcon = <FontAwesomeIcon icon={faRegularStar} />;
export const regularStarIconBouncing = <FontAwesomeIcon icon={faRegularStar} bounce />;
export const solidStarIcon = <FontAwesomeIcon icon={faSolidStar} />;
export const dotsIcon = <FontAwesomeIcon icon={faEllipsis} />;

export const Task = ({
    id,
    index,
    task,
    divName,
    favouriteTask,
    unFavouriteTask,
    deleteTask,
    moveCardFrontend,
    moveCardBackend,
    setTaskAsInspectedTask,
}) => {
    const [bouncingStarIcon, setBouncingStarIcon] = useState(regularStarIcon);
    const [isHovered, setIsHovered] = useState(false);

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

    const handleMouseEnterOnTaskTitle = () => {
        const taskTitle = document.getElementsByClassName('task-title')[index];
        if (taskTitle.textContent.length > 20) {
            setIsHovered(true);
        }
    };

    const handleMouseLeaveOnTaskTitle = () => {
        setIsHovered(false);
    };

    const [iconContainerPosition, setIconContainerPosition] = useState({ x: 0, y: 0 });
    const [showIconContainer, setShowIconContainer] = useState(false);
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (event) => {
        const { clientX, clientY } = event;
        setCursorPosition({ x: clientX, y: clientY });
        console.log('Cursor Position:', cursorPosition);
    };

    const handleDotsClick = (event) => {
        const buttonRect = event.target.getBoundingClientRect();
        const newX = buttonRect.right + 10 - window.scrollX;
        const newY = buttonRect.top - window.scrollY;

        // Set the icon-container's position and show it
        setIconContainerPosition({ x: newX, y: newY });
        setShowIconContainer(!showIconContainer);
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

    const handleMouseEnterOnCard = (boardId) => {
        setHoveredCardId(boardId);
    };

    const handleMouseLeaveOnCard = () => {
        setHoveredCardId(null);
    };

    return (
        <>
            <div
                ref={(node) => drag(drop(node))}
                className='card'
                style={{
                    opacity,
                    cursor: 'grab',
                }}
                onMouseEnter={() => handleMouseEnterOnCard(id)}
                onMouseLeave={handleMouseLeaveOnCard}
            >
                <div
                    className='task-title'
                    onMouseEnter={handleMouseEnterOnTaskTitle}
                    onMouseLeave={handleMouseLeaveOnTaskTitle}
                >
                    {task.title}
                </div>
                <div
                    className='options'
                    style={{ visibility: hoveredCardId === id ? 'visible' : 'hidden' }}
                    onMouseMove={handleMouseMove}
                >
                    <span
                        className='dots'
                        onClick={handleDotsClick}
                        style={{
                            visibility: hoveredCardId === id ? 'visible' : 'hidden',
                            transition: 'visibility 0.1s ease',
                        }}
                    >
                        {dotsIcon}
                    </span>
                </div>
                <div className='tags-container'>
                    {task.tags &&
                        task.tags.map((tag, tagIndex) => (
                            <Tag
                                key={tagIndex}
                                name={tag.name}
                                color={tag.color}
                                extraClassName={`tag-on-board ${activeTags.includes(task.tags) ? 'clicked' : ''}`}
                                enableClickBehavior={true}
                                onClick={() => handleTagClick(task.tags)}
                            />
                        ))}
                </div>
            </div>
            {showIconContainer && (
                <div className='overlay' onClick={() => setShowIconContainer(false)}>
                    <div
                        className='icon-container'
                        style={{
                            position: 'fixed',
                            left: iconContainerPosition.x + 'px',
                            top: iconContainerPosition.y + 'px',
                        }}
                    >
                        {task.is_favourite ? (
                            <div className='option'>
                                <span
                                    className='favourite-button solid-icon'
                                    onClick={() => unFavouriteTask(id, task.column_id)}
                                >
                                    {solidStarIcon}
                                </span>
                                <p onClick={() => unFavouriteTask(id, task.column_id)}>Remove from Favourites</p>
                            </div>
                        ) : (
                            <div className='option'>
                                <span
                                    className='favourite-button regular-icon'
                                    onClick={() => favouriteTask(id, task.column_id)}
                                    onMouseEnter={handleMouseEnterOnStarIcon}
                                    onMouseLeave={handleMouseLeaveOnStarIcon}
                                >
                                    {bouncingStarIcon}
                                </span>
                                <p onClick={() => favouriteTask(id, task.column_id)}>Add to Favourites</p>
                            </div>
                        )}
                        <div className='option'>
                            <span className='edit' onClick={() => setTaskAsInspectedTask(task)}>
                                {pencilIcon}
                            </span>
                            <p onClick={() => setTaskAsInspectedTask(task)}>Edit</p>
                        </div>
                        <div className='option'>
                            <span className='delete-button' onClick={() => deleteTask(id, task.column_id)}>
                                {trashIcon}
                            </span>
                            <p onClick={() => deleteTask(id, task.column_id)}>Delete</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
