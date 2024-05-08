import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import "../../styles/editprofile.css";
import DeleteConfirm from "./DeleteProfileConfirm";
import Loader from "../Loader";
import Error from "../Error";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import bgRegular from "../../styles/imgs/background-regular.jpg";
import bgBlue from "../../styles/imgs/background-blue.jpg";
import bgDarkBlue from "../../styles/imgs/background-darkblue.jpg";
import bgGray from "../../styles/imgs/background-gray.jpg";
import bgGreen from "../../styles/imgs/background-green.jpg";
import bgPurple from "../../styles/imgs/background-purple.jpg";

const deleteIcon = <FontAwesomeIcon icon={faXmark} />;

export default function EditProfile() {
    const token = sessionStorage.getItem("token");
    const [theme, setTheme] = useState(localStorage.getItem("darkMode"));

    useEffect(() => {
        document.title = "KanBan | Profile";
        getProfileData();

        //ez
        const ResetTheme = () => {
            setTheme(localStorage.getItem("darkMode"));
        };

        window.addEventListener("ChangingTheme", ResetTheme);

        return () => {
            window.removeEventListener("ChangingTheme", ResetTheme);
        };
        //eddig
    }, []);

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        newPassword: "",
        confirmPassword: "",
        oldPassword: "",
    });
    const [error, setError] = useState(null);
    const [successfull, setSuccessfull] = useState(false);
    const [redirect, setRedirect] = useState(false);
    const [deleteIsClicked, setDelete] = useState(false);
    const [profileImageUrl, setProfileImageUrl] = useState(
        "https://www.pngitem.com/pimgs/m/30-307416_profile-icon-png-image-free-download-searchpng-employee.png"
    );
    const [display, setDisplay] = useState("none");

    const getProfileData = async () => {
        try {
            const response = await axios.get(`/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFormData({
                username: response.data[0].username,
                email: response.data[0].email,
                newPassword: "",
                confirmPassword: "",
                oldPassword: "",
            });
        } catch (e) {
            console.log(e);
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

    const handlePaste = (e) => {
        e.preventDefault();
        setFormData((prevFormData) => ({
            ...prevFormData,
            confirmPassword: "",
        }));
    };

    const handleChange = (e) => {
        setError(null);
        const { name, value, type, checked } = e.target;
        const val = type === "checkbox" ? checked : value;
        setFormData(({
            ...formData,
            [name]: val,
        }));
    };

    async function handleSubmit(e) {
        e.preventDefault();
        console.log(formData);
        if (formData.newPassword === "" && formData.confirmPassword === "")
            try {
                const response = await axios.put(
                    `/profile`,
                    {
                        username: formData.username,
                        email: formData.email,
                        old_password: formData.oldPassword,
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setSuccessfull(true);
                setTimeout(() => {
                    setSuccessfull(false);
                }, 8000);
            } catch (e) {
                console.log(e);
                if (e?.response?.status === 401 || e?.response?.status === 500) {
                    setError({
                        message: "You are not logged in! Redirecting to login page...",
                    });
                    setRedirect(true);
                } else {
                    setError(e);
                }
            }
        else if (formData.newPassword !== formData.confirmPassword) {
            setDisplay("block");
            setError({ message: "New passwords do not match!" });
            setTimeout(() => {
                setDisplay("none");
            }, 8000);
        } else {
            try {
                if (formData.newPassword.length < 8) {
                    setDisplay("block");
                    setError({
                        message: "New password must be at least 8 characters long",
                    });
                    return;
                }

                const response = await axios.put(
                    `/profile`,
                    {
                        username: formData.username,
                        email: formData.email,
                        old_password: formData.oldPassword,
                        new_password: formData.newPassword,
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setFormData((prevFormData) => ({
                    ...prevFormData,
                    oldPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                }));
                setSuccessfull(true);
                setTimeout(() => {
                    setSuccessfull(false);
                }, 8000);
            } catch (err) {
                setDisplay("block");
                setError(err?.response?.data);
                setTimeout(() => {
                    setDisplay("none");
                }, 8000);
            }
        }
    }

    const changeProfilePicture = async (e) => { };

    function handleDeleteButton() {
        setDelete(!deleteIsClicked);
    }

    function handleImageClick() {
        changeProfilePicture();
    }

    function handleScrollNext() {
        const container = document.querySelector('.Button-scroller');
        container.scrollLeft += 160; 
    }
    
    function handleScrollPrev() {
        const container = document.querySelector('.Button-scroller');
        container.scrollLeft -= 160;
    }
    function handleBackgroundChangeClick(e){
        console.log(e);
        document.body.classList.remove(...document.body.classList)
        document.body.classList.add(e)
        
    }

    return (
        <div className="content col-10" data-theme={theme}>
            {formData.username === "" ? (
                error ? (
                    <Error error={error} redirect={redirect} />
                ) : (
                    <Loader />
                )
            ) : (
                <div>
                    <h1>Edit your profile</h1>
                    <form className="edit-profile-form" onSubmit={handleSubmit}>
                        <div className="profile-image-container">
                            <img
                                className="profile-image"
                                src={profileImageUrl}
                                alt="profile"
                                onClick={handleImageClick}
                            />
                        </div>
                        <div className="form-group-edit">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                placeholder="Enter your username"
                            />
                        </div>
                        <div className="form-group-edit">
                            <label htmlFor="email">E-mail</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="Enter your E-mail"
                            />
                        </div>
                        <div className="form-group-edit">
                            <label htmlFor="oldPassword">Old password</label>
                            <input
                                type="password"
                                id="oldPassword"
                                name="oldPassword"
                                value={formData.oldPassword}
                                onChange={handleChange}
                                placeholder="Enter your old password"
                                required
                            />
                        </div>
                        <div className="form-group-edit">
                            <label htmlFor="newPassword">New password</label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="Enter your new password"
                            />
                        </div>
                        <div className="form-group-edit">
                            <label htmlFor="confirmPassword">Confirm password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your new password"
                                onPaste={handlePaste}
                            />
                        </div>
                        {error && (error.error || error.message) && (
                            <div className="errorBox" style={{ display }}>
                                <p>{error.error ? error.error : error.message}</p>
                            </div>
                        )}
                        {successfull && (
                            <div className="succesfullBox">
                                <p>Profile successfully updated!</p>
                            </div>
                        )}
                        <button className="confirm-button" type="submit">
                            Save
                        </button>
                        <button
                            className="delete-button"
                            onClick={handleDeleteButton}
                            data-hover="Delete Account"
                        >
                            Delete account
                        </button>
                    </form>
                    <div class="ChangeBG">
                        <h2>Change Background</h2>
                        <div class="ButtonContainer">
                            <button class="scroll-button prev-button" onClick={handleScrollPrev}>&lt;</button>
                            <div class="Button-scroller">
                                <img id="bg-regular" src={bgRegular} height={120} width={160} onClick={(e)=>handleBackgroundChangeClick(e.target.id)}></img> 
                                <img id="bg-blue" onClick={(e)=>handleBackgroundChangeClick(e.target.id)} src={bgBlue} height={120} width={160}></img>
                                <img id="bg-darkblue"onClick={(e)=>handleBackgroundChangeClick(e.target.id)} src={bgDarkBlue} height={120} width={160}></img>
                                <img id="bg-gray" onClick={(e)=>handleBackgroundChangeClick(e.target.id)} src={bgGray} height={120} width={160}></img>
                                <img id="bg-green"onClick={(e)=>handleBackgroundChangeClick(e.target.id)} src={bgGreen} height={120} width={160}></img>
                                <img id="bg-purple" onClick={(e)=>handleBackgroundChangeClick(e.target.id)} src={bgPurple} height={120} width={160}></img>
                            </div>
                            <button class="scroll-button next-button" onClick={handleScrollNext}>&gt;</button>
                        </div>
                    </div>
                    {deleteIsClicked && <DeleteConfirm OnClose={handleDeleteButton} />}
                </div>
            )}
        </div>
    );
}
