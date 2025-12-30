// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   FaUserPlus, FaBuilding, FaUserTie, FaPhone, FaEnvelope, 
//   FaLock, FaCity, FaIdCard, FaSignature, FaKey 
// } from 'react-icons/fa';
// import { 
//   Container, Row, Col, Form, Button, Alert, Card, 
//   InputGroup, FormControl 
// } from 'react-bootstrap';
// import ApiService from '../../service/ApiService';

// const CompanyRegister = () => {
//   const [formData, setFormData] = useState({
//     companyName: '',
//     name: '',
//     phoneNumber: '',
//     email: '',
//     password: '',
//   });
//   const [message, setMessage] = useState('');
//   const navigate = useNavigate();

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prevData) => ({ ...prevData, [name]: value }));
//   };

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     try {
//       await ApiService.registerCompany({
//         ...formData,
//         role: 'ROLE_COMPANY',
//       });
//       setMessage('Registration successful! Redirecting to login...');
//       setTimeout(() => navigate('/login'), 2000);
//     } catch (error) {
//       setMessage(error.response?.data?.message || 'Registration failed. Please try again.');
//     }
//   };

//   return (
//     <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
//       <Row className="justify-content-center w-100">
//         <Col md={8} lg={6} xl={5}>
//           <Card className="shadow-lg rounded-4 border-0">
//             <Card.Body className="p-5">
//               <div className="text-center mb-5">
//                 <div className="bg-primary rounded-circle d-inline-flex p-4 mb-3">
//                   <FaUserPlus className="text-white display-5" />
//                 </div>
//                 <h2 className="h1 mb-2 fw-bold text-primary">Seller Registration</h2>
//                 <p className="text-muted">Join Africa's fastest-growing marketplace</p>
//               </div>

//               {message && (
//                 <Alert variant={message.includes('success') ? 'success' : 'danger'} className="text-center">
//                   {message}
//                 </Alert>
//               )}

//               <Form onSubmit={handleSignup}>
//                 <Form.Group className="mb-4">
//                   <Form.Label className="text-muted small mb-2">Company Name</Form.Label>
//                   <InputGroup>
//                     <InputGroup.Text className="bg-light border-end-0">
//                       <FaBuilding className="text-primary" />
//                     </InputGroup.Text>
//                     <FormControl
//                       type="text"
//                       name="companyName"
//                       value={formData.companyName}
//                       onChange={handleInputChange}
//                       placeholder="Enter company name"
//                       required
//                       className="border-start-0"
//                     />
//                     <InputGroup.Text className="bg-light border-start-0">
//                       <FaCity className="text-muted" />
//                     </InputGroup.Text>
//                   </InputGroup>
//                 </Form.Group>

//                 <Form.Group className="mb-4">
//                   <Form.Label className="text-muted small mb-2">Owner's Name</Form.Label>
//                   <InputGroup>
//                     <InputGroup.Text className="bg-light">
//                       <FaUserTie className="text-primary" />
//                     </InputGroup.Text>
//                     <FormControl
//                       type="text"
//                       name="name"
//                       value={formData.name}
//                       onChange={handleInputChange}
//                       placeholder="Full legal name"
//                       required
//                     />
//                     <InputGroup.Text className="bg-light">
//                       <FaSignature className="text-muted" />
//                     </InputGroup.Text>
//                   </InputGroup>
//                 </Form.Group>

//                 <Form.Group className="mb-4">
//                   <Form.Label className="text-muted small mb-2">Contact Information</Form.Label>
//                   <InputGroup>
//                     <InputGroup.Text className="bg-light">
//                       <FaPhone className="text-primary" />
//                     </InputGroup.Text>
//                     <FormControl
//                       type="tel"
//                       name="phoneNumber"
//                       value={formData.phoneNumber}
//                       onChange={handleInputChange}
//                       placeholder="Phone number"
//                       required
//                     />
//                     <InputGroup.Text className="bg-light">
//                       <FaEnvelope className="text-primary" />
//                     </InputGroup.Text>
//                     <FormControl
//                       type="email"
//                       name="email"
//                       value={formData.email}
//                       onChange={handleInputChange}
//                       placeholder="Business email"
//                       required
//                     />
//                   </InputGroup>
//                 </Form.Group>

//                 <Form.Group className="mb-4">
//                   <Form.Label className="text-muted small mb-2">Security</Form.Label>
//                   <InputGroup>
//                     <InputGroup.Text className="bg-light">
//                       <FaLock className="text-primary" />
//                     </InputGroup.Text>
//                     <FormControl
//                       type="password"
//                       name="password"
//                       value={formData.password}
//                       onChange={handleInputChange}
//                       placeholder="Create strong password"
//                       required
//                     />
//                     <InputGroup.Text className="bg-light">
//                       <FaKey className="text-muted" />
//                     </InputGroup.Text>
//                   </InputGroup>
//                 </Form.Group>

//                 <Button 
//                   variant="primary" 
//                   type="submit" 
//                   className="w-100 rounded-pill py-3 fw-bold"
//                 >
//                   Create Seller Account <FaUserPlus className="ms-2" />
//                 </Button>

//                 <div className="text-center mt-4 text-muted">
//                   Already have an account?{' '}
//                   <Button 
//                     variant="link" 
//                     className="p-0 text-decoration-none"
//                     onClick={() => navigate('/login')}
//                   >
//                     Login here
//                   </Button>
//                 </div>
//               </Form>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default CompanyRegister;






import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUserPlus, FaBuilding, FaUserTie, FaPhone, FaEnvelope, 
  FaLock, FaCity, FaIdCard, FaSignature, FaKey, FaEye, FaEyeSlash 
} from 'react-icons/fa';
import { 
  Container, Row, Col, Form, Button, Alert, Card, 
  InputGroup, FormControl 
} from 'react-bootstrap';
import ApiService from '../../service/ApiService';

