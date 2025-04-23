import logotype from "../styles/images/logotype.jpg";

const EssayPage = () => {
    return (
        <div>
          <header className="main-header">
            <div className="logo-container">
              <img src={logotype} alt="logotype" />
              <strong>Student Helper</strong>
            </div>
            <nav className="nav-links">
              <a href="/saved">Saved Results</a>
              <a href="/mainPage">Main Page</a>
              <a href="/settings">Settings</a>
            </nav>
          </header>
    
          <div className="main-content">
            
          </div>
        </div>
      );
}

export default EssayPage;