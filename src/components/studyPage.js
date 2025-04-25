import { useEffect, useState } from "react";
import axios from "axios";
import logotype from "../styles/images/logotype.jpg";

const StudyPage = () => {
  const [termText, setTermText] = useState("");
  const [definition, setDefinition] = useState("");
  const [savedTerms, setSavedTerms] = useState([]);
  const email = localStorage.getItem("userEmail");

  useEffect(() => {
    const fetchSaved = async () => {
      const res = await axios.get(`http://localhost:4000/api/savedTerms?email=${email}`);
      setSavedTerms(res.data);
    };
    fetchSaved();
  }, [email]);

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

  const handleSave = async () => {

    if (definition === "Loading..." || definition === "Error: Unable to fetch response.") return;

    try {
      await axios.post("http://localhost:4000/api/saveTerm", {
        userEmail: email,
        term: termText,
        definition
      });
      
      const res = await axios.get(`http://localhost:4000/api/savedTerms?email=${email}`);
      setSavedTerms(res.data);
    } catch (error) {
      console.error("Error saving term:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/api/deleteTerm/${id}`);
      setSavedTerms(savedTerms.filter(term => term._id !== id));
    } catch (error) {
      console.error("Error deleting term:", error);
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
            <button onClick={handleSave}>Save Term</button>
          </div>
        )}

        <h3>Saved Terms</h3>
        {savedTerms.map(term => (
          <div key={term._id} className="response-card">
            <p>{term.term}: {term.definition}</p>
            <button onClick={() => handleDelete(term._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyPage;
