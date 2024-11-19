// Sidebar component that using among the application
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClapperboard, faStar, faTable, faSignOutAlt, faListCheck, faPeopleGroup, faHome, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../auth/AuthContext';
import axios from "../../api/axios";

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
    const [favouriteBoards, setFavouriteBoards] = useState(null);

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
