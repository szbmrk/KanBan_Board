import React, { useEffect, useState, useRef } from "react";
import axios from "../api/axios";
import "../styles/notification.css";
import Loader from "./Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import Error from "./Error";
import Echo from "laravel-echo";
import {
    REACT_APP_PUSHER_KEY,
    REACT_APP_PUSHER_CLUSTER,
    REACT_APP_PUSHER_PORT,
    REACT_APP_PUSHER_HOST,
    REACT_APP_PUSHER_PATH
} from "../api/config.js";

export default function Notification() {
    const [notifications, setNotifications] = useState(null);
    const [isRead, setIsRead] = useState(false);
    const [redirect, setRedirect] = useState(false);
    const [error, setError] = useState(false);
    const token = sessionStorage.getItem("token");
    const userId = sessionStorage.getItem("user_id");
    const [countOfUnseen, setCountOfUnseen] = useState(0);
    const [countOfseen, setCountOfseen] = useState(0);
    const notificationsRef = useRef(notifications);

    const checkIcon = <FontAwesomeIcon icon={faCheck} />;



    useEffect(() => {
        notificationsRef.current = notifications;
    }, [notifications]);

    const handleWebSocket = async (websocket) => {
        window.log("DATA");
        window.log(websocket.data);
        switch (websocket.changeType) {
            case "CREATED_NOTIFICATION":
                webSocketCreateNotification(websocket.data);
                break;
            case "UPDATED_NOTIFICATION":
                webSocketUpdateNotification(websocket.data);
                break;
            case "UPDATED_MULTIPLE_NOTIFICATION":
                webSocketUpdateMultipleNotification(websocket.data);
                break;
            default:
                break;
        }
    };

    const webSocketCreateNotification = (data) => {
        const newNotificationData = [...notificationsRef.current];
        newNotificationData.push(data.notification);
        setNotifications(newNotificationData);
        countUnseenAndSeenNotifications();
    };

    const webSocketUpdateNotification = (data) => {
        const newNotificationData = [...notificationsRef.current];
        newNotificationData.forEach((currentNotification, index) => {
            if (
                currentNotification.notification_id ===
                data.notification.notification_id
            ) {
                newNotificationData[index] = data.notification;
            }
        });
        setNotifications(newNotificationData);
        countUnseenAndSeenNotifications();
    };

    const webSocketUpdateMultipleNotification = (data) => {
        const newNotificationData = [...notificationsRef.current];
        data.notifications.forEach((currentUpdatedNotification) => {
            newNotificationData.forEach((currentNotification, index) => {
                if (
                    currentNotification.notification_id ===
                    currentUpdatedNotification.notification_id
                ) {
                    newNotificationData[index] = currentUpdatedNotification;
                }
            });
        });

        setNotifications(newNotificationData);
        countUnseenAndSeenNotifications();
    };

    useEffect(() => {
        document.title = "KanBan | Notification";
        getNotifications();

        window.Pusher = require("pusher-js");
        window.Pusher.logToConsole = true;

        const echo = new Echo({
            broadcaster: "pusher",
            key: REACT_APP_PUSHER_KEY,
            cluster: REACT_APP_PUSHER_CLUSTER,
            wsHost: REACT_APP_PUSHER_HOST || window.location.hostname,
            wsPort: REACT_APP_PUSHER_PORT || 6001,
            wssPort: 443,
            wsPath: REACT_APP_PUSHER_PATH || '',
            enableStats: false,
            forceTLS: false,
            enabledTransports: ["ws", "wss"],
        });

        const channel = echo.channel(`NotificationChange`);

        channel.listen(
            `.user.${userId}`,
            (e) => {
                handleWebSocket(e);
            },
            []
        );

    }, []);

    const getNotifications = async () => {
        try {
            const res = await axios.get(`/users/${userId}/notifications`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            window.log("notifications");
            window.log(res.data);
            setNotifications(res.data);
            countUnseenAndSeenNotifications();
        } catch (e) {
            window.log(e);
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else if (e?.response?.status === 404) {
                setError({ message: "No notifications found!" });
            } else {
                setError(e);
            }
        }
    };

    const markAllAsSeen = async () => {
        try {
            const notificationData = [...notificationsRef.current];
            let changedNotificationData = [];
            notificationData.forEach((currentNotification) => {
                if (currentNotification.is_read === 0) {
                    let clonedNotification = JSON.parse(
                        JSON.stringify(currentNotification)
                    );
                    clonedNotification.is_read = 1;
                    changedNotificationData.push(clonedNotification);
                }
            });

            const res = await axios.put(
                `/notifications/multiple`,
                {
                    notifications: changedNotificationData,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (e) {
            window.log(e);
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
            }
        }
    };

    const markAsSeen = async (notification) => {
        try {
            const res = await axios.put(
                `/notifications/${notification.notification_id}`,
                {
                    is_read: 1,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (e) {
            window.log(e);
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
            }
        }
    };

    const toggleSwitch = () => {
        setIsRead(!isRead);
    };

    const countUnseenAndSeenNotifications = async () => {
        setCountOfUnseen(
            notificationsRef.current === null
                ? 0
                : notificationsRef.current.filter(
                    (currentNotification) => currentNotification.is_read === 0
                ).length
        );
        setCountOfseen(
            notificationsRef.current === null
                ? 0
                : notificationsRef.current.filter(
                    (currentNotification) => currentNotification.is_read === 1
                ).length
        );
    };

    const dateFormatOptions = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    };

    return (
        <div className="content col-10" >
            {notifications === null ? (
                error ? (
                    <Error error={error} redirect={redirect} />
                ) : (
                    <Loader
                        data_to_load={notifications}
                        text_if_cant_load={"No notifications yet!"}
                    />
                )
            ) : (
                <>
                    <h1>Notifications</h1>
                    {notifications.length === 0 ? (
                        <p>No notifications yet!</p>
                    ) : (
                        <div>
                            <div className="switch-container">
                                <button className="switch" onClick={toggleSwitch}>
                                    {isRead ? "Switch to unseen" : "Switch to seen"}
                                </button>
                            </div>
                            {isRead === false ? (
                                <>
                                    <div className="notification-container">
                                        <div className="container-header">
                                            <p>Notification history</p>
                                            <button
                                                className="mark-all-button"
                                                onClick={markAllAsSeen}
                                                style={{
                                                    display: countOfUnseen > 0 ? "block" : "none",
                                                }}
                                            >
                                                {checkIcon} Mark all as seen
                                            </button>
                                        </div>
                                        {countOfUnseen > 0 ? (
                                            <>
                                                {notifications.map(
                                                    (notification) =>
                                                        notification.is_read === 0 && (
                                                            <div
                                                                key={notification.notification_id}
                                                                className={`notification`}
                                                            >
                                                                <div className="notification-header">
                                                                    <span className="created-at">
                                                                        {new Date(
                                                                            notification.created_at
                                                                        ).toLocaleString(
                                                                            "en-US",
                                                                            dateFormatOptions
                                                                        )}
                                                                    </span>
                                                                    <span className="notification-type">
                                                                        {notification.type}
                                                                    </span>
                                                                </div>
                                                                <p className="notification-content">
                                                                    {notification.content}
                                                                </p>
                                                                <button
                                                                    className="mark-seen-button"
                                                                    onClick={() => markAsSeen(notification)}
                                                                >
                                                                    {checkIcon} Mark as seen
                                                                </button>
                                                            </div>
                                                        )
                                                )}
                                            </>
                                        ) : (
                                            <p className="not-found-message">
                                                No unseen notifications found!
                                            </p>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="notification-container">
                                        <div className="container-header">
                                            <p>Notification history</p>
                                        </div>
                                        {countOfseen > 0 ? (
                                            <>
                                                {notifications.map(
                                                    (notification) =>
                                                        notification.is_read === 1 && (
                                                            <div
                                                                key={notification.notification_id}
                                                                className={`notification`}
                                                            >
                                                                <div className="notification-header">
                                                                    <span className="created-at">
                                                                        {new Date(
                                                                            notification.created_at
                                                                        ).toLocaleString(
                                                                            "en-US",
                                                                            dateFormatOptions
                                                                        )}
                                                                    </span>
                                                                    <span className="notification-type">
                                                                        {notification.type}
                                                                    </span>
                                                                </div>
                                                                <p className="notification-content">
                                                                    {notification.content}
                                                                </p>
                                                            </div>
                                                        )
                                                )}
                                            </>
                                        ) : (
                                            <p className="not-found-message">
                                                No seen notifications found!
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
