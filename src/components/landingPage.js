import logotype from '../styles/images/logotype.jpg';
import person from '../styles/images/person_landing_page.jpg';
import Popup from 'reactjs-popup';
import '../styles/LandingPage.css'

//LandingPage component: represents the landing page of the "Student Helper" website
const LandingPage = ()=>{
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
                                    <input type="email" placeholder="Enter your email" />
                                </div>
                                <div>
                                    <label>Password:</label>
                                    <input type="password" placeholder="Enter your password" />
                                </div>
                                <div>
                                    <button className="login-btn">Log in</button>
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
                                    <input type="text" placeholder="Enter your username" />
                                </div>
                                <div>
                                    <label>Email:</label>
                                    <input type="email" placeholder="Enter your email" />
                                </div>
                                <div>
                                    <label>Password:</label>
                                    <input type="password" placeholder="Enter your password" />
                                </div>
                                <div>
                                    <button className="login-btn">Register</button>
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