import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../auth/AuthContext';
import '../../styles/navbar.css';
import '../../styles/popup.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUser, faBars, faSignOutAlt, faUserPen } from '@fortawesome/free-solid-svg-icons';

const notificationIcon = <FontAwesomeIcon icon={faBell} />;
const profileIcon = <FontAwesomeIcon icon={faUser} />;
const menuIcon = <FontAwesomeIcon icon={faBars} />;
const signOutIcon = <FontAwesomeIcon icon={faSignOutAlt} />;
const editProfileIcon = <FontAwesomeIcon icon={faUserPen} />;

const Navbar = () => {
    const { isLoggedIn, onLogout } = React.useContext(AuthContext);

    const hideSidebar = () => {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('sidebar-hidden');
    };

    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            <div className='navbar'>
                <div className='navbar-menu col-12 col-s-12'>
                    <button id='menu-btn' onClick={hideSidebar}>
                        {menuIcon}
                    </button>
                    <ul>
                        <li>
                            <Link to='/notifications'>
                                <span>{notificationIcon}</span>
                            </Link>
                        </li>
                        <li>
                            <span onClick={toggleDropdown}>{profileIcon}</span>
                        </li>
                    </ul>
                </div>
            </div>
            {isOpen && (
                <div className='profile-submenu'>
                    <p className='profile-menu-title'> Profile </p>
                    <ul className='profile-menu'>
                        <li>
                            <Link to='/profile' onClick={toggleDropdown}>
                                <span>{editProfileIcon}</span>
                                <span>Edit Profile</span>
                            </Link>
                        </li>
                        <li>
                            <Link to='/login' onClick={[onLogout, toggleDropdown]} className='logout'>
                                <span>{signOutIcon}</span>
                                <span>Sign Out</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            )}
        </>
    );
};

export default Navbar;
