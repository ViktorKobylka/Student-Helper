import { useState } from "react"; 
import axios from "axios"; 
import logotype from "../styles/images/logotype.jpg"; 
import "../styles/MainPage.css"; 

const MainPage = () => {
  //state variables for user input and response
  const [input, setInput] = useState(""); 
  const [response, setResponse] = useState(""); 

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
        <img src={logotype} alt="logotype" />
        <strong>Student Helper</strong> 
      </header>

      <div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)} //update state when user types
          placeholder="Write something"
        />
        <button onClick={handleSubmit}>Send</button> 
        <p>Response: {response}</p> 
      </div>
    </div>
  );
};

export default MainPage; 
