import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';

const TagDropdownItem = ({ data, onEdit, onDelete, onToggle, selectedTags }) => {
    const { label, color } = data;

    const checkIcon = <FontAwesomeIcon icon={faCheck} />;
    const trashIcon = <FontAwesomeIcon icon={faTrash} />;
    const pencilIcon = <FontAwesomeIcon icon={faPencil} />;

    const itemStyle = {
        color: 'var(--off-white)',
        backgroundColor: color,
        padding: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: '5px 0',
        borderRadius: '5px',
    };

    const buttonStyle = {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '10px',
    };

    const iconStyle = {
        color: 'var(--off-white)',
        cursor: 'pointer',
    };

    return (
        <div
            className='custom-menu-item'
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '5px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                ...itemStyle
            }}
            onClick={() => onToggle(data)}
        >
            <span style={{ marginRight: '8px', opacity: selectedTags.some((tag) => tag.value === label) ? 1 : 0 }}>
                {checkIcon}
            </span>
            <span
                style={{
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    backgroundColor: color,
                    color: 'var(--off-white)',
                    padding: '5px'
                }}
            >
                {label}
            </span>
            <div style={buttonStyle} >
                <span
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(data);
                    }}
                    style={iconStyle}
                >
                    {pencilIcon}
                </span>
                <span
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(data);
                    }}
                    style={iconStyle}
                >
                    {trashIcon}
                </span>
            </div>
        </div>
    );
};

export default TagDropdownItem;
