import { useLocation, useNavigate } from "react-router-dom";
import logotype from "../styles/images/logotype.jpg";
import "../styles/MainPage.css";

const EssayResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { essayName, grade, explanation } = location.state || {};

  return (
    <div>
      <header className="main-header">
        <div className="logo-container">
          <img src={logotype} alt="logotype" />
          <strong>Student Helper</strong>
        </div>
        <nav className="nav-links">
          <a href="/mainPage">Main Page</a>
          <a href="/saved">Saved Results</a>
          <a href="/study">Study terms</a>
        </nav>
      </header>

      <div className="main-content">
        <h2>Essay Result</h2>

        <div className="response-card">
          <p><strong>Essay:</strong> {essayName}</p>
          <p><strong>Grade:</strong> {grade}</p>
          <p><strong>Explanation:</strong> {explanation}</p>
        </div>

        <button onClick={() => navigate("/essay")}>Check Another Essay</button>
      </div>
    </div>
  );
};

export default EssayResultPage;
