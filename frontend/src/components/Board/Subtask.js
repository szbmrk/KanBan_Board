import React, { useState, useEffect } from 'react';
import Tag from '../Tag';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faTrash, faEllipsis, faStar as faSolidStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as faRegularStar } from '@fortawesome/free-regular-svg-icons';

const pencilIcon = <FontAwesomeIcon icon={faPencil} />;
const trashIcon = <FontAwesomeIcon icon={faTrash} />;
const regularStarIcon = <FontAwesomeIcon icon={faRegularStar} />;
const regularStarIconBouncing = <FontAwesomeIcon icon={faRegularStar} bounce />;
const solidStarIcon = <FontAwesomeIcon icon={faSolidStar} />;
const dotsIcon = <FontAwesomeIcon icon={faEllipsis} />;

export default function Subtask({
    subTask,
    index,
    favouriteSubtask,
    unFavouriteSubtask,
    deleteSubtask,
    setTaskAsInspectedTask,
}) {
    const [bouncingStarIcon, setBouncingStarIcon] = useState(regularStarIcon);
    const [hoveredSubtaskId, setHoveredSubtaskId] = useState(null);
    const [showIconContainer, setShowIconContainer] = useState(false);
    const [iconContainerPosition, setIconContainerPosition] = useState({ x: 0, y: 0 });
    const [subtaskIndex, setSubtaskIndex] = useState(null);
    const [subtaskZIndex, setSubtaskZIndex] = useState(0);
    const [isHoveredEdit, setIsHoveredEdit] = useState(false);
    const [isHoveredFavorite, setIsHoveredFavorite] = useState(false);
    const [isHoveredDelete, setIsHoveredDelete] = useState(false);

    const handleMouseEnterOnStarIcon = () => {
        setBouncingStarIcon(regularStarIconBouncing);
    };

    const handleMouseLeaveOnStarIcon = () => {
        setBouncingStarIcon(regularStarIcon);
    };

    const handleMouseEnterOnSubtask = (subtaskId) => {
        setHoveredSubtaskId(subtaskId);
    };

    const handleMouseLeaveOnSubtask = () => {
        setHoveredSubtaskId(null);
    };

    const handleDotsClick = (event, cardIndex) => {
        const buttonRect = event.target.getBoundingClientRect();
        const newX = buttonRect.right + 20;
        const newY = buttonRect.top;

        // Set the icon-container's position and show it
        setIconContainerPosition({ x: newX, y: newY });
        setShowIconContainer(!showIconContainer);

        setSubtaskIndex(cardIndex);

        subtaskZIndex === 1 ? setSubtaskZIndex(100) : setSubtaskZIndex(1);
    };
    const [theme, setTheme] = useState(localStorage.getItem("darkMode"));
    useEffect(() => {
        //ez
        const ResetTheme = () => {
            setTheme(localStorage.getItem("darkMode"))
        }


        console.log("Darkmode: " + localStorage.getItem("darkMode"))
        window.addEventListener('ChangingTheme', ResetTheme)

        return () => {
            window.removeEventListener('ChangingTheme', ResetTheme)
        }
        //eddig
    }, []);

    return (
        <>
            <div
                className='card subtask-card'
                data-theme={theme}
                onMouseEnter={() => handleMouseEnterOnSubtask(subTask.task_id)}
                onMouseLeave={handleMouseLeaveOnSubtask}
                style={{ zIndex: subtaskZIndex }}
            >
                <div className='task-title'>{subTask.title}</div>
                <div
                    className='subtask-options'
                    style={{ visibility: hoveredSubtaskId === subTask.task_id ? 'visible' : 'hidden' }}
                >
                    <span
                        className='dots'
                        onClick={(e) => handleDotsClick(e, index)}
                        style={{
                            visibility: hoveredSubtaskId === subTask.task_id ? 'visible' : 'hidden',
                            transition: 'visibility 0.1s ease',
                        }}
                    >
                        {dotsIcon}
                    </span>
                </div>
                <div className='tags-container'>
                    {subTask.tags &&
                        subTask.tags.map((tag, tagIndex) => (
                            <Tag key={tagIndex} name={tag.name} color={tag.color} extraClassName='tag-on-board' />
                        ))}
                </div>
            </div>
            {showIconContainer && (
                <div
                    className='overlay darken'
                    onClick={() => {
                        setShowIconContainer(false);
                        setSubtaskZIndex(1);
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
                            onClick={() => setTaskAsInspectedTask(subTask.task_id)}
                        >
                            <span
                                className='edit'
                                style={{
                                    color: isHoveredEdit ? 'var(--edit)' : '',
                                    animation: isHoveredEdit ? 'rotate 0.5s' : 'none',
                                }}
                            >
                                {pencilIcon}
                            </span>
                            <p>Edit Subtask</p>
                        </div>
                        {subTask.is_favourite ? (
                            <div
                                className='option'
                                onMouseEnter={() => setIsHoveredFavorite(true)}
                                onMouseLeave={() => setIsHoveredFavorite(false)}
                                onClick={unFavouriteSubtask}
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
                                onClick={favouriteSubtask}
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
                            onClick={deleteSubtask}
                        >
                            <span
                                className='trash-icon'
                                style={{ color: isHoveredDelete ? 'var(--important)' : '' }}
                            >
                                {trashIcon}
                            </span>
                            <p>Delete Subtask</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
