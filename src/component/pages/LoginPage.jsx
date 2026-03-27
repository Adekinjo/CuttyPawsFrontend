import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/AuthService";
import ServiceProviderService from "../../service/ServiceProviderService";
import "../../style/Login.css";

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        rememberMe: false
    });
    const [verificationCode, setVerificationCode] = useState("");
    const [showVerificationPopup, setShowVerificationPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [verificationError, setVerificationError] = useState("");
    const [remainingTime, setRemainingTime] = useState("10:00");
    const [isResending, setIsResending] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [remainingAttempts, setRemainingAttempts] = useState(5);
    const navigate = useNavigate();

    useEffect(() => {
        let timer;
        if (showVerificationPopup && remainingTime !== "Expired" && remainingTime !== "No code") {
            timer = setInterval(() => {
                const [minutes, seconds] = remainingTime.split(":").map(Number);
                const totalSeconds = minutes * 60 + seconds - 1;

                if (totalSeconds <= 0) {
                    setRemainingTime("Expired");
                    setVerificationError("Verification code expired. Please request a new one.");
                } else {
                    const newMinutes = Math.floor(totalSeconds / 60);
                    const newSeconds = totalSeconds % 60;
                    setRemainingTime(
                        `${newMinutes.toString().padStart(2, "0")}:${newSeconds
                            .toString()
                            .padStart(2, "0")}`
                    );
                }
            }, 1000);
        }

        return () => clearInterval(timer);
    }, [showVerificationPopup, remainingTime]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value
        });
        if (message) setMessage("");
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setIsLoading(true);
        console.log("[LoginPage] submit:start", {
            email: formData.email,
            rememberMe: formData.rememberMe,
            hasPassword: Boolean(formData.password),
        });

        if (!formData.email || !formData.password) {
            console.warn("[LoginPage] submit:missing-fields", {
                email: formData.email,
                hasPassword: Boolean(formData.password),
            });
            setMessage("Email and password are required");
            setIsLoading(false);
            return;
        }

        try {
            const loginData = {
                email: formData.email.trim(),
                password: formData.password,
                rememberMe: formData.rememberMe
            };

            const response = await ApiService.loginUser(loginData);
            console.log("[LoginPage] submit:response", {
                hasToken: Boolean(response?.token),
                hasRefreshToken: Boolean(response?.refreshToken),
                requiresVerification: Boolean(response?.requiresVerification),
                role: response?.role,
            });

            if (response.requiresVerification) {
                console.log("[LoginPage] submit:requires-verification");
                setShowVerificationPopup(true);
                setRemainingTime(response.remainingTime || "10:00");
                setRemainingAttempts(response.remainingAttempts || 5);
                setMessage(response.message || "Verification code sent to your email");
            } else if (response.token) {
                console.log("[LoginPage] submit:login-success");
                handleLoginSuccess(response, formData.rememberMe);
            } else {
                console.warn("[LoginPage] submit:no-token", {
                    message: response?.message,
                });
                setMessage(response.message || "Login failed");
            }
        } catch (error) {
            console.error("[LoginPage] submit:error", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
            });
            const errorMessage =
                error.response?.data?.message || error.message || "Login failed. Please try again.";
            setMessage(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (isResending) return;

        setIsResending(true);
        setVerificationError("");
        try {
            const response = await ApiService.resendVerificationCode({
                email: formData.email,
                password: formData.password
            });

            setRemainingTime(response.remainingTime || "10:00");
            setRemainingAttempts(5);
            setVerificationCode("");
            setVerificationError("");
            setMessage("New verification code sent to your email");
        } catch (error) {
            setVerificationError(
                `Failed to resend code: ${error.response?.data?.message || "Please try again"}`
            );
        } finally {
            setIsResending(false);
        }
    };

    const handleVerificationSubmit = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            console.warn("[LoginPage] verify:invalid-code", {
                length: verificationCode?.length || 0,
            });
            setVerificationError("Please enter a valid 6-digit code");
            return;
        }

        setIsLoading(true);
        setVerificationError("");
        console.log("[LoginPage] verify:start", {
            email: formData.email,
            rememberMe: formData.rememberMe,
            verificationCodeLength: verificationCode.length,
        });

        try {
            const verifyData = {
                email: formData.email,
                password: formData.password,
                rememberMe: formData.rememberMe,
                verificationCode
            };

            const response = await ApiService.verifyCode(verifyData);
            console.log("[LoginPage] verify:response", {
                hasToken: Boolean(response?.token),
                requiresVerification: Boolean(response?.requiresVerification),
                remainingAttempts: response?.remainingAttempts,
            });

            if (response.token) {
                console.log("[LoginPage] verify:login-success");
                handleLoginSuccess(response, formData.rememberMe);
                setShowVerificationPopup(false);
                setVerificationError("");
            } else if (response.requiresVerification) {
                setVerificationError(response.message || "Invalid verification code");
                setRemainingTime(response.remainingTime || remainingTime);
                setRemainingAttempts(response.remainingAttempts || remainingAttempts - 1);

                if (response.message?.includes("Too many wrong attempts")) {
                    setVerificationError(response.message);
                }
            }
        } catch (error) {
            console.error("[LoginPage] verify:error", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
            });
            const errorMessage =
                error.response?.data?.message || "Invalid verification code. Please try again.";
            setVerificationError(errorMessage);

            if (error.response?.data?.remainingAttempts) {
                setRemainingAttempts(error.response.data.remainingAttempts);
            } else {
                setRemainingAttempts((prev) => Math.max(0, prev - 1));
            }

            if (error.response?.data?.remainingTime) {
                setRemainingTime(error.response.data.remainingTime);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoginSuccess = (response, rememberMe) => {
        console.log("[LoginPage] handleLoginSuccess:start", {
            role: response?.role,
            hasToken: Boolean(response?.token),
            hasRefreshToken: Boolean(response?.refreshToken),
            userId: response?.user?.id,
            isServiceProvider: Boolean(response?.user?.isServiceProvider),
            rememberMe,
        });
        setMessage("Login successful!");

        localStorage.setItem("token", response.token);
        if (response.refreshToken) {
            localStorage.setItem("refreshToken", response.refreshToken);
        }
        const resolvedRole =
            response?.role ||
            response?.user?.role ||
            response?.user?.userRole ||
            "";
        localStorage.setItem("role", resolvedRole);
        ApiService.setStoredUser(response.user);
        localStorage.setItem("rememberMe", rememberMe.toString());

        ApiService.setupAxiosInterceptors();
        ApiService.setupInactivityLogout();
        console.log("[LoginPage] handleLoginSuccess:storage-written", {
            hasToken: Boolean(localStorage.getItem("token")),
            hasRefreshToken: Boolean(localStorage.getItem("refreshToken")),
            role: localStorage.getItem("role"),
            rememberMe: localStorage.getItem("rememberMe"),
        });

        const finishLogin = async () => {
            let nextPath = "/";

            if (response.user?.isServiceProvider) {
                try {
                    await ServiceProviderService.refreshDashboard();
                    nextPath = "/service/dashboard";
                } catch (error) {
                    console.error("Unable to load service dashboard after login:", error);
                }
            } else {
                ServiceProviderService.clearStoredDashboard();
            }

            console.log("[LoginPage] handleLoginSuccess:navigate", {
                nextPath,
            });
            setTimeout(() => navigate(nextPath, { replace: true }), 1000);
        };

        finishLogin();
    };

    const closeVerificationPopup = () => {
        setShowVerificationPopup(false);
        setVerificationCode("");
        setVerificationError("");
        setRemainingTime("10:00");
        setRemainingAttempts(5);
    };

    const shouldShowRequestNewCode =
        verificationError?.includes("Too many wrong attempts") || remainingAttempts <= 0;

    const alertClassName = message.includes("successful")
        ? "alert-success"
        : message.includes("sent")
          ? "alert-info"
          : "alert-danger";

    return (
        <div className="login-page">
            <div className="login-shell">
                <div className="login-form-card">
                    <div className="login-form-card__header">
                        <img src="/faveicon.png" alt="CuttyPaws paw" className="login-form-card__logo" />
                        <div>
                            <p className="login-form-card__eyebrow">Welcome back</p>
                            <h2>Sign in</h2>
                        </div>
                    </div>

                    {message && (
                        <div className={`alert ${alertClassName} login-alert`} role="alert">
                            <span>{message}</span>
                            <button type="button" className="btn-close" onClick={() => setMessage("")} />
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="login-form-field">
                            <label htmlFor="email" className="form-label">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@example.com"
                                required
                                className="form-control form-control-lg"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="login-form-field">
                            <div className="login-form-field__label-row">
                                <label htmlFor="password" className="form-label">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    className="login-inline-link"
                                    onClick={() => !isLoading && navigate("/request-password")}
                                    disabled={isLoading}
                                >
                                    Forgot password?
                                </button>
                            </div>

                            <div className="login-password-group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    required
                                    className="form-control form-control-lg"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="login-password-toggle"
                                    disabled={isLoading}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        <div className="login-form-meta">
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                    className="form-check-input"
                                    id="rememberMe"
                                    disabled={isLoading}
                                />
                                <label className="form-check-label" htmlFor="rememberMe">
                                    Keep me signed in for 30 days
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`btn login-submit-button ${isLoading ? "disabled" : ""}`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                                    Signing in...
                                </>
                            ) : (
                                "Enter CuttyPaws"
                            )}
                        </button>

                        <div className="login-form-footer">
                            <button
                                type="button"
                                className="login-inline-link"
                                onClick={() => !isLoading && navigate("/request-password")}
                                disabled={isLoading}
                            >
                                Forgot your password?
                            </button>
                            <p>New to the pet community?</p>
                            <button
                                type="button"
                                className="login-create-account"
                                onClick={() => !isLoading && navigate("/register")}
                                disabled={isLoading}
                            >
                                Create your account
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {showVerificationPopup && (
                <div className="modal fade show d-block login-modal" tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content login-modal__content">
                            <div className="modal-header border-0 pb-0">
                                <div>
                                    <p className="login-modal__eyebrow">Secure sign-in</p>
                                    <h5 className="modal-title fw-bold">Device Verification Required</h5>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeVerificationPopup}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="modal-body py-4">
                                <p className="text-muted mb-4">
                                    We sent a 6-digit verification code to your email before letting this
                                    device into your CuttyPaws account.
                                </p>

                                <div className="login-modal__status">
                                    <div
                                        className={`badge ${
                                            remainingTime === "Expired" ? "bg-danger" : "bg-warning text-dark"
                                        } fs-6`}
                                    >
                                        {remainingTime === "Expired"
                                            ? "Code expired"
                                            : `Time left: ${remainingTime}`}
                                    </div>
                                    {remainingAttempts > 0 && remainingAttempts < 5 && (
                                        <div className="alert alert-warning py-2 mt-3 mb-0" role="alert">
                                            {remainingAttempts} attempt{remainingAttempts !== 1 ? "s" : ""} remaining
                                        </div>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <input
                                        type="text"
                                        value={verificationCode}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                                            setVerificationCode(value);
                                            setVerificationError("");
                                        }}
                                        placeholder="Enter 6-digit code"
                                        maxLength="6"
                                        className={`form-control form-control-lg text-center login-verification-input ${
                                            verificationError ? "is-invalid" : ""
                                        }`}
                                        disabled={isLoading || shouldShowRequestNewCode}
                                    />
                                    {verificationError && (
                                        <div className="invalid-feedback d-block">{verificationError}</div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleResendCode}
                                    disabled={isResending || (remainingTime !== "Expired" && remainingTime > "01:00")}
                                    className="btn btn-outline-primary login-resend-button"
                                >
                                    {isResending ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" />
                                            Sending...
                                        </>
                                    ) : (
                                        "Resend Code"
                                    )}
                                </button>
                            </div>
                            <div className="modal-footer border-0">
                                {shouldShowRequestNewCode ? (
                                    <button
                                        onClick={handleResendCode}
                                        className="btn login-request-button"
                                        disabled={isResending}
                                    >
                                        {isResending ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" />
                                                Sending...
                                            </>
                                        ) : (
                                            "Request New Code"
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleVerificationSubmit}
                                        className="btn login-request-button"
                                        disabled={!verificationCode || verificationCode.length !== 6 || isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" />
                                                Verifying...
                                            </>
                                        ) : (
                                            "Verify Code"
                                        )}
                                    </button>
                                )}
                                <button
                                    onClick={closeVerificationPopup}
                                    className="btn btn-outline-secondary"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginPage;
