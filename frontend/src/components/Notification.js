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

    const checkIcon = <FontAwesomeIcon icon={faCheck} />;

    useEffect(() => {
        document.title = "KanBan | Notifications";
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

    const handleWebSocket = async (websocket) => {
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

    const notificationsRef = useRef([]);

    const webSocketCreateNotification = (data) => {
        const newNotificationData = notificationsRef.current;
        newNotificationData.push(data.notification);
        newNotificationData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setNotifications(newNotificationData);
        notificationsRef.current = newNotificationData;
        countUnseenAndSeenNotifications(newNotificationData);
    };

    const webSocketUpdateNotification = (data) => {
        const cloneOfNotifications = notificationsRef.current;
        const newNotificationData = cloneOfNotifications.map((currentNotification) =>
            currentNotification.notification_id === data.notification.notification_id
                ? data.notification
                : currentNotification
        );
        newNotificationData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setNotifications(newNotificationData);
        notificationsRef.current = newNotificationData;
        countUnseenAndSeenNotifications(newNotificationData);
    };

    const webSocketUpdateMultipleNotification = (data) => {
        const cloneOfNotifications = notificationsRef.current;
        const newNotificationData = cloneOfNotifications.map((currentNotification) => {
            const updatedNotification = data.notifications.find(
                (notif) => notif.notification_id === currentNotification.notification_id
            );
            return updatedNotification || currentNotification;
        });
        newNotificationData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setNotifications(newNotificationData);
        countUnseenAndSeenNotifications(newNotificationData);
    };

    const getNotifications = async () => {
        try {
            const res = await axios.get(`/users/${userId}/notifications`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const sortedNotifications = res.data.sort((a, b) =>
                new Date(b.created_at) - new Date(a.created_at)
            );
            setNotifications(sortedNotifications);
            notificationsRef.current = sortedNotifications;
            countUnseenAndSeenNotifications(sortedNotifications);
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
            const updatedNotifications = notifications.map((currentNotification) => ({
                ...currentNotification,
                is_read: 1,
            }));

            setNotifications(updatedNotifications);
            notificationsRef.current = updatedNotifications;
            countUnseenAndSeenNotifications(updatedNotifications);

            await axios.put(
                `/notifications/multiple`,
                { notifications: updatedNotifications },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (e) {
            setError(e);
        }
    };

    const markAsSeen = async (notification) => {
        try {
            const updatedNotifications = notifications.map((currentNotification) =>
                currentNotification.notification_id === notification.notification_id
                    ? { ...currentNotification, is_read: 1 }
                    : currentNotification
            );

            setNotifications(updatedNotifications);
            notificationsRef.current = updatedNotifications;
            countUnseenAndSeenNotifications(updatedNotifications);

            await axios.put(
                `/notifications/${notification.notification_id}`,
                { is_read: 1 },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (e) {
            setError(e);
        }
    };

    const toggleSwitch = () => {
        setIsRead(!isRead);
    };

    const countUnseenAndSeenNotifications = (notificationData) => {
        const data = notificationData || notificationsRef.current;
        setCountOfUnseen(
            data === null
                ? 0
                : data.filter((currentNotification) => currentNotification.is_read == 0).length
        );
        setCountOfseen(
            data === null
                ? 0
                : data.filter((currentNotification) => currentNotification.is_read == 1).length
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
        <div className="notifications-submenu">
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
                    <div className="notification-header">
                        <p className="notification-menu-title">Notifications</p>
                        <button className="notification-switch" onClick={toggleSwitch}>
                            {isRead ? "Switch to unseen" : "Switch to seen"}
                        </button>
                    </div>

                    <div className="notification-content">
                        {notifications.length === 0 ? (
                            <p>No notifications yet!</p>
                        ) : isRead === false ? (
                            <div className="notification-container">
                                <div className="container-header">
                                    <p>Unseen Notification History</p>
                                    {countOfUnseen > 0 && (
                                        <button className="mark-all-button" onClick={markAllAsSeen}>
                                            Mark all as seen
                                        </button>
                                    )}
                                </div>
                                {countOfUnseen > 0 ? (
                                    notifications.map(
                                        (notification) =>
                                            !notification.is_read && (
                                                <div
                                                    key={notification.notification_id}
                                                    className="notification-item"
                                                >
                                                    <div className="notification-details">
                                                        <p className="notification-type">
                                                            {notification.type}
                                                        </p>
                                                        <p className="notification-content">
                                                            {notification.content}
                                                        </p>
                                                    </div>
                                                    <div className="notification-meta">
                                                        <p className="created-at">
                                                            {new Date(
                                                                notification.created_at
                                                            ).toLocaleString(
                                                                "en-US",
                                                                dateFormatOptions
                                                            )}
                                                        </p>
                                                        <button
                                                            className="mark-seen-button"
                                                            onClick={() =>
                                                                markAsSeen(notification)
                                                            }
                                                        >
                                                            Mark as seen
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                    )
                                ) : (
                                    <p>No unseen notifications found!</p>
                                )}
                            </div>
                        ) : (
                            <div className="notification-container">
                                <div className="container-header">
                                    <p>Seen Notification History</p>
                                </div>
                                {countOfseen > 0 ? (
                                    notifications.map(
                                        (notification) =>
                                            notification.is_read && (
                                                <div
                                                    key={notification.notification_id}
                                                    className="notification-item"
                                                >
                                                    <div className="notification-details">
                                                        <p className="notification-type">
                                                            {notification.type}
                                                        </p>
                                                        <p className="notification-content">
                                                            {notification.content}
                                                        </p>
                                                    </div>
                                                    <div className="notification-meta">
                                                        <p className="created-at">
                                                            {new Date(
                                                                notification.created_at
                                                            ).toLocaleString(
                                                                "en-US",
                                                                dateFormatOptions
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                    )
                                ) : (
                                    <p>No seen notifications found!</p>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};