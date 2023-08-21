import React, { useState, useRef, useEffect } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import axios from '../api/axios';
import '../styles/popup.css';
import '../styles/GenerateTaskWithAGIPopup.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

const CraftPromptPopup = ({ board_id, onCancel }) => {
    const promptInputRef = useRef(null);
    const titleInputRef = useRef(null);
    const popupRef = useRef(null);
    const aiOptions = [
        { value: 'CHATGPT', label: 'ChatGPT' },
        { value: 'LLAMA', label: 'Llama' },
        { value: 'BARD', label: 'Bard' },
    ];
    let [chosenAI, setChosenAI] = useState(aiOptions[0]);
    const actionOptions = [
        { value: 'GENERATETASK', label: 'Generate Task' },
        { value: 'GENERATESUBTASK', label: 'Generate Subtask' },
        { value: 'GENERATEATTACHMENTLIST', label: 'Generate Attachment Link' },
    ];
    let [chosenAction, setChosenAction] = useState(actionOptions[0]);

    const closeIcon = <FontAwesomeIcon icon={faXmark} />;

    const SavePrompt = async (title, crafted_prompt_text, ai, action) => {
        try {
            const token = sessionStorage.getItem('token');

            console.log(board_id);
            console.log(crafted_prompt_text);
            console.log(ai);
            console.log(action);
            console.log(token);

            const res = await axios.post(
                `/boards/${board_id}/AGI/crafted-prompts`,
                {
                    crafted_prompt_title: `${title}`,
                    crafted_prompt_text: `${crafted_prompt_text}`,
                    craft_with: `${ai}`,
                    action: `${action}`,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log(res);
            console.log(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                onCancel();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onCancel]);

    return (
        <div className='overlay'>
            <div className='popup agi-popup'>
                <span className='close-btn' onClick={onCancel}>
                    {closeIcon}
                </span>
                <div className='gt-popup-content'>
                    <div className='gt-input-container'>
                        <div className='gt-input-title'>
                            <p>Give this prompt a title:</p>
                            <input type='text' placeholder='Enter the title of this prompt' ref={titleInputRef} />
                        </div>
                        <div className='gt-input-prompt'>
                            <p>Enter your own prompt:</p>
                            <input type='text' placeholder='Enter your own prompt' ref={promptInputRef} />
                        </div>
                        <div className='gt-action-buttons'>
                            <div className='dropdown-container'>
                                <p>Choose an action for the prompt:</p>
                                <Dropdown
                                    options={actionOptions}
                                    value={chosenAction}
                                    onChange={(selectedOption) => setChosenAction(selectedOption)}
                                />
                            </div>
                            <div className='dropdown-container'>
                                <p>Choose an AI you want to fulfill your prompt with:</p>
                                <Dropdown
                                    options={aiOptions}
                                    value={chosenAI}
                                    onChange={(selectedOption) => setChosenAI(selectedOption)}
                                />
                            </div>
                            <button
                                className='generate-button'
                                onClick={() =>
                                    SavePrompt(
                                        titleInputRef.current.value,
                                        promptInputRef.current.value,
                                        chosenAI.value,
                                        chosenAction.value
                                    )
                                }
                            >
                                Send prompt
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CraftPromptPopup;
