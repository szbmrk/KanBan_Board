import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments } from '@fortawesome/free-solid-svg-icons';
import { faPaperPlane } from '@fortawesome/free-regular-svg-icons';
import { dateFormatOptions } from '../../utils/DateFormat';

const commentsIcon = <FontAwesomeIcon icon={faComments} />;
const sendMessageIcon = <FontAwesomeIcon icon={faPaperPlane} />;

export default function Comment({ comments, handlePostComment }) {
    const [addComment, setAddComment] = useState('');

    const handleAddComment = (e) => {
        setAddComment(e.target.value);
    };

    const postComment = async () => {
        handlePostComment(addComment);
        setAddComment('');
    };

    return (
        comments && comments.length > 0 ? <>
            <div className='subtitle'>
                <span className='icon'>{commentsIcon}</span>
                <h3>Comments:</h3>
            </div>
            <div className='comments-container'>
                <div class='previous-comments'>
                    {comments.map((comment, index) => (
                        <div
                            className={`comment ${sessionStorage.getItem("username") === comment.user.username ? 'own-comment' : 'other-comment'}`}
                            key={index}
                        >
                            <div class="comment-header">
                                <span className="username">{comment.user.username}</span>
                                <span className="date">{new Date(comment.created_at).toLocaleString("en-US", dateFormatOptions)}</span>
                            </div>
                            <div className="comment-text">
                                {comment.text}
                            </div>
                        </div>
                    ))}
                </div>
                <div className='add-comment'>
                    <div className='add-comment-content'>
                        <textarea
                            className='add-comment-textarea'
                            value={addComment}
                            onChange={handleAddComment}
                            placeholder='Write your comment here'
                        />
                        <button className='add-comment-button' onClick={postComment}>
                            {sendMessageIcon}
                        </button>
                    </div>
                </div>
            </div>
        </> : <>
            <div className='subtitle'>
                <span className='icon'>{commentsIcon}</span>
                <h3>Comments:</h3>
            </div>
            <div className='comments-container'>
                <div class='previous-comments'>
                    <h3>No comments yet!</h3>
                </div>
                <div className='add-comment'>
                    <div className='add-comment-content'>
                        <textarea
                            className='add-comment-textarea'
                            value={addComment}
                            onChange={handleAddComment}
                            placeholder='Write your comment here'
                        />
                        <button className='add-comment-button' onClick={postComment}>
                            {sendMessageIcon}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
