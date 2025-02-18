import { useState } from "react";
import axios from "../../api/axios"; //Test
import SimpleLoaderPopup from "../SimpleLoaderPopup";

const useAuthForm = (initialState, submitAction) => {
  const [error, setError] = useState(null);
  const [display, setDisplay] = useState("none");
  const [formData, setFormData] = useState(initialState);
  const [emailError, setEmailError] = useState(""); //Test
  const [usernameError, setUsernameError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /* Test email & username*/

  //Az EmailValid funkciót áthozom ide a Signup.js fileból

  const EmailValid = (email) => {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return re.test(email);
  };

  const checkEmail = async (email) => {
    if (!EmailValid(email)) {
      setEmailError("Invalid email format");
      return;
    }
    try {
      const response = await axios.post("/user/check-email", { email });
      if (response.data.exists) {
        setEmailError("Email already exists");
      } else {
        setEmailError("");
      }
    } catch (err) {
      setEmailError("Error checking email");
    }
  };

  const checkUsername = async (username) => {
    try {
      const response = await axios.post("/user/check-username", { username });
      if (response.data.exists) {
        setUsernameError("Username already exists");
      } else {
        setUsernameError("");
      }
    } catch (err) {
      setUsernameError("Error checking username");
    }
  };

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: val,
    }));

    /* Test */
    if (name === "email") {
      await checkEmail(value);
    }
    if (name === "username") {
      await checkUsername(value);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    setFormData((prevFormData) => ({
      ...prevFormData,
      confirmPassword: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await submitAction(formData);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      window.log(error);
      setDisplay("block");
      setError(error?.response?.data || { message: "An error occurred" });
      setTimeout(() => {
        setDisplay("none");
      }, 8000);
    }
  };

  return {
    error,
    display,
    isLoading,
    formData,
    handleChange,
    handleSubmit,
    handlePaste,
    emailError,
    usernameError,
  };
};

export default useAuthForm;
