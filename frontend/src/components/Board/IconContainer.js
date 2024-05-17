import React, { useState, useEffect, useRef } from "react";

const IconContainer = ({ iconContainerPosition, options }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isHoveredIndex, setIsHoveredIndex] = useState(null);
    const [adjustedPosition, setAdjustedPosition] = useState(iconContainerPosition);
    const containerRef = useRef(null);

    const handlePosition = () => {
        const viewportHeight = window.innerHeight;
        const bottomThreshold = viewportHeight / 2;

        if (containerRef.current) {
            const containerHeight = containerRef.current.offsetHeight;

            if (iconContainerPosition.y > bottomThreshold) {
                setAdjustedPosition({
                    x: iconContainerPosition.x,
                    y: iconContainerPosition.y - containerHeight + 20,
                });
            } else {
                setAdjustedPosition(iconContainerPosition);
            }
        }
    };

    useEffect(() => {
        handlePosition();
    }, [iconContainerPosition]);

    return (
        <div

            className="icon-container"
            ref={containerRef}
            style={{
                position: "fixed",
                overflow: "hidden",
                left: adjustedPosition.x + "px",
                top: adjustedPosition.y + "px",
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
