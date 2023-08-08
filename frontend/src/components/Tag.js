import React from 'react';
import '../styles/tag.css'; // Import the CSS for styling

const Tag = ({ name, color }) => {
    const tagStyle = {
        backgroundColor: color,
    };

    return (
        <div className="tag" style={tagStyle}>
            {name}
        </div>
    );
};

export default Tag;