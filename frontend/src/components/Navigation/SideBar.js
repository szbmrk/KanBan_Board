// Sidebar component that using among the application
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClapperboard, faTable, faSignOutAlt, faListCheck, faPeopleGroup, faHome } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../auth/AuthContext';

const BoardsIcon = <FontAwesomeIcon icon={faClapperboard} />
const tableIcon = <FontAwesomeIcon icon={faTable} />;
const AssignedTasksIcon = <FontAwesomeIcon icon={faListCheck} />;
const PeopleGroup = <FontAwesomeIcon icon={faPeopleGroup} />;
const HomeIcon = <FontAwesomeIcon icon={faHome} />;
const permissions = JSON.parse(sessionStorage.getItem('permissions'));
const Sidebar = () => {
    const location = useLocation();
    const isBoardActive = location.pathname.includes('/board');
    const [theme, setTheme] = useState(localStorage.getItem("darkMode"));
    const { isLoggedIn, onLogout } = React.useContext(AuthContext);
    useEffect(() => {
        //ez
        const ResetTheme = () => {
            setTheme(localStorage.getItem("darkMode"))
        }


        window.log("Darkmode: " + localStorage.getItem("darkMode"))
        window.addEventListener('ChangingTheme', ResetTheme)

        return () => {
            window.removeEventListener('ChangingTheme', ResetTheme)
        }
        //eddig
        window.log(permissions);
    }, []);

    return (
        <div className='sidebar col-2 sidebar-visible' data-theme={theme}>
            <div className='sidebar-menu'>
                <ul>
                    <li className={location.pathname === '#' ? 'active' : ''}>
                        <Link to='#'>
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
