import React, { useState } from 'react';

const IconContainer = ({ iconContainerPosition, options }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isHoveredIndex, setIsHoveredIndex] = useState(null);

    return (
        <div
            className='icon-container'
            style={{
                position: 'fixed',
                left: iconContainerPosition.x + 'px',
                top: iconContainerPosition.y + 'px',
            }}
        >
            {options.map((option, index) => (
                <div
                    className='option'
                    key={index}
                    onMouseEnter={() => [setIsHovered(true), setIsHoveredIndex(index)]}
                    onMouseLeave={() => [setIsHovered(false), setIsHoveredIndex(null)]}
                    onClick={() => option.onClick()}
                >
                    <span
                        className={option.iconClassName || ''}
                        style={{
                            color: (isHoveredIndex === index && isHovered && option.hoverColor) || '',
                            animation: (isHoveredIndex === index && isHovered && option.animation) || '',
                        }}
                    >
                        {(isHoveredIndex === index && isHovered ? option.hoveredIcon : option.icon) || ''}
                    </span>
                    <p>{option.label || ''}</p>
                </div>
            ))}
        </div>
    );
};

export default IconContainer;
