import React, { useEffect } from 'react';

export default function Comment({ comment, taskId, getComment, addComment, deleteComment, updateComment }) {
    useEffect(() => {
        getComment(taskId);
    }, []);

    return <div>{comment}</div>;
}
