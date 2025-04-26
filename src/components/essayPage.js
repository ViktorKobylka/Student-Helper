import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logotype from "../styles/images/logotype.jpg";
import "../styles/EssayPage.css";

const EssayPage = () => {
  const [essayText, setEssayText] = useState("");
  const [error, setStatus] = useState("");
  const [loadingStatus, setLoadingStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Reset the error message if the essay text is cleared
    if (essayText.trim() === "") {
      setStatus("");
    }
  }, [essayText]); // Runs every time essayText changes

  const handleGrade = async () => {
    // Calculate number of words
    const wordCount = essayText.trim().split(/\s+/).length;

    // If essay is too short or too long, show an error
    if (wordCount < 100 || wordCount > 500) {
      setStatus("Essay must be between 100 and 500 words");
      return;
    }

    try {
      setLoadingStatus("Grading essay..."); // Show grading in progress

      // Send request to the server to grade the essay
      const res = await axios.post("http://localhost:5000/api/chat", {
        prompt:`You are an essay grading AI. Grade the following essay from 0 to 100 based on: clarity and organization, argument depth and originality,
         grammar and style, relevance to topic. Return your result strictly in this format: Grade: a number between 0 and 100 \n Explanation: detailed reasoning for the grade.\n\n${essayText}`
      });

      const message = res.data; // Response from the server

      // Extract grade using regular expression
      const gradeMatch = message.match(/Grade:\s*"?(.*?)"?\s*(?:\n|$)/i);
      // Extract explanation using regular expression
      const explanationMatch = message.match(/Explanation:\s*([\s\S]*)/i);

      // Set grade and explanation from matches or fallback values
      const grade = gradeMatch ? gradeMatch[1].trim() : "0";
      const explanation = explanationMatch ? explanationMatch[1].trim() : "No explanation provide.";

      // Suggest a title for the essay
      const essayName = await suggestEssayName();
      
      // Navigate to the essay result page and pass the data
      navigate("/essayResult", {
        state: {
          essayName,
          grade,
          explanation
        }
      });
    } catch (error) {
      // If grading failed, set error status
      setStatus("Error: Unable to grade essay.");
    }
  };

  // Function to suggest a name for the essay
  const suggestEssayName = async () => {
    // Send request to get a title suggestion
    const res = await axios.post("http://localhost:5000/api/chat", {
      prompt:`You are an essay grading AI. Create a title for essay using up to 5 words. Return your result strictly in this format: Name: your generated title\n\n${essayText}`
    });

    const message = res.data; // Response from server

    // Extract suggested name using regular expression
    const nameMatch = message.match(/Name:\s*"?(.*?)"?\s*(?:\n|$)/i);
    // Set essayName from match or fallback
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
              <a href="/mainPage">Main Page</a>
              <a href="/saved">Saved Results</a>
              <a href="/study">Study terms</a>
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