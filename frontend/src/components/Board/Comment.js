import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments } from '@fortawesome/free-solid-svg-icons';
import { faPaperPlane } from '@fortawesome/free-regular-svg-icons';
import { formatDate } from '../../utils/DateFormat';

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
    const [theme, setTheme] = useState(sessionStorage.getItem("darkMode"));
    useEffect(() => {
        //ez
        const ResetTheme = () => {
            setTheme(sessionStorage.getItem("darkMode"))
        }


        console.log("Darkmode: " + sessionStorage.getItem("darkMode"))
        window.addEventListener('ChangingTheme', ResetTheme)

        return () => {
            window.removeEventListener('ChangingTheme', ResetTheme)
        }
        //eddig
    }, []);

    return comments && comments.length > 0 ? (
        <>
            <div className='comments' data-theme={theme}>
                <div class='previous-comments'>
                    {comments.map((comment, index) => (
                        <div
                            className={`comment ${sessionStorage.getItem('username') === comment.user.username
                                ? 'own-comment'
                                : 'other-comment'
                                }`}
                            key={index}
                        >
                            <div class='comment-header'>
                                <span className='username'>{comment.user.username}</span>
                                <span className='date'>
                                    {formatDate(comment.created_at)}
                                </span>
                            </div>
                            <div className='comment-text'>{comment.text}</div>
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
        </>
    ) : (
        <>
            <div className='comments'>
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
    );
}
