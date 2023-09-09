import React from 'react';

const IconContainer = ({ iconContainerPosition, options }) => {
    return (
        <div
            className='icon-container'
            style={{
                position: 'fixed',
                left: iconContainerPosition.x + 'px',
                top: iconContainerPosition.y + 'px',
            }}
        >
            {options.map(
                (option, index) => (
                    console.log(option),
                    (
                        <div
                            className='option'
                            key={index}
                            onMouseEnter={() => option.onMouseEnter(index)}
                            onMouseLeave={() => option.onMouseLeave(index)}
                            onClick={() => option.onClick()}
                            style={option.style || {}}
                        >
                            <span
                                className={option.iconClassName || ''}
                                style={{
                                    color: option.isHovered ? option.hoverColor : '',
                                }}
                            >
                                {option.icon || ''}
                            </span>
                            <p>{option.label || ''}</p>
                        </div>
                    )
                )
            )}
        </div>
    );
};

export default IconContainer;
