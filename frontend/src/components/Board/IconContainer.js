import React, { useState } from "react";

const calculateMenuPosition = (triggerElement, menuHeight) => {
    const windowHeight = window.innerHeight;
    const triggerRect = triggerElement.getBoundingClientRect();
    const availableSpaceDown = windowHeight - (triggerRect.bottom + window.scrollY);

    if (availableSpaceDown < menuHeight) {
        // Not enough space below, display upwards
        return { top: triggerRect.top + window.scrollY - menuHeight };
    } else {
        // Enough space below, display downwards (default behavior)
        return { top: triggerRect.bottom + window.scrollY };
    }
};
//board js-ből áthozni a triggerelementet!

const IconContainer = ({ iconContainerPosition, options }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isHoveredIndex, setIsHoveredIndex] = useState(null);

    return (
        <div
        
            className="icon-container"
            style={{
                position: "fixed",
                overflow: "hidden",
                left: iconContainerPosition.x + "px",
                top: calculateMenuPosition(iconContainerPosition.getBoundingClientRect,  window.innerHeight).top,
            }}
        >
            {options.map((option, index) => (
                <div
                    className="option"
                    key={index}
                    onMouseEnter={() => [setIsHovered(true), setIsHoveredIndex(index)]}
                    onMouseLeave={() => [setIsHovered(false), setIsHoveredIndex(null)]}
                    onClick={() => option.onClick()}
                >
                    <span
                        className={option.iconClassName || ""}
                        style={{
                            color:
                                (isHoveredIndex === index && isHovered && option.hoverColor) ||
                                "",
                            animation:
                                (isHoveredIndex === index && isHovered && option.animation) ||
                                "",
                        }}
                    >
                        {(isHoveredIndex === index && isHovered
                            ? option.hoveredIcon
                            : option.icon) || ""}
                    </span>
                    <p>{option.label || ""}</p>
                </div>
            ))}
        </div>
    );
};

export default IconContainer;
