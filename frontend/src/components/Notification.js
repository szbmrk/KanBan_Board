import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import '../styles/notification.css';
import Loader from './Loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

export default function Notification() {
    const [notifications, setNotifications] = useState([]);
    const [isRead, setIsRead] = useState(false);
    const token = sessionStorage.getItem('token');
    const userId = sessionStorage.getItem('user_id');

    const checkIcon = <FontAwesomeIcon icon={faCheck} />

    useEffect(() => {
        document.title = 'Notification';
        getNotifications();
    }, []);

    const getNotifications = async () => {
        const res = await axios.get(`/users/${userId}/notifications`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log(res.data);
        setNotifications(res.data);
    };

    const markAllAsSeen = async () => {
        notifications.forEach(async (notification) => {
            if (notification.is_read === 0) {
                try {
                    const res = await axios.put(`/notifications/${notification.notification_id}`,
                        {
                            is_read: 1
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        });
                }
                catch (err) {
                    console.log(err);
                }
            }
        });
        const newNotifications = notifications.map((item) => {
            return { ...item, is_read: 1 };
        }
        );
        setNotifications(newNotifications);
    };

    const markAsSeen = async (notification) => {
        try {
            const res = await axios.put(`/notifications/${notification.notification_id}`,
                {
                    is_read: 1
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            const newNotifications = notifications.map((item) => {
                if (item.notification_id === notification.notification_id) {
                    return { ...item, is_read: 1 };
                }
                return item;
            });
            setNotifications(newNotifications);
        }
        catch (err) {
            console.log(err);
        }
    };

    const toggleSwitch = () => {
        setIsRead(!isRead);
    };

    const countOfUnseen = notifications.filter((notification) => notification.is_read === 0).length;
    const countOfseen = notifications.filter((notification) => notification.is_read === 1).length;

    const dateFormatOptions = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    };

    return (
        <div className='content'>
            {notifications.length === 0 ? (
                <Loader />
            ) : <div className='container'>
                <h1 className='header'>Notifications</h1>
                <button className='switch' onClick={toggleSwitch}>{isRead ? 'Switch to unseen' : 'Switch to seen'}</button>
                {isRead === false ? <>
                    <div className="notification-container">
                        {countOfUnseen > 0 ?
                            <>
                                <button className="mark-all-button" onClick={markAllAsSeen}>{checkIcon} Mark All as Seen</button>
                                {notifications.map((notification) => (
                                    notification.is_read === 0 && <div
                                        key={notification.notification_id}
                                        className={`notification`}
                                    >
                                        <div className='notification-header'>
                                            <span className="created-at">{new Date(notification.created_at).toLocaleString("en-US", dateFormatOptions)}</span>
                                            <span className="notification-type">{notification.type}</span>
                                        </div>
                                        <p className="notification-content">{notification.content}</p>
                                        <button className="mark-seen-button" onClick={() => markAsSeen(notification)}>{checkIcon} Mark as Seen</button>
                                    </div>)
                                )}
                            </> : <h3 className='header'>No unseen notifications found!</h3>
                        }
                    </div>
                </> : <>
                    <div className="notification-container">
                        {countOfseen > 0 ? <>
                            {notifications.map((notification) => (
                                notification.is_read === 1 && <div
                                    key={notification.notification_id}
                                    className={`notification`}
                                >
                                    <div className='notification-header'>
                                        <span className="created-at">{new Date(notification.created_at).toLocaleString("en-US", dateFormatOptions)}</span>
                                        <span className="notification-type">{notification.type}</span>
                                    </div>
                                    <p className="notification-content">{notification.content}</p>
                                </div>)
                            )}
                        </> : <h3 className='header'>No seen notifications found!</h3>}
                    </div>
                </>}
            </div>}
        </div>
    );
}
