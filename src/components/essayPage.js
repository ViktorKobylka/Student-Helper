import { useState } from "react";
import axios from "axios";
import logotype from "../styles/images/logotype.jpg";

const EssayPage = () => {
  const [essayText, setEssayText] = useState("");
  const [gradeResult, setGradeResult] = useState("");

  const handleGrade = async () => {
    const wordCount = essayText.trim().split(/\s+/).length;

    if (wordCount < 100 || wordCount > 500) {
      setGradeResult("Essay must be between 100 and 500 words");
      return;
    }

    try {
      setGradeResult("Grading essay...");

      const res = await axios.post("http://localhost:5000/api/chat", {
        prompt: `Grade this essay from 0 to 100 and explain the grade: \n\n"${essayText}"`
      });

      setGradeResult(res.data);
    } catch (error) {
      console.error("Error grading essay:", error);
      setGradeResult("Error: Unable to grade essay.");
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
              <a href="/mainPage">Main Page</a>
              <a href="/settings">Settings</a>
            </nav>
          </header>
    
          <div className="main-content">
              <div className="input-card">
                <input
                  type="text"
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)} //update state when user types
                  placeholder="Write your essay here"
                />
                <button onClick={handleGrade}>Grade</button>
              </div>

              <div className="response-card">
                <p>{gradeResult}</p>
              </div>
          </div>
        </div>
      );
}

export default EssayPage;