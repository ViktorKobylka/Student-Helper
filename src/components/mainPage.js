import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import logotype from "../styles/images/logotype.jpg";
import "../styles/MainPage.css";

const MainPage = () => {
  //state variables for user input and response
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [username, setUsername] = useState("");
  const [, setSavedResponses] = useState([]);
  const [email, setEmail] = useState(null);

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail"); 
    setEmail(storedEmail);
  }, []);

  const processSaveQueue = useCallback(async () => {
    const pending = JSON.parse(localStorage.getItem("pendingResponseSaves") || "[]");
    if (pending.length === 0) return;

    const successfullySaved = [];

    for (const item of pending) {
      try {
        await axios.post("http://localhost:4000/api/saveResponse", item);
        successfullySaved.push(item);
        console.log("Saved:", item.response.substring(0, 20) + "...");
      } catch (error) {
        console.log("Failed to save:", item.response.substring(0, 20) + "...");
      }
    }

    const stillPending = pending.filter(
      pendingItem => !successfullySaved.some(saved => 
        saved.userEmail === pendingItem.userEmail && 
        saved.response === pendingItem.response
      )
    );

    localStorage.setItem("pendingResponseSaves", JSON.stringify(stillPending));
  }, []);

  const fetchUsername = useCallback(() => {
    const cachedUsername = localStorage.getItem("cachedUsername");
    if (cachedUsername) {
      setUsername(cachedUsername);
    }
  }, []);
  
  const loadSavedResponses = useCallback(async () => {
    if (!email) return;
    
    const localData = localStorage.getItem("offlineResponses");
    let localResponses = localData ? JSON.parse(localData) : [];
  
    const pending = JSON.parse(localStorage.getItem("pendingResponseSaves") || "[]");
    const userPending = pending.filter(item => item.userEmail === email);
    
    const pendingItems = userPending.map((item, index) => ({
      _id: `pending-${index}-${Date.now()}`, 
      userEmail: item.userEmail,
      response: item.response
    }));
  
    const combinedResponses = [...localResponses];
    
    for (const pendingItem of pendingItems) {
      const isDuplicate = combinedResponses.some(
        item => item.response === pendingItem.response && 
              item.userEmail === pendingItem.userEmail
      );
      
      if (!isDuplicate) {
        combinedResponses.push(pendingItem);
      }
    }
    
    setSavedResponses(combinedResponses);
  
    if (navigator.onLine) {
      await processSaveQueue();
      
      try {
        const res = await axios.get(`http://localhost:4000/api/savedResponses?email=${email}`);
       
        const updatedPending = JSON.parse(localStorage.getItem("pendingResponseSaves") || "[]");
        const updatedUserPending = updatedPending.filter(item => item.userEmail === email);
        
        if (updatedUserPending.length > 0) {
          const updatedPendingItems = updatedUserPending.map((item, index) => ({
            _id: `pending-${index}-${Date.now()}`,
            userEmail: item.userEmail,
            response: item.response
          }));
          
          const updatedCombined = [...res.data];
          
          for (const pendingItem of updatedPendingItems) {
            const isDuplicate = updatedCombined.some(
              item => item.response === pendingItem.response && 
                    item.userEmail === pendingItem.userEmail
            );
            
            if (!isDuplicate) {
              updatedCombined.push(pendingItem);
            }
          }
          
          setSavedResponses(updatedCombined);
          localStorage.setItem("offlineResponses", JSON.stringify(res.data)); 
        } else {
          setSavedResponses(res.data);
          localStorage.setItem("offlineResponses", JSON.stringify(res.data));
        }
      } catch (error) {
        console.log("Using cached responses due to fetch error:", error.message);
      }
    } else {
      console.log("Offline mode: using only cached responses");
    }
  }, [email, processSaveQueue]);

  useEffect(() => {
    fetchUsername();
    if (email) {
      loadSavedResponses(); 
    }
  }, [email, fetchUsername, loadSavedResponses]);

  useEffect(() => {
    const handleOnline = async () => {
      if (!email) return;
      await processSaveQueue();
      await loadSavedResponses(); 
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [email, processSaveQueue, loadSavedResponses]);

  const handleSubmit = async () => {
    if (input.trim().length === 0) return;
    setResponse("Loading..."); //show loading message while waiting for a response
    try {
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
  
  const handleSave = async () => {
    if (!response || response === "Loading..." || response.startsWith("Error")) return;
    if (!email) {
      console.error("Cannot save: no email available");
      return;
    }

    const responseToSave = response;

    const newItem = {
      userEmail: email,
      response: responseToSave,
    };

 
    setInput("");
    setResponse("");

   
    const pending = JSON.parse(localStorage.getItem("pendingResponseSaves") || "[]");
    
    
    const isDuplicateInQueue = pending.some(
      item => item.userEmail === newItem.userEmail && 
              item.response === newItem.response
    );
    
    if (!isDuplicateInQueue) {
    
      pending.push(newItem);
      localStorage.setItem("pendingResponseSaves", JSON.stringify(pending));
    }
    
  
    const tempId = `pending-${pending.length - 1}-${Date.now()}`;
    const newItemWithId = { 
      _id: tempId, 
      userEmail: newItem.userEmail,
      response: newItem.response 
    };
    
  
    setSavedResponses(prev => {
      
      const isDuplicate = prev.some(
        item => item.response === newItemWithId.response && 
                item.userEmail === newItemWithId.userEmail
      );
      
      if (isDuplicate) {
        return prev;
      } else {
        return [...prev, newItemWithId];
      }
    });
    
    if (!navigator.onLine) {
      console.log("Offline: item queued for later save");
      return;
    }

    try {
      
      await axios.post("http://localhost:4000/api/saveResponse", newItem);
      
     
      const res = await axios.get(`http://localhost:4000/api/savedResponses?email=${email}`);
      
      localStorage.setItem("offlineResponses", JSON.stringify(res.data));
      
      const updatedPending = pending.filter(item => 
        !(item.userEmail === newItem.userEmail && item.response === newItem.response)
      );
      localStorage.setItem("pendingResponseSaves", JSON.stringify(updatedPending));
      
      await loadSavedResponses();
    } catch (error) {
      console.log("Server unavailable, item queued for saving later");
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
          <a href="/study">Study terms</a>
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

        {response && (
          <div className="response-card">
            <p>Response: {response}</p>
            <button onClick={handleSave}>Save Response</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;