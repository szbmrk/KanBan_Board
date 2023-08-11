import React, { useState } from 'react'
import Tag from '../Tag'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash, faStar as faSolidStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as faRegularStar } from "@fortawesome/free-regular-svg-icons";

const pencilIcon = <FontAwesomeIcon icon={faPencil} />;
const trashIcon = <FontAwesomeIcon icon={faTrash} />;
const regularStarIcon = <FontAwesomeIcon icon={faRegularStar} />;
const regularStarIconBouncing = <FontAwesomeIcon icon={faRegularStar} bounce />;
const solidStarIcon = <FontAwesomeIcon icon={faSolidStar} />;

export default function Subtask({ subTask, index, favouriteSubtask, unFavouriteSubtask, deleteSubtask, setTaskAsInspectedTask }) {
    const [bouncingStarIcon, setBouncingStarIcon] = useState(regularStarIcon);
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnterOnStarIcon = () => {
        setBouncingStarIcon(regularStarIconBouncing);
    };

    const handleMouseLeaveOnStarIcon = () => {
        setBouncingStarIcon(regularStarIcon);
    };

    const handleMouseEnterOnTaskTitle = () => {
        const taskTitle = document.getElementsByClassName("task-title")[index];
        if (taskTitle.textContent.length > 20) {
            setIsHovered(true);
        }
    };

    const handleMouseLeaveOnTaskTitle = () => {
        setIsHovered(false);
    };

    return (
        <div className="card subtask-card">
            <div className="subtask-title"
                onMouseEnter={handleMouseEnterOnTaskTitle}
                onMouseLeave={handleMouseLeaveOnTaskTitle}
            >
                {subTask.title}

            </div>
            <div className="tags-container">
                {subTask.tags && subTask.tags.map((tag, tagIndex) => (
                    <Tag key={tagIndex} name={tag.name} color={tag.color} extraClassName="tag-on-board" />
                ))}
            </div>
            <div className="icon-container">
                {subTask.is_favourite ?
                    <span className="favourite-button solid-icon"
                        onClick={unFavouriteSubtask}
                        style={{ display: isHovered ? "none" : "block" }}
                    >
                        {solidStarIcon}
                    </span> :
                    <span className="favourite-button regular-icon"
                        onClick={favouriteSubtask}
                        onMouseEnter={handleMouseEnterOnStarIcon}
                        onMouseLeave={handleMouseLeaveOnStarIcon}
                        style={{ display: isHovered ? "none" : "block" }}
                    >
                        {bouncingStarIcon}
                    </span>
                }
                <span className="edit"
                    onClick={() => setTaskAsInspectedTask(subTask)}
                    style={{ display: isHovered ? "none" : "block" }}
                >
                    {pencilIcon}
                </span>
                <span className="delete-button"
                    onClick={deleteSubtask}
                    style={{ display: isHovered ? "none" : "block" }}
                >
                    {trashIcon}
                </span>
            </div>
        </div>
    )
}
