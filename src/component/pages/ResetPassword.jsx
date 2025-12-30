// src/pages/ResetPasswordPage.js
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ApiService from "../../service/ApiService"; // Ensure this path is correct
import '../../style/ResetPassword.css'; // Ensure this path is correct

const ResetPasswordPage = () => {
    const [newPassword, setNewPassword] = useState(''); // State for new password
    const [confirmPassword, setConfirmPassword] = useState(''); // State for confirm password
    const [showNewPassword, setShowNewPassword] = useState(false); // Toggle new password visibility
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Toggle confirm password visibility
    const [message, setMessage] = useState(null); // Message for reset password
    const [searchParams] = useSearchParams(); // Extract token from URL
    const token = searchParams.get("token"); // Get the token from the URL
    const navigate = useNavigate();

    // Log the token for debugging
    useEffect(() => {
        console.log("Token from URL:", token);
    }, [token]);

    // Handle input changes for new password
    const handleNewPasswordChange = (e) => {
        setNewPassword(e.target.value);
    };

    // Handle input changes for confirm password
    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
    };

    // Toggle new password visibility
    const toggleNewPasswordVisibility = () => {
        setShowNewPassword(!showNewPassword);
    };

    // Toggle confirm password visibility
    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
    
        // Check if passwords match
        if (newPassword !== confirmPassword) {
            setMessage("Passwords do not match");
            return;
        }
    
        // Check if token is present
        if (!token) {
            setMessage("Invalid or missing token");
            return;
        }
    
        try {
            // Call the reset password API
            const response = await ApiService.resetPassword(token, newPassword);
    
            // If reset is successful
            if (response.status === 200) {
                setMessage("Password reset successfully");
                setTimeout(() => navigate("/login"), 2000); // Redirect to login after 2 seconds
            } else {
                setMessage("Failed to reset password");
            }
        } catch (error) {
            // Handle API errors
            if (error?.response?.status === 400) {
                if (error.response.data.message === "Token has expired") {
                    setMessage("The password reset link has expired. Please request a new one.");
                } else {
                    setMessage("Invalid or expired token");
                }
            } else {
                setMessage(error?.message || "Unable to reset password");
            }
        }
    };

    return (
        <div className="reset-password-container">
            <div className="reset-password-card">
                <h2>Reset Your Password</h2>
                {message && <p className={message.includes("successfully") ? "success-message" : "error-message"}>{message}</p>}

                <form onSubmit={handleResetPassword}>
                    <div className="form-group">
                        <label>New Password</label>
                        <div className="password-input">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={handleNewPasswordChange}
                                placeholder="Enter new password"
                                required
                            />
                            <span
                                className="toggle-password"
                                onClick={toggleNewPasswordVisibility}
                            >
                                {showNewPassword ? "🙈" : "👁️"}
                            </span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <div className="password-input">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                placeholder="Confirm new password"
                                required
                            />
                            <span
                                className="toggle-password"
                                onClick={toggleConfirmPasswordVisibility}
                            >
                                {showConfirmPassword ? "🙈" : "👁️"}
                            </span>
                        </div>
                    </div>

                    <button type="submit" className="reset-button">
                        Reset Password
                    </button>
                </form>

                <p className="back-to-login">
                    Remember your password?{" "}
                    <span onClick={() => navigate("/login")}>Login here</span>
                </p>
            </div>
        </div>
    );
};

export default ResetPasswordPage;