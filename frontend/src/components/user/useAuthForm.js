import { useState } from "react";

const useAuthForm = (initialState, submitAction) => {
  const [error, setError] = useState(null);
  const [display, setDisplay] = useState("none");
  const [formData, setFormData] = useState(initialState);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: val,
    }));
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
  };
};

export default useAuthForm;