const CompanyRegister = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    name: '',
    phoneNumber: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility
  const [passwordRequirements, setPasswordRequirements] = useState({
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));

    if (name === 'password') {
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

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!formData.companyName || !formData.name || !formData.phoneNumber || !formData.email || !formData.password) {
      setMessage('All fields are required to be filled.');
      return;
    }

    if (!validatePassword(formData.password)) {
      setMessage('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
      return;
    }

    try {
      await ApiService.registerCompany({
        ...formData,
        role: 'ROLE_COMPANY',
      });
      setMessage('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <Row className="justify-content-center w-100">
        <Col md={8} lg={6} xl={5}>
          <Card className="shadow-lg rounded-4 border-0">
            <Card.Body className="p-5">
              <div className="text-center mb-5">
                <div className="bg-primary rounded-circle d-inline-flex p-4 mb-3">
                  <FaUserPlus className="text-white display-5" />
                </div>
                <h2 className="h1 mb-2 fw-bold text-primary">Seller Registration</h2>
                <p className="text-muted">Join Africa's fastest-growing marketplace</p>
              </div>

              {message && (
                <Alert variant={message.includes('success') ? 'success' : 'danger'} className="text-center">
                  {message}
                </Alert>
              )}

              <Form onSubmit={handleSignup}>
                <Form.Group className="mb-4">
                  <Form.Label className="text-muted small mb-2">Company Name</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light border-end-0">
                      <FaBuilding className="text-primary" />
                    </InputGroup.Text>
                    <FormControl
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="Enter company name"
                      required
                      className="border-start-0"
                    />
                    <InputGroup.Text className="bg-light border-start-0">
                      <FaCity className="text-muted" />
                    </InputGroup.Text>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="text-muted small mb-2">Owner's Name</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light">
                      <FaUserTie className="text-primary" />
                    </InputGroup.Text>
                    <FormControl
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Full legal name"
                      required
                    />
                    <InputGroup.Text className="bg-light">
                      <FaSignature className="text-muted" />
                    </InputGroup.Text>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="text-muted small mb-2">Contact Information</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light">
                      <FaPhone className="text-primary" />
                    </InputGroup.Text>
                    <FormControl
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Phone number"
                      required
                    />
                    <InputGroup.Text className="bg-light">
                      <FaEnvelope className="text-primary" />
                    </InputGroup.Text>
                    <FormControl
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Business email"
                      required
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="text-muted small mb-2">Security</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light">
                      <FaLock className="text-primary" />
                    </InputGroup.Text>
                    <FormControl
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create strong password"
                      required
                    />
                    <InputGroup.Text 
                      className="bg-light cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </InputGroup.Text>
                  </InputGroup>
                  <div className="mt-2">
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
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 rounded-pill py-3 fw-bold"
                >
                  Create Seller Account <FaUserPlus className="ms-2" />
                </Button>

                <div className="text-center mt-4 text-muted">
                  Already have an account?{' '}
                  <Button 
                    variant="link" 
                    className="p-0 text-decoration-none"
                    onClick={() => navigate('/login')}
                  >
                    Login here
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CompanyRegister;