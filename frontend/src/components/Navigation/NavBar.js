import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../auth/AuthContext';
import '../../styles/navbar.css';
import '../../styles/popup.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBell,
    faUser,
    faBars,
    faSignOutAlt,
    faUserPen,
    faMagnifyingGlass,
    faCircleHalfStroke,
} from '@fortawesome/free-solid-svg-icons';

const notificationIcon = <FontAwesomeIcon icon={faBell} />;
const profileIcon = <FontAwesomeIcon icon={faUser} />;
const menuIcon = <FontAwesomeIcon icon={faBars} />;
const signOutIcon = <FontAwesomeIcon icon={faSignOutAlt} />;
const editProfileIcon = <FontAwesomeIcon icon={faUserPen} />;
const searchIcon = <FontAwesomeIcon icon={faMagnifyingGlass} />;
const displayModeIcon = <FontAwesomeIcon icon={faCircleHalfStroke} />;

function DarkMode() {
    console.log("hallo");
}

const Navbar = () => {
    const { isLoggedIn, onLogout } = React.useContext(AuthContext);

    const hideSidebar = () => {
        const sidebar = document.querySelector('.sidebar');
        const content = document.querySelector('.content');

        sidebar.classList.toggle('sidebar-hidden');
        sidebar.classList.toggle('sidebar-visible');
        if (sidebar.classList.contains('sidebar-hidden')) {
            setTimeout(() => {
                sidebar.style.display = 'none';
                content.style.width = '100%';
                content.style.transition = 'width 0.5s ease-in-out';
            }, 500);
        } else {
            sidebar.style.display = 'block';
            content.style.width = '83.33%';
            content.style.transition = 'width 0.5s ease-in-out';
        }
    };

    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    async function handleSearch(e) {
        console.log('Search not implemented yet');
    }

    return (
        <>
            <div className='navbar'>
                <div className='navbar-menu col-12 col-s-12'>
                    <button id='menu-btn' onClick={hideSidebar}>
                        {menuIcon}
                    </button>
                    <ul>
                        <li
                            style={{
                                visibility: 'hidden',
                            }}
                        >
                            <form className='search-form' onSubmit={(e) => handleSearch()}>
                                <input type='text' placeholder='Search..'></input>
                                <button type='submit'>{searchIcon}</button>
                            </form>
                        </li>
                        <li>
                            <span onClick={DarkMode}>{displayModeIcon}</span>
                        </li>
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
                <div className='profile-submenu' onMouseLeave={() => setIsOpen(false)}>
                    <p className='profile-menu-title'> Profile </p>
                    <ul className='profile-menu'>
                        <li>
                            <Link to='/profile' onClick={toggleDropdown}>
                                <span>{editProfileIcon}</span>
                                <span>Edit Profile</span>
                            </Link>
                        </li>
                        <li>
                            <Link to='/login' onClick={onLogout} className='logout'>
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
