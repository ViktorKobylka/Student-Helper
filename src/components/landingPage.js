import logotype from '../styles/images/logotype.jpg';

//LandingPage component: represents the landing page of the "Student Helper" website
const LandingPage = ()=>{
    return(
        <div className="landingPage-cont">
            <img src={logotype} alt="logotype" />
            <h1>Welcome to Student Helper</h1>
            <button>Log In</button>
            <button>Register</button>
        </div>
    );
}

export default LandingPage;