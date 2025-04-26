import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logotype from '../styles/images/logotype.jpg';
import person from '../styles/images/person_landing_page.jpg';
import Popup from 'reactjs-popup';
import '../styles/LandingPage.css';

//LandingPage component: represents the landing page of the "Student Helper" website
const LandingPage = ()=>{
    // State variables for registration form inputs
    const [registerUsername, setRegisterUsername] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');

    // State variables for login form inputs
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const navigate = useNavigate(); // Initialize navigate function for redirection

    // Function to handle user registration
    const handleRegister = (e, close) => {
        e.preventDefault(); // Prevent page reload on form submission
        const registerData = { 
            username: registerUsername, 
            email: registerEmail, 
            password: registerPassword 
        };
        // Send POST request to server with registration data
        axios.post('http://localhost:4000/api/registerData', registerData);
        // Clear registration input fields
        setRegisterUsername('');
        setRegisterEmail('');
        setRegisterPassword('');
        close(); // Close the popup modal
    }

    // Function to handle user login
    const handleLogin = (e) => {
        e.preventDefault(); // Prevent page reload on form submission
        const loginData = { 
            email: loginEmail, 
            password: loginPassword 
        };
        // Send POST request to server with login data
        axios.post('http://localhost:4000/api/loginData', loginData)
            .then(response => {
                console.log("Login Successful:", response); // Log successful login
                localStorage.setItem("userEmail", loginEmail); // Save user's email to localStorage

                // After login, fetch username by email
                axios.get(`http://localhost:4000/api/getUser?email=${loginEmail}`)
                    .then(res => {
                        const username = res.data.username;
                        localStorage.setItem("cachedUsername", username); // Save username to localStorage
                        navigate('/mainPage'); // Navigate to main page
                    })
                    .catch(error => {
                        console.error("Error fetching username:", error); // Log error if fetching username fails
                    });
            })
            .catch(error => {
                console.error("Login Error:", error); // Log login error
                setLoginEmail(''); // Clear email field
                setLoginPassword(''); // Clear password field
            });
    }

    return(
        <div className="landingPage-cont">
            <header>
                <img src={logotype} alt="logotype" />
                <strong>Student Helper</strong>
            </header>
            <div className="container">
                <div className="image-section">
                    <img src={person} alt="person" className="full-image" />
                </div>
                <div className="card">
                    <h1>Welcome back!</h1>
                    <Popup trigger={<div><button>Log In</button></div>} modal>
                        {close => (
                            <div className="modal">
                                <button className="close-btn" onClick={() => close()}>X</button>
                                <h2>Log In</h2>
                                <div>
                                    <label>Email:</label>
                                    <input type="email" placeholder="Enter your email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                                </div>
                                <div>
                                    <label>Password:</label>
                                    <input type="password" placeholder="Enter your password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                                </div>
                                <div>
                                    <button className="login-btn" onClick={handleLogin}>Log in</button>
                                </div>
                            </div>
                        )}
                    </Popup>
                    <Popup trigger={<div><button>Register</button></div>} modal>
                        {close => (
                            <div className="modal">
                                <button className="close-btn" onClick={() => close()}>X</button>
                                <h2>Register</h2>
                                <div>
                                    <label>Username:</label>
                                    <input type="text" placeholder="Enter your username" value={registerUsername} onChange={(e) => setRegisterUsername(e.target.value)}/>
                                </div>
                                <div>
                                    <label>Email:</label>
                                    <input type="email" placeholder="Enter your email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} />
                                </div>
                                <div>
                                    <label>Password:</label>
                                    <input type="password" placeholder="Enter your password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} />
                                </div>
                                <div>
                                    <button className="login-btn" onClick={(e) => handleRegister(e, close)}>Register</button>
                                </div>
                            </div>
                        )}
                    </Popup>
                </div>
            </div>
        </div>
    );
}

export default LandingPage;