import React from 'react';
import '../styles/tag.css'; // Import the CSS for styling

const Tag = ({ name, color, extraClassName }) => {
    const tagStyle = {
        backgroundColor: color,
    };

    return (
        <div className={"tag " + extraClassName} style={tagStyle}>
            <p>{name}</p>
        </div>
    );
};

export default Tag;