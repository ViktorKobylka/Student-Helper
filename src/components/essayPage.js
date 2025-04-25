import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logotype from "../styles/images/logotype.jpg";

const EssayPage = () => {
  const [essayText, setEssayText] = useState("");
  const [error, setStatus] = useState("");
  const [loadingStatus, setLoadingStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (essayText.trim() === "") {
      setStatus("");
    }
  }, [essayText]);

  const handleGrade = async () => {
    const wordCount = essayText.trim().split(/\s+/).length;

    if (wordCount < 100 || wordCount > 500) {
      setStatus("Essay must be between 100 and 500 words");
      return;
    }

    try {
      setLoadingStatus("Grading essay...");

      const res = await axios.post("http://localhost:5000/api/chat", {
        prompt:`You are an essay grading AI. Grade the following essay from 0 to 100 based on: clarity and organization, argument depth and originality,
         grammar and style, relevance to topic. Return your result strictly in this format: Grade: a number between 0 and 100 \n Explanation: detailed reasoning for the grade.\n\n${essayText}`
      });
      const message = res.data;
      //console.log(message);

      const gradeMatch = message.match(/Grade:\s*"?(.*?)"?\s*(?:\n|$)/i);
      const explanationMatch = message.match(/Explanation:\s*([\s\S]*)/i);
      const grade = gradeMatch ? gradeMatch[1].trim() : "0";
      const explanation = explanationMatch ? explanationMatch[1].trim() : "No explanation provide.";
      const essayName = await suggestEssayName();
      
      navigate("/essayResult", {
        state: {
          essayName,
          grade,
          explanation
        }
      });
    } catch (error) {
      //console.error("Error grading essay:", error);
      setStatus("Error: Unable to grade essay.");
    }
  };

  const suggestEssayName =  async () => {
    const res = await axios.post("http://localhost:5000/api/chat", {
      prompt:`You are an essay grading AI. Create a title for essay using up to 5 words. Return your result strictly in this format: Name: your generated title\n\n${essayText}`
    });
    const message = res.data;
    console.log(message);
    const nameMatch = message.match(/Name:\s*"?(.*?)"?\s*(?:\n|$)/i);
    const essayName = nameMatch ? nameMatch[1].trim() : "Unnamed Essay";

    return essayName;
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
              <a href="/mainPage">Main Page</a>
              <a href="/settings">Settings</a>
            </nav>
          </header>
    
          <div className="main-content">
              <div className="input-card">
                <input
                  type="text"
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)} 
                  placeholder="Write your essay here"
                />
                <button onClick={handleGrade}>Grade</button>
                {loadingStatus && <p>{loadingStatus}</p>}
                <div className="error">
                  {error && <p style={{ color: "red" }}>{error}</p>}
                </div>
              </div>
          </div>
        </div>
      );
}

export default EssayPage;