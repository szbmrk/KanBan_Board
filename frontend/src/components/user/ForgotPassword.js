import { React, useState } from "react";
import "../../styles/login-signup.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import ErrorWrapper from "../../ErrorWrapper";
import SimpleLoaderPopup from "../SimpleLoaderPopup";
import SimpleLabelPopup from "../SimpleLabelPopup";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailSentPopup, setShowEmailSentPopup] = useState(false);
  const [error, setError] = useState(null);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      console.log("EMAIL");
      console.log(email);
      await axios.post(`/password/email`, {
        email: email,
      });
      setIsLoading(false);
      setShowEmailSentPopup(true);
    } catch (e) {
      setIsLoading(false);
      setError(
        e?.response?.data
          ? e?.response?.data
          : "Couldn't sent email to given address"
      );
      //setError("Couldn't sent email to given address");
    }
  };

  const onEmailSentPopupCancel = () => {
    navigate("/login");
  };

  return (
    <div className="auth-content">
      <div className="auth-container">
        <h2>Reset password</h2>
        <form className="auth-form">
          <div className="form-group">
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <button
              className="submit-button"
              type="submit"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
          <div className="form-group">
            <Link to={"/login"}>{"Back to Login page"}</Link>
          </div>
        </form>
      </div>
      {isLoading && <SimpleLoaderPopup title={"Loading..."} />}
      {showEmailSentPopup && (
        <SimpleLabelPopup
          title={"Email sent"}
          onCancel={() => onEmailSentPopupCancel()}
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

export default ForgotPassword;
