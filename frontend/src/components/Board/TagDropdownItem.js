import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faPencilAlt, faTrash } from '@fortawesome/free-solid-svg-icons';

const TagDropdownItem = ({ data, onEdit, onDelete, onToggle, selectedTags }) => {
    const { label, color } = data;

    const itemStyle = {
        color: 'white',
        backgroundColor: color,
        padding: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: '5px 0',
        borderRadius: '4px'
    };

    const buttonStyle = {
        display: 'flex',
        alignItems: 'center',
    }

    return (
        <div className="custom-menu-item" style={itemStyle} onClick={() => onToggle(data)}>
            <FontAwesomeIcon icon={faCheck} style={{ marginRight: '8px', opacity: selectedTags.some(tag => tag.value === label) ? 1 : 0 }} />
            <span style={{ backgroundColor: color, color: "white" }}>{label}</span>
            <div style={buttonStyle}>
                <FontAwesomeIcon
                    icon={faPencilAlt}
                    style={{ color: 'white', cursor: 'pointer', marginRight: '10px' }}
                    onClick={(e) => { e.stopPropagation(); onEdit(data); }}
                />
                <FontAwesomeIcon
                    icon={faTrash}
                    style={{ color: 'white', cursor: 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); onDelete(data); }}
                />
            </div>
        </div>
    );
};

export default TagDropdownItem;