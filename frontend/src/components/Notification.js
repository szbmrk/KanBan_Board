import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import "../styles/notification.css";
import Loader from "./Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import Error from "./Error";

export default function Notification() {
    const [notifications, setNotifications] = useState(null);
    const [isRead, setIsRead] = useState(false);
    const [redirect, setRedirect] = useState(false);
    const [error, setError] = useState(false);
    const token = sessionStorage.getItem("token");
    const userId = sessionStorage.getItem("user_id");

    const checkIcon = <FontAwesomeIcon icon={faCheck} />;

    const [theme, setTheme] = useState(localStorage.getItem("darkMode"));


    useEffect(() => {
        document.title = 'Notification';
        getNotifications();
        //ez
        const ResetTheme = () => {
            setTheme(localStorage.getItem("darkMode"))
        }


        console.log("Darkmode: " + localStorage.getItem("darkMode"))
        window.addEventListener('ChangingTheme', ResetTheme)

        return () => {
            window.removeEventListener('ChangingTheme', ResetTheme)
        }
        //eddig
    }, []);

    const getNotifications = async () => {
        try {
            const res = await axios.get(`/users/${userId}/notifications`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(res.data);
            setNotifications(res.data);
        } catch (e) {
            console.log(e);
            if (e.response.status === 401 || e.response.status === 500) {
                setError("You are not logged in! Redirecting to login page...");
                setRedirect(true);
            } else if (e.response.status === 404) {
                setError("No notifications found!");
            } else {
                setError(e.message);
            }
        }
    };

    const markAllAsSeen = async () => {
        notifications.forEach(async (notification) => {
            if (notification.is_read === 0) {
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
                    console.log(e);
                    if (e.response.status === 401 || e.response.status === 500) {
                        setError("You are not logged in! Redirecting to login page...");
                        setRedirect(true);
                    } else {
                        setError(e.message);
                    }
                }
            }
        });
        const newNotifications = notifications.map((item) => {
            return { ...item, is_read: 1 };
        });
        setNotifications(newNotifications);
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
            const newNotifications = notifications.map((item) => {
                if (item.notification_id === notification.notification_id) {
                    return { ...item, is_read: 1 };
                }
                return item;
            });
            setNotifications(newNotifications);
        } catch (e) {
            console.log(e);
            if (e.response.status === 401 || e.response.status === 500) {
                setError("You are not logged in! Redirecting to login page...");
                setRedirect(true);
            } else {
                setError(e.message);
            }
        }
    };

    const toggleSwitch = () => {
        setIsRead(!isRead);
    };

    const countOfUnseen =
        notifications === null
            ? 0
            : notifications.filter((notification) => notification.is_read === 0)
                .length;
    const countOfseen =
        notifications === null
            ? 0
            : notifications.filter((notification) => notification.is_read === 1)
                .length;

    const dateFormatOptions = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    };

    return (
        <div className="content col-10" data-theme={theme}>
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
