import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ApiService from "../../service/AuthService";
import "../../style/ResetPassword.css";

const ResetPasswordPage = () => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState(null);
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    useEffect(() => {
        console.log("Token from URL:", token);
    }, [token]);

    const handleNewPasswordChange = (e) => {
        setNewPassword(e.target.value);
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
    };

    const toggleNewPasswordVisibility = () => {
        setShowNewPassword(!showNewPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setMessage("Passwords do not match");
            return;
        }

        if (!token) {
            setMessage("Invalid or missing token");
            return;
        }

        try {
            const response = await ApiService.resetPassword(token, newPassword);

            if (response.status === 200) {
                setMessage("Password reset successfully");
                setTimeout(() => navigate("/login"), 2000);
            } else {
                setMessage("Failed to reset password");
            }
        } catch (error) {
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

    const messageClassName = message?.includes("successfully")
        ? "reset-password-message reset-password-message--success"
        : "reset-password-message reset-password-message--error";

    return (
        <div className="reset-password-page">
            <div className="reset-password-shell">
                <div className="reset-password-card">
                    <div className="reset-password-card__header">
                        <img
                            src="/faveicon.png"
                            alt="CuttyPaws paw"
                            className="reset-password-card__logo"
                        />
                        <div>
                            <p className="reset-password-card__eyebrow">Secure reset</p>
                            <h2>Reset your password</h2>
                        </div>
                    </div>

                    <p className="reset-password-card__description">
                        Choose a new password for your CuttyPaws account. Make sure both fields
                        match before submitting.
                    </p>

                    {message && <div className={messageClassName}>{message}</div>}

                    <form onSubmit={handleResetPassword} className="reset-password-form">
                        <div className="reset-password-form__field">
                            <label htmlFor="newPassword">New Password</label>
                            <div className="reset-password-input-group">
                                <input
                                    id="newPassword"
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={handleNewPasswordChange}
                                    placeholder="Enter new password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="reset-password-toggle"
                                    onClick={toggleNewPasswordVisibility}
                                >
                                    {showNewPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        <div className="reset-password-form__field">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div className="reset-password-input-group">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                    placeholder="Confirm new password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="reset-password-toggle"
                                    onClick={toggleConfirmPasswordVisibility}
                                >
                                    {showConfirmPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="reset-password-submit">
                            Reset Password
                        </button>
                    </form>

                    <div className="reset-password-footer">
                        <p>Remember your password?</p>
                        <button
                            type="button"
                            className="reset-password-inline-link"
                            onClick={() => navigate("/login")}
                        >
                            Login here
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
