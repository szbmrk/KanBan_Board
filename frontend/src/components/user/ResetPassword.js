import { React, useState } from "react";
import "../../styles/login-signup.css";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import ErrorWrapper from "../../ErrorWrapper";
import SimpleLoaderPopup from "../SimpleLoaderPopup";
import SimpleLabelPopup from "../SimpleLabelPopup";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const query = new URLSearchParams(useLocation().search);
  const email = query.get("email");
  const [passwordMatchError, setPasswordMatchError] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isVibrating, setIsVibrating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [
    showPasswordSuccessfullyResetPopup,
    setShowPasswordSuccessfullyResetPopup,
  ] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleConfirmPasswordChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "confirmPassword") {
      setPasswordMatchError(value !== formData.password);
    }
  };

  const checkPasswordStrength = (password) => {
    if (password.trim() === "") {
      setPasswordStrength("");
      return;
    }

    let strength = 0;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) strength++;

    if (password.length < 8 || strength < 3) {
      setPasswordStrength("Weak");
    } else if (password.length >= 10 && strength >= 3) {
      setPasswordStrength("Strong");
    } else {
      setPasswordStrength("Medium");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setIsLoading(true);
      const response = await axios.post(`/password/reset`, {
        token: token,
        email: email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
      });
      setIsLoading(false);
      setSuccess(response.data.message); // Display success message from backend
      setShowPasswordSuccessfullyResetPopup(true);
    } catch (error) {
      setIsLoading(false);
      // Check if there’s an error response with nested data
      const errorMessage =
        error.response?.data?.message || // Direct message
        (error.response?.data?.email
          ? error.response.data.email[0]
          : "An error occurred."); // Email error
      setError(errorMessage); // Set only the message string for display
    }
  };

  const onPasswordSuccessfullyResetPopupCancel = () => {
    navigate("/login");
  };

  const handlePaste = (e) => {
    e.preventDefault();
    setFormData((prevFormData) => ({
      ...prevFormData,
      confirmPassword: "",
    }));
  };

  return (
    <div className="auth-content">
      <div className="auth-container">
        <h2>Reset password</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <p>Email: {email}</p>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={(e) => {
                handleChange(e);
                checkPasswordStrength(e.target.value);
              }}
              placeholder="Enter your password"
              required
            />
            <div className="password-strength-indicator">
              {passwordStrength && (
                <>
                  <div
                    className={`password-strength ${passwordStrength.toLowerCase()}`}
                  >
                    {passwordStrength}
                  </div>
                  <div className="password-strength-meter">
                    <div
                      className={`strength-indicator ${passwordStrength.toLowerCase()}`}
                      style={{
                        width: `${
                          passwordStrength === "Weak"
                            ? 20
                            : passwordStrength === "Medium"
                            ? 50
                            : 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleConfirmPasswordChange}
              placeholder="Enter your password again"
              required
              onPaste={handlePaste}
            />
            {passwordMatchError && (
              <p
                className="password-match-error"
                style={{
                  textShadow: isVibrating ? "0 0 10px red" : "none",
                  animation: isVibrating
                    ? "shake 0.5s linear infinite"
                    : "none",
                }}
              >
                Passwords do not match!
              </p>
            )}
          </div>
          <div className="form-group">
            {error && (
              <div className="errorBox">
                <p>{error}</p>
              </div>
            )}
            {success && (
              <div className="successBox">
                <p>{success}</p>
              </div>
            )}
            <button className="submit-button" type="submit">
              Submit
            </button>
          </div>
          <div className="form-group">
            <Link to={"/login"}>Back to Login page</Link>
          </div>
        </form>
      </div>
      {isLoading && <SimpleLoaderPopup title={"Loading..."} />}
      {showPasswordSuccessfullyResetPopup && (
        <SimpleLabelPopup
          title={"Password successfully reset"}
          onCancel={() => onPasswordSuccessfullyResetPopupCancel()}
        />
      )}
      {error && (
        <ErrorWrapper
          originalError={error}
          onClose={() => {
            setError(null);
          }}
        />
      )}
    </div>
  );
};

export default ResetPassword;
