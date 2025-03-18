import logotype from '../styles/images/logotype.jpg';
import Popup from 'reactjs-popup';

//LandingPage component: represents the landing page of the "Student Helper" website
const LandingPage = ()=>{
    return(
        <div className="landingPage-cont">
            <img src={logotype} alt="logotype" />
            <h1>Welcome to Student Helper</h1>
            <div className="logInPopUp">
                <Popup trigger={<button> Log In </button>} modal>
                    {
                        close => (
                            <div className="modal">
                                <div>
                                    some text
                                </div>
                                <div>
                                    <button onClick=
                                        {() => close()}>
                                            Close
                                    </button>
                                </div>
                            </div>
                        )
                    }
                </Popup>
            </div>
            <button>Register</button>
        </div>
    );
}

export default LandingPage;