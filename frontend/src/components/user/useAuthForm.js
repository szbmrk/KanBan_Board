import { useState } from "react";
import axios from "../../api/axios"; //Test

const useAuthForm = (initialState, submitAction) => {
  const [error, setError] = useState(null);
  const [display, setDisplay] = useState("none");
  const [formData, setFormData] = useState(initialState);
  const [emailError, setEmailError] = useState(""); //Test



  /* Test */

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

  const handleChange = async(e) => {
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
      await submitAction(formData);
    } catch (error) {
      console.log(error);
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
    formData,
    handleChange,
    handleSubmit,
    handlePaste,
    emailError,
  };
};

export default useAuthForm;
