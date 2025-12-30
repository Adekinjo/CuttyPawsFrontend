import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/AuthService";
import '../../style/Login.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [verificationCode, setVerificationCode] = useState('');
    const [showVerificationPopup, setShowVerificationPopup] = useState(false);
    const [message, setMessage] = useState('');
    const [verificationError, setVerificationError] = useState('');
    const [remainingTime, setRemainingTime] = useState("10:00");
    const [isResending, setIsResending] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [remainingAttempts, setRemainingAttempts] = useState(5);
    const navigate = useNavigate();

    // Countdown timer
    useEffect(() => {
        let timer;
        if (showVerificationPopup && remainingTime !== "Expired" && remainingTime !== "No code") {
            timer = setInterval(() => {
                const [minutes, seconds] = remainingTime.split(':').map(Number);
                let totalSeconds = minutes * 60 + seconds - 1;
                
                if (totalSeconds <= 0) {
                    setRemainingTime("Expired");
                    setVerificationError("Verification code expired. Please request a new one.");
                } else {
                    const newMinutes = Math.floor(totalSeconds / 60);
                    const newSeconds = totalSeconds % 60;
                    setRemainingTime(`${newMinutes.toString().padStart(2, '0')}:${newSeconds.toString().padStart(2, '0')}`);
                }
            }, 1000);
        }
        
        return () => clearInterval(timer);
    }, [showVerificationPopup, remainingTime]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ 
            ...formData, 
            [name]: type === 'checkbox' ? checked : value 
        });
        if (message) setMessage('');
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsLoading(true);

        if (!formData.email || !formData.password) {
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

            if (response.requiresVerification) {
                setShowVerificationPopup(true);
                setRemainingTime(response.remainingTime || "10:00");
                setRemainingAttempts(response.remainingAttempts || 5);
                setMessage(response.message || "Verification code sent to your email");
            } else if (response.token) {
                handleLoginSuccess(response, formData.rememberMe);
            } else {
                setMessage(response.message || "Login failed");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 
                               error.message || 
                               "Login failed. Please try again.";
            setMessage(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (isResending) return;
        
        setIsResending(true);
        setVerificationError('');
        try {
            const response = await ApiService.resendVerificationCode({
                email: formData.email,
                password: formData.password
            });
            
            setRemainingTime(response.remainingTime || "10:00");
            setRemainingAttempts(5);
            setVerificationCode('');
            setVerificationError('');
            setMessage("New verification code sent to your email");
        } catch (error) {
            setVerificationError("Failed to resend code: " + (error.response?.data?.message || "Please try again"));
        } finally {
            setIsResending(false);
        }
    };

    const handleVerificationSubmit = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            setVerificationError("Please enter a valid 6-digit code");
            return;
        }

        setIsLoading(true);
        setVerificationError('');

        try {
            const verifyData = {
                email: formData.email,
                password: formData.password,
                rememberMe: formData.rememberMe,
                verificationCode: verificationCode
            };

            // ✅ Use verify-code endpoint instead of login
            const response = await ApiService.verifyCode(verifyData);
            
            if (response.token) {
                handleLoginSuccess(response, formData.rememberMe);
                setShowVerificationPopup(false);
                setVerificationError('');
            } else if (response.requiresVerification) {
                setVerificationError(response.message || "Invalid verification code");
                setRemainingTime(response.remainingTime || remainingTime);
                setRemainingAttempts(response.remainingAttempts || remainingAttempts - 1);
                
                if (response.message?.includes("Too many wrong attempts")) {
                    setVerificationError(response.message);
                }
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 
                            "Invalid verification code. Please try again.";
            setVerificationError(errorMessage);
            
            if (error.response?.data?.remainingAttempts) {
                setRemainingAttempts(error.response.data.remainingAttempts);
            } else {
                setRemainingAttempts(prev => Math.max(0, prev - 1));
            }
            
            if (error.response?.data?.remainingTime) {
                setRemainingTime(error.response.data.remainingTime);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoginSuccess = (response, rememberMe) => {
        setMessage("Login successful!");
        
        // Store tokens and user data
        localStorage.setItem('token', response.token);
        if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken);
        }
        localStorage.setItem('role', response.role);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('rememberMe', rememberMe.toString()); // Store remember me preference

        // Setup automatic token refresh and inactivity logout
        ApiService.setupAxiosInterceptors();
        ApiService.setupInactivityLogout();

        setTimeout(() => navigate("/", { replace: true }), 1500);
    };



    const closeVerificationPopup = () => {
        setShowVerificationPopup(false);
        setVerificationCode('');
        setVerificationError('');
        setRemainingTime("10:00");
        setRemainingAttempts(5);
    };

    const shouldShowRequestNewCode = verificationError?.includes("Too many wrong attempts") || 
                                   remainingAttempts <= 0;

    return (
        <div className="container-fluid min-vh-100 bg-light d-flex align-items-center">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4">
                        {/* Main Login Card */}
                        <div className="card shadow-lg border-0">
                            <div className="card-body p-4 p-md-5">
                                <div className="text-center mb-4">
                                    <h2 className="card-title fw-bold text-primary mb-2">Welcome Back</h2>
                                    <p className="text-muted">Sign in to your account</p>
                                </div>

                                {/* Alert Messages */}
                                {message && (
                                    <div className={`alert ${
                                        message.includes("successful") ? "alert-success" : 
                                        message.includes("sent") ? "alert-info" : "alert-danger"
                                    } alert-dismissible fade show`} role="alert">
                                        {message}
                                        <button 
                                            type="button" 
                                            className="btn-close" 
                                            onClick={() => setMessage('')}
                                        ></button>
                                    </div>
                                )}

                                {/* Login Form */}
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label fw-semibold">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter your email"
                                            required
                                            className="form-control form-control-lg"
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label fw-semibold">
                                            Password
                                        </label>
                                        <div className="input-group">
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
                                                className="btn btn-outline-secondary"
                                                disabled={isLoading}
                                            >
                                                {showPassword ? "🙈" : "👁️"}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mb-4">
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
                                                Remember me for 30 days
                                            </label>
                                        </div>
                                    </div>

                                    <button 
                                        type="submit" 
                                        className={`btn btn-primary btn-lg w-100 mb-3 ${isLoading ? 'disabled' : ''}`}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Signing in...
                                            </>
                                        ) : (
                                            "Sign In"
                                        )}
                                    </button>

                                    <div className="text-center">
                                        <div className="mb-2">
                                            <span className="text-muted">Don't have an account? </span>
                                            <button 
                                                type="button"
                                                className="btn btn-link p-0 text-decoration-none"
                                                onClick={() => !isLoading && navigate("/register")}
                                                disabled={isLoading}
                                            >
                                                Sign up
                                            </button>
                                        </div>
                                        <div>
                                            <span className="text-muted">Forgot your password? </span>
                                            <button 
                                                type="button"
                                                className="btn btn-link p-0 text-decoration-none"
                                                onClick={() => !isLoading && navigate("/request-password")}
                                                disabled={isLoading}
                                            >
                                                Reset it here
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Verification Modal */}
            {showVerificationPopup && (
                <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">Device Verification Required</h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={closeVerificationPopup}
                                    disabled={isLoading}
                                ></button>
                            </div>
                            <div className="modal-body text-center py-4">
                                <p className="text-muted mb-4">
                                    We've sent a 6-digit verification code to your email
                                </p>
                                
                                {/* Timer and Attempts */}
                                <div className="mb-4">
                                    <div className={`badge ${remainingTime === "Expired" ? 'bg-danger' : 'bg-warning'} fs-6 mb-2`}>
                                        {remainingTime === "Expired" ? "Code expired" : `Time left: ${remainingTime}`}
                                    </div>
                                    {remainingAttempts > 0 && remainingAttempts < 5 && (
                                        <div className="alert alert-warning py-2 mt-2" role="alert">
                                            <small>
                                                <i className="bi bi-exclamation-triangle me-1"></i>
                                                {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
                                            </small>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Code Input */}
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        value={verificationCode}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                            setVerificationCode(value);
                                            setVerificationError('');
                                        }}
                                        placeholder="Enter 6-digit code"
                                        maxLength="6"
                                        className={`form-control form-control-lg text-center fs-4 letter-spacing ${
                                            verificationError ? 'is-invalid' : ''
                                        }`}
                                        disabled={isLoading || shouldShowRequestNewCode}
                                        style={{letterSpacing: '0.5em'}}
                                    />
                                    {verificationError && (
                                        <div className="invalid-feedback d-block">
                                            {verificationError}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Resend Button */}
                                <div className="mb-4">
                                    <button 
                                        type="button"
                                        onClick={handleResendCode}
                                        disabled={isResending || (remainingTime !== "Expired" && remainingTime > "01:00")}
                                        className="btn btn-outline-primary btn-sm"
                                    >
                                        {isResending ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Sending...
                                            </>
                                        ) : (
                                            "Resend Code"
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="modal-footer border-0 justify-content-center">
                                {shouldShowRequestNewCode ? (
                                    <button 
                                        onClick={handleResendCode}
                                        className="btn btn-success me-2"
                                        disabled={isResending}
                                    >
                                        {isResending ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Sending...
                                            </>
                                        ) : (
                                            "Request New Code"
                                        )}
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handleVerificationSubmit}
                                        className="btn btn-primary me-2"
                                        disabled={!verificationCode || verificationCode.length !== 6 || isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
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