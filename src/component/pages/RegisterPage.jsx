import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/AuthService";
import "../../style/Register.css";

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        email: "",
        name: "",
        phoneNumber: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState(null);
    const [passwordRequirements, setPasswordRequirements] = useState({
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === "password") {
            checkPasswordRequirements(value);
        }
    };

    const checkPasswordRequirements = (password) => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*]/.test(password);

        setPasswordRequirements({
            hasUpperCase,
            hasLowerCase,
            hasNumber,
            hasSpecialChar
        });
    };

    const validatePassword = (password) => {
        const strongPasswordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        return strongPasswordRegex.test(password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.name || !formData.phoneNumber || !formData.password) {
            setMessage("All fields are required to be filled");
            return;
        }

        if (!validatePassword(formData.password)) {
            setMessage(
                "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character."
            );
            return;
        }

        try {
            const response = await ApiService.registerUser({
                ...formData
            });

            if (response.status === 200) {
                setMessage("User Successfully Registered");
                setTimeout(() => {
                    navigate("/login");
                }, 4000);
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setMessage(error.response.data.message);
            } else {
                setMessage("Unable to register user");
            }
        }
    };

    const messageClassName = message?.includes("Successfully")
        ? "register-message register-message--success"
        : "register-message register-message--error";

    return (
        <div className="register-page">
            <div className="register-shell">
                <div className="register-card">
                    <div className="register-card__header">
                        <img src="/faveicon.png" alt="CuttyPaws paw" className="register-card__logo" />
                        <div>
                            <p className="register-card__eyebrow">Join CuttyPaws</p>
                            <h2>Create account</h2>
                        </div>
                    </div>

                    {message && <div className={messageClassName}>{message}</div>}

                    <form onSubmit={handleSubmit} className="register-form">
                        <div className="register-form-field">
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@example.com"
                                required
                            />
                        </div>

                        <div className="register-form-field">
                            <label htmlFor="name">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div className="register-form-field">
                            <label htmlFor="phoneNumber">Phone Number</label>
                            <input
                                id="phoneNumber"
                                type="text"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="Enter your phone number"
                                required
                            />
                        </div>

                        <div className="register-form-field">
                            <div className="register-form-field__label-row">
                                <label htmlFor="password">Password</label>
                            </div>
                            <div className="register-password-group">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create a strong password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="register-password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        <div className="register-requirements">
                            <p
                                className={
                                    passwordRequirements.hasUpperCase
                                        ? "register-requirements__item is-valid"
                                        : "register-requirements__item"
                                }
                            >
                                Uppercase letter
                            </p>
                            <p
                                className={
                                    passwordRequirements.hasLowerCase
                                        ? "register-requirements__item is-valid"
                                        : "register-requirements__item"
                                }
                            >
                                Lowercase letter
                            </p>
                            <p
                                className={
                                    passwordRequirements.hasNumber
                                        ? "register-requirements__item is-valid"
                                        : "register-requirements__item"
                                }
                            >
                                Number
                            </p>
                            <p
                                className={
                                    passwordRequirements.hasSpecialChar
                                        ? "register-requirements__item is-valid"
                                        : "register-requirements__item"
                                }
                            >
                                Special character
                            </p>
                        </div>

                        <button type="submit" className="register-submit-button">
                            Create account
                        </button>

                        <div className="register-footer">
                            <p>Already have an account?</p>
                            <button
                                type="button"
                                className="register-inline-link"
                                onClick={() => navigate("/login")}
                            >
                                Sign in
                            </button>
                        </div>

                        <div className="register-footer register-footer--secondary">
                            <p>Registering a business or pet service instead?</p>
                            <button
                                type="button"
                                className="register-inline-link"
                                onClick={() => navigate("/register/services")}
                            >
                                Choose seller or service registration
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
