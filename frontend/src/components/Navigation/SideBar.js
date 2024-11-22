// Sidebar component that using among the application
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClapperboard, faStar, faTable, faSignOutAlt, faListCheck, faPeopleGroup, faHome, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../auth/AuthContext';
import axios from "../../api/axios";
import Echo from "laravel-echo";
import {
    REACT_APP_PUSHER_KEY,
    REACT_APP_PUSHER_CLUSTER,
    REACT_APP_PUSHER_PORT,
    REACT_APP_PUSHER_HOST,
    REACT_APP_PUSHER_PATH
} from "../../api/config.js";

const BoardsIcon = <FontAwesomeIcon icon={faClapperboard} />
const FavouriteIcon = <FontAwesomeIcon icon={faStar} />
const OpenIcon = <FontAwesomeIcon icon={faChevronDown} />
const CloseIcon = <FontAwesomeIcon icon={faChevronUp} />
const tableIcon = <FontAwesomeIcon icon={faTable} />;
const AssignedTasksIcon = <FontAwesomeIcon icon={faListCheck} />;
const PeopleGroup = <FontAwesomeIcon icon={faPeopleGroup} />;
const HomeIcon = <FontAwesomeIcon icon={faHome} />;
const Sidebar = () => {
    const location = useLocation();
    const isBoardActive = location.pathname.includes('/board');

    const [showFavouriteBoards, setShowFavouriteBoards] = useState(false);
    const [favouriteBoards, setFavouriteBoards] = useState([]);

    const userId = sessionStorage.getItem("user_id");
    const token = sessionStorage.getItem("token");

    async function fetchFavouriteBoards() {
        try {
            const resp = await axios.get(`/favourite/boards/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            setFavouriteBoards(resp.data.favourites);
        } catch (err) {
        }
    }

    useEffect(() => {
        fetchFavouriteBoards();
    })

    function handleWebSocket(websocket) {
        let newFavouriteBoards;
        switch (websocket.changeType) {
            case "ADD_FAVOURITE_BOARD":
                newFavouriteBoards = [...favouriteBoards];
                newFavouriteBoards.push(websocket.data);
                setFavouriteBoards(newFavouriteBoards);
                break;
            case "REMOVE_FAVOURITE_BOARD":
                newFavouriteBoards = favouriteBoards.filter((board) => {
                    return board != websocket.data;
                });
                setFavouriteBoards(newFavouriteBoards);
                break;
        }
    }

    useEffect(() => {
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

        const channel = echo.channel(`FavouriteBoardsChange`);

        channel.listen(
            `.favouriteBoards.${userId}`,
            (e) => {
                handleWebSocket(e);
            },
            []
        );

        return () => {
            channel.unsubscribe();
        };
    }, []);

    return (
        <div className='sidebar col-2 sidebar-visible'>
            <div className='sidebar-menu'>
                <ul>
                    <li className={location.pathname === '/dashboard' ? 'active' : ''}>
                        <Link to='/dashboard'>
                            {HomeIcon}
                            <span>Dashboard</span>
                        </Link>
                    </li>

                    <li className={location.pathname === '/boards' || isBoardActive ? 'active' : ''}>
                        <Link to='/boards'>
                            {BoardsIcon}
                            <span>Boards</span>
                        </Link>
                    </li>

                    <li className={location.pathname === '/favourite_boards' ? 'active' : ''}>
                        <Link to='/favourite_boards'>
                            {FavouriteIcon}
                            <span>Favourite Boards</span>
                            <span
                                className="toggle-icon"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (showFavouriteBoards) {
                                        setShowFavouriteBoards(false);
                                    } else {
                                        setShowFavouriteBoards(true);
                                    }
                                }}
                            >
                                {showFavouriteBoards ? CloseIcon : OpenIcon}
                            </span>
                        </Link>
                    </li>
                    {showFavouriteBoards && favouriteBoards && favouriteBoards.map((board) => {
                        return (
                            <li className={"dropdown " + 
                                (location.pathname === `/board/${board.board_id}`
                                    ? "active"
                                    : ""
                                )}
                            >
                                <Link 
                                    to={`/board/${board.board_id}`} 
                                >
                                    <span>{board.board_name}</span>
                                </Link>
                            </li>
                        );
                    })}

                    <li className={location.pathname === '/assigned_tasks' ? 'active' : ''}>
                        <Link to='/assigned_tasks'>
                            {AssignedTasksIcon}
                            <span>Assigned Tasks</span>
                        </Link>
                    </li>

                    <li className={location.pathname === '/teams' ? 'active' : ''}>
                        <Link to='/teams'>
                            {PeopleGroup}
                            <span>Teams</span>
                        </Link>
                    </li>

                    <li className={location.pathname === '/permissiontable' ? 'active' : ''}>
                        <Link to='/permissiontable'>
                            {tableIcon}
                            <span>Permission table</span>
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;
