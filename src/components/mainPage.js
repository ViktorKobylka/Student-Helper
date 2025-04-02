import { useEffect, useState } from "react";  
import axios from "axios"; 
import logotype from "../styles/images/logotype.jpg"; 
import "../styles/MainPage.css"; 

const MainPage = () => {
  //state variables for user input and response
  const [input, setInput] = useState(""); 
  const [response, setResponse] = useState("");
  const [username, setUsername] = useState(""); 

  //get username
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const email = localStorage.getItem("userEmail"); //get stored email
        const res = await axios.get(`http://localhost:4000/api/getUser?email=${email}`);
        setUsername(res.data.username); //update state
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };

    fetchUsername(); //trigger the function
  }, []); 

  //send user input to the backend and get a response
  const handleSubmit = async () => {
    try {
      setResponse("Loading..."); //show loading message while waiting for a response

      //send POST request to server
      const res = await axios.post("http://localhost:5000/api/chat", {
        prompt: input, //sending user input as "prompt"
      });

      setResponse(res.data); //update state with the received response
    } catch (error) {
      console.error("Error fetching response:", error);
      setResponse("Error: Unable to fetch response."); //show error message
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
          <a href="/schedule">Schedule</a>
          <a href="/settings">Settings</a>
        </nav>
      </header>

      <div className="main-content">
        <div className="greeting">
          {username && <h2>Welcome, {username}!</h2>} {/*show if username exists*/}
        </div>

        <div className="input-card">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)} //update state when user types
            placeholder="Write something"
          />
          <button onClick={handleSubmit}>Send</button> 
        </div>

        <div className="response-card">
          <p>Response: {response}</p> 
          <button>Save Response</button>
        </div>
      </div>
    </div>
  );
};

export default MainPage;

