import React, { useState, useRef, useEffect } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import axios from '../api/axios';
import '../styles/popup.css';
import '../styles/GenerateTaskWithAGIPopup.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

const GenerateAttachmentLinkWithAGIPopup = ({ task, onCancel }) => {
    let [editedTask, setEditedTask] = useState(task);
    let [attachments, setAttachments] = useState([]);
    const popupRef = useRef(null);
    const aiOptions = [
        { value: 'chatgpt', label: 'ChatGPT' },
        { value: 'llama', label: 'Llama' },
    ];
    let [chosenAI, setChosenAI] = useState(aiOptions[0]);
    const counterOptions = [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
        { value: '5', label: '5' },
        { value: '6', label: '6' },
        { value: '7', label: '7' },
        { value: '8', label: '8' },
        { value: '9', label: '9' },
        { value: '10', label: '10' },
    ];
    let [taskCounter, setTaskCounter] = useState(counterOptions[0]);

    const closeIcon = <FontAwesomeIcon icon={faXmark} />;

    const saveToDatabase = async (task, attachments) => {
        try {
            const token = sessionStorage.getItem('token');

            console.log('attachments');
            console.log(attachments);

            const res = await axios.post(
                `/tasks/${task.task_id}/attachments/multiple`,
                {
                    attachments: attachments, // Pass the attachments array directly
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log(res);
        } catch (e) {
            console.error(e);
        }
    };

    const generateAttachment = async (task, ai, counter) => {
        try {
            const token = sessionStorage.getItem('token');

            console.log('task');
            console.log(task);
            console.log(counter);
            const res = await axios.get(`/AGI/GenerateAttachmentLink`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    TaskPrompt: `${task.title}`,
                    TaskCounter: `${counter}`,
                    ChosenAI: `${ai}`,
                },
            });

            console.log(res);
            console.log(res.data);

            setAttachments(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleDescriptionChange = (event, index) => {
        const updatedAttachments = [...attachments]; // Create a copy of the attachments array
        updatedAttachments[index] = {
            ...updatedAttachments[index], // Copy the attachment object
            description: event.target.value, // Update the description property
        };

        // Update the state with the modified attachments array
        setAttachments(updatedAttachments);
    };

    const handleLinkChange = (event, index) => {
        const updatedAttachments = [...attachments]; // Create a copy of the attachments array
        updatedAttachments[index] = {
            ...updatedAttachments[index], // Copy the attachment object
            link: event.target.value, // Update the description property
        };

        // Update the state with the modified attachments array
        setAttachments(updatedAttachments);
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
                        <p>Generate attachment links for: {editedTask.title}</p>
                        <div className='dropdown-container'>
                            <p>Select the number of attachment(s):</p>
                            <Dropdown
                                options={counterOptions}
                                value={taskCounter}
                                onChange={(selectedOption) => setTaskCounter(selectedOption)}
                            />
                        </div>
                        <div className='dropdown-container'>
                            <p>Select an AI:</p>
                            <Dropdown
                                options={aiOptions}
                                value={chosenAI}
                                onChange={(selectedOption) => setChosenAI(selectedOption)}
                            />
                        </div>
                        <button
                            className='generate-button'
                            onClick={() => generateAttachment(editedTask, chosenAI.value, taskCounter.value)}
                        >
                            Generate Attachment(s)
                        </button>
                    </div>
                    {attachments.length > 0 && (
                        <div className='gt-input-container'>
                            {attachments.map((attachment, index) => (
                                <div key={index} className='gt-attributes-container'>
                                    <div className='gt-attributes'>
                                        <p className='title'>Description:</p>
                                        <textarea
                                            type='text'
                                            value={attachment.description}
                                            onChange={(event) => handleDescriptionChange(event, index)}
                                        />
                                    </div>
                                    <div className='gt-attributes'>
                                        <p className='title'>Link:</p>
                                        <textarea
                                            type='text'
                                            value={attachment.link}
                                            onChange={(event) => handleLinkChange(event, index)}
                                        />
                                    </div>
                                </div>
                            ))}

                            <div>
                                <button className='save-button' onClick={() => saveToDatabase(editedTask, attachments)}>
                                    Save
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GenerateAttachmentLinkWithAGIPopup;
