import { useState } from "react";
import axios from "axios";
import logotype from "../styles/images/logotype.jpg";

const StudyPage = () => {
  const [termText, setTermText] = useState("");
  const [definition, setDefinition] = useState("");

  const handleSubmit = async () => {
    if (termText.trim().length === 0) return;
    setDefinition("Loading...");
    try {
      const res = await axios.post("http://localhost:5000/api/chat", {
        prompt: `Provide clear and short definition for the following term:\n\n${termText}`
      });

      setDefinition(res.data);
    } catch (error) {
      console.error("Error generating definition:", error);
      setDefinition("Error: Unable to fetch response.");
    }
  };

  return (
    <div>
      <header className="main-header">
        <div className="logo-container">
          <img src={logotype} alt="logotype" />
          <strong>Student Helper</strong>
        </div>
        <nav className="nav-links">
          <a href="/saved">Saved Results</a>
          <a href="/essay">Essay Checker</a>
          <a href="/settings">Settings</a>
        </nav>
      </header>

      <div className="main-content">
        <div className="input-card">
          <input
            type="text"
            value={termText}
            onChange={(e) => setTermText(e.target.value)}
            placeholder="Write a term"
          />
          <button onClick={handleSubmit}>Send</button>
        </div>

        {definition && (
          <div className="response-card">
            <p><strong>Definition:</strong> {definition}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyPage;
