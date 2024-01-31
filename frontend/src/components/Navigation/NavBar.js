import React, { useState, useEffect } from 'react';
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
} from "@fortawesome/free-solid-svg-icons";

const notificationIcon = <FontAwesomeIcon icon={faBell} />;
const profileIcon = <FontAwesomeIcon icon={faUser} />;
const menuIcon = <FontAwesomeIcon icon={faBars} />;
const signOutIcon = <FontAwesomeIcon icon={faSignOutAlt} />;
const editProfileIcon = <FontAwesomeIcon icon={faUserPen} />;
const searchIcon = <FontAwesomeIcon icon={faMagnifyingGlass} />;
const displayModeIcon = <FontAwesomeIcon icon={faCircleHalfStroke} />;

function DarkMode() {
    console.log("Hallo");
}

const Navbar = () => {
    const { isLoggedIn, onLogout } = React.useContext(AuthContext);
    const [isSidebarClosable, setIsSidebarClosable] = useState(false);
    const [isSidebarOnTop, setIsSidebarOnTop] = useState(false);
    const [theme, setTheme] = useState(sessionStorage.getItem("darkMode"));
    useEffect(() => {
        //ez
        const ResetTheme = () => {
            setTheme(sessionStorage.getItem("darkMode"))
        }


        console.log("Darkmode: " + sessionStorage.getItem("darkMode"))
        window.addEventListener('ChangingTheme', ResetTheme)

        return () => {
            window.removeEventListener('ChangingTheme', ResetTheme)
        }
        //eddig
    }, []);

    function DarkMode() {
        console.log(sessionStorage.getItem("darkMode"))
        if (sessionStorage.getItem("darkMode") == "dark") {
            console.log("Switching to light mode")
            sessionStorage.setItem("darkMode", "light");
        }
        else {
            console.log("Switching to dark mode")
            sessionStorage.setItem("darkMode", "dark");
        }
        const event = new Event("ChangingTheme")
        window.dispatchEvent(event)
    }


    const toggleSidebar = () => {
        const sidebar = document.querySelector(".sidebar");
        const content = document.querySelector(".content");

        sidebar.classList.toggle("sidebar-hidden");
        sidebar.classList.toggle("sidebar-visible");
        if (sidebar.classList.contains("sidebar-hidden")) {
            sidebar.style.transform = isSidebarOnTop
                ? "translateY(-253px)"
                : "translateX(-231px)";
            sidebar.style.transition = "transform 0.5s ease-in-out";
            setTimeout(() => {
                content.classList.remove("col-10");
                content.classList.add("col-12");
                content.style.maxWidth = "100%";
                sidebar.style.display = "none";
            }, 500);
        } else {
            content.style.maxWidth = isSidebarOnTop ? "100%" : "calc(100% - 231px)";
            content.style.transition = "max-width 0.5s ease-in-out";
            sidebar.style.transition = "transform 0.5s ease-in-out";
            sidebar.style.display = "block";
            setTimeout(() => {
                content.classList.remove("col-12");
                content.classList.add("col-10");
                sidebar.style.transform = "translateX(0px)";
            }, 100);
        }
    };

    useEffect(() => {
        const maxWidth = window.matchMedia("(min-width: 980px)");

        const closeSidebar = (e) => {
            setIsSidebarClosable(!e.matches);
            toggleSidebar();
        };

        maxWidth.addEventListener("change", closeSidebar);

        return () => {
            maxWidth.removeEventListener("change", closeSidebar);
        };
    }, [isSidebarClosable]);

    useEffect(() => {
        const sidebarVisibleOnTop = window.matchMedia("(max-width: 600px)");

        const content = document.querySelector(".content");

        const setSidebarOnTop = (e) => {
            if (e.matches) {
                content.style.maxWidth = "100%";
                content.style.transition = "max-width 0.5s ease-in-out";
            } else {
                content.style.maxWidth = "calc(100% - 231px)";
                content.style.transition = "max-width 0.5s ease-in-out";
            }
            setIsSidebarOnTop(e.matches);
        };

        sidebarVisibleOnTop.addEventListener("change", setSidebarOnTop);

        return () => {
            sidebarVisibleOnTop.removeEventListener("change", setSidebarOnTop);
        };
    }, [isSidebarOnTop]);

    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleClick = () => {
        toggleSidebar();
    };

    return (
        <>
            <div className="navbar col-12" data-theme={theme}>
                <div className="navbar-menu">
                    <button id="menu-btn" onClick={handleClick}>
                        {menuIcon}
                    </button>
                    <ul>
                        <li>
                            <span onClick={DarkMode}>{displayModeIcon}</span>
                        </li>
                        <li>
                            <Link to="/notifications">
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
                <div className="profile-submenu" onMouseLeave={() => setIsOpen(false)}>
                    <p className="profile-menu-title"> Profile </p>
                    <ul className="profile-menu">
                        <li>
                            <Link to="/profile" onClick={toggleDropdown}>
                                <span>{editProfileIcon}</span>
                                <span>Edit Profile</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/login" onClick={onLogout} className="logout">
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
