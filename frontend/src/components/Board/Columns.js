import { useState, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';

export const Column = ({
    divIndex,
    moveColumnFrontend,
    moveColumnBackend,
    children,
    onMouseEnter,
    onMouseLeave,
    index,
    zIndex,
}) => {
    const [originalPos, setOriginalPos] = useState(null);

    const [{ isDragging }, drag] = useDrag({
        type: 'DIV',
        item() {
            setOriginalPos(divIndex);
            return { index: divIndex };
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        end: (item, monitor) => {
            if (originalPos !== undefined && item.hoverIndex !== undefined) {
                if (originalPos === item.hoverIndex) return;
                moveColumnBackend(originalPos, item.hoverIndex);
            }
        },
    });

    const [, drop] = useDrop({
        accept: 'DIV',
        hover(item, monitor) {
            const sourceDivIndex = item.index;
            const targetDivIndex = divIndex;

            // Don't replace items with themselves
            if (sourceDivIndex === targetDivIndex) {
                return;
            }

            item.hoverIndex = targetDivIndex;
            item.index = targetDivIndex;
            moveColumnFrontend(sourceDivIndex, targetDivIndex);
        },
    });

    const opacity = isDragging ? 0.75 : 1;
    const display = 'flex';

    return (
        <div
            className='column'
            ref={(node) => drag(drop(node))}
            style={{ opacity, display, zIndex: index === divIndex ? zIndex : 1 }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {children}
        </div>
    );
};
