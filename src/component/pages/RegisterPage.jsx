import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/AuthService";
import '../../style/Register.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        phoneNumber: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState(null);
    const [passwordRequirements, setPasswordRequirements] = useState({
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false,
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
            hasSpecialChar,
        });
    };

    const validatePassword = (password) => {
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        return strongPasswordRegex.test(password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.name || !formData.phoneNumber || !formData.password) {
            setMessage("All fields are required to be filled");
            return;
        }

        if (!validatePassword(formData.password)) {
            setMessage("Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
            return;
        }

        try {
            const response = await ApiService.registerUser({
                ...formData,
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

    return (
        <div className="user-register-page">
            <h2>Register</h2>
            {message && <p className="message">{message}</p>}
            <form onSubmit={handleSubmit}>
                <label>Email:</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                
                <label>Full Name:</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                
                <label>Phone Number:</label>
                <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
                
                <label>Password:</label>
                <div className="password-input">
                    <input 
                        type={showPassword ? "text" : "password"}
                        name="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        required 
                    />
                    <span
                        className="toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? "🙈" : "👁️"}
                    </span>
                </div>

                <div className="password-requirements">
                    <p style={{ color: passwordRequirements.hasUpperCase ? 'green' : 'red' }}>
                        Uppercase Letter
                    </p>
                    <p style={{ color: passwordRequirements.hasLowerCase ? 'green' : 'red' }}>
                        Lowercase Letter
                    </p>
                    <p style={{ color: passwordRequirements.hasNumber ? 'green' : 'red' }}>
                        Number
                    </p>
                    <p style={{ color: passwordRequirements.hasSpecialChar ? 'green' : 'red' }}>
                        Special Character
                    </p>
                </div>

                <button type="submit">Register</button>

                <p className="login-link">
                    Already have an account? <a href="/login">Login</a>
                </p>
            </form>
        </div>
    );
}

export default RegisterPage;