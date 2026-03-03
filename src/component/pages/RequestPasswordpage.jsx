import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/AuthService";
import "../../style/RequestPasswordPage.css";

const RequestResetPasswordPage = () => {
    const [resetEmail, setResetEmail] = useState("");
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    const handleResetEmailChange = (e) => {
        setResetEmail(e.target.value);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!resetEmail) {
            setMessage("Email is required");
            return;
        }

        try {
            const response = await ApiService.requestPasswordReset(resetEmail);

            if (response.status === 200) {
                setMessage("Password reset link sent to your email");
                setResetEmail("");
            } else {
                setMessage("Failed to send reset link");
            }
        } catch (error) {
            if (error?.response?.status === 404) {
                setMessage("User not found");
            } else {
                setMessage(error?.message || "Unable to send reset link");
            }
        }
    };

    const messageClassName = message?.includes("sent")
        ? "request-password-message request-password-message--success"
        : "request-password-message request-password-message--error";

    return (
        <div className="request-password-page">
            <div className="request-password-shell">
                <div className="request-password-card">
                    <div className="request-password-card__header">
                        <img
                            src="/faveicon.png"
                            alt="CuttyPaws paw"
                            className="request-password-card__logo"
                        />
                        <div>
                            <p className="request-password-card__eyebrow">Password help</p>
                            <h2>Request a reset link</h2>
                        </div>
                    </div>

                    <p className="request-password-card__description">
                        Enter the email linked to your CuttyPaws account and we will send you a
                        password reset link.
                    </p>

                    {message && <div className={messageClassName}>{message}</div>}

                    <form onSubmit={handleResetPassword} className="request-password-form">
                        <div className="request-password-form__field">
                            <label htmlFor="resetEmail">Email Address</label>
                            <input
                                id="resetEmail"
                                type="email"
                                name="resetEmail"
                                value={resetEmail}
                                onChange={handleResetEmailChange}
                                placeholder="name@example.com"
                                required
                            />
                        </div>

                        <button type="submit" className="request-password-submit">
                            Send Reset Link
                        </button>
                    </form>

                    <div className="request-password-footer">
                        <p>Remember your password?</p>
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="request-password-inline-link"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestResetPasswordPage;
