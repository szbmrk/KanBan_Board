// Sidebar component that using among the application
import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faTable, faSignOutAlt, faListCheck, faPeopleGroup } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../auth/AuthContext';

const homeIcon = <FontAwesomeIcon icon={faHome} />;
const tableIcon = <FontAwesomeIcon icon={faTable} />;
const signOutIcon = <FontAwesomeIcon icon={faSignOutAlt} />;
const AssignedTasksIcon = <FontAwesomeIcon icon={faListCheck} />;
const PeopleGroup = <FontAwesomeIcon icon={faPeopleGroup} />;
const Sidebar = () => {
    const { isLoggedIn, onLogout } = React.useContext(AuthContext);
    return (
        <div className='sidebar'>
            <div className='sidebar-menu col-2 col-s-2'>
                <ul>
                    <li>
                        <Link to='/dashboard'>
                            {homeIcon}
                            <span>Dashboard</span>
                        </Link>
                    </li>

                    <li>
                        <Link to='/assigned_tasks'>
                            {AssignedTasksIcon}
                            <span>Assigned Tasks</span>
                        </Link>
                    </li>

                    <li>
                        <Link to='/teams'>
                            {PeopleGroup}
                            <span>Teams</span>
                        </Link>
                    </li>

                    <li>
                        <Link to='/permissiontable'>
                            {tableIcon}
                            <span>Permission table</span>
                        </Link>
                    </li>

                    <li>
                        <Link to='/login' onClick={onLogout}>
                            {signOutIcon}
                            <span>Logout</span>
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;
