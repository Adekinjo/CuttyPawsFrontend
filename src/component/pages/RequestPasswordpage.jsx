// src/pages/RequestResetPasswordPage.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import '../../style/RequestPasswordPage.css';

const RequestResetPasswordPage = () => {
    const [resetEmail, setResetEmail] = useState(''); // State for reset password email
    const [message, setMessage] = useState(null); // Message for reset password
    const navigate = useNavigate();

    // Handle input changes for reset password form
    const handleResetEmailChange = (e) => {
        setResetEmail(e.target.value);
    };

    // Handle reset password form submission
    const handleResetPassword = async (e) => {
        e.preventDefault();

        // Check if email is filled
        if (!resetEmail) {
            setMessage("Email is required");
            return;
        }

        try {
            // Call the reset password API
            const response = await ApiService.requestPasswordReset(resetEmail);

            // If reset request is successful
            if (response.status === 200) {
                setMessage("Password reset link sent to your email");
                setResetEmail(''); // Clear the email field
            } else {
                setMessage("Failed to send reset link");
            }
        } catch (error) {
            // Handle API errors
            if (error?.response?.status === 404) {
                setMessage("User not found");
            } else {
                setMessage(error?.message || "Unable to send reset link");
            }
        }
    };

    return (
        <div className="reset-password-page">
            <h2>Reset Password</h2>
            {message && <p className="message">{message}</p>}

            <form onSubmit={handleResetPassword}>
                <label>Email:</label>
                <input
                    type="email"
                    name="resetEmail"
                    value={resetEmail}
                    onChange={handleResetEmailChange}
                    required
                />

                <button type="submit">Send Reset Link</button>
            </form>

            <p className="back-to-login">
                Remember your password?{" "}
                <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="back-button"
                >
                    Back to Login
                </button>
            </p>
        </div>
    );
};

export default RequestResetPasswordPage;