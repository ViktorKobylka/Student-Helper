import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import logotype from "../styles/images/logotype.jpg";
import "../styles/MainPage.css";

const MainPage = () => {
  // States for user input, AI response, username, and email
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [username, setUsername] = useState("");
  const [, setSavedResponses] = useState([]);
  const [email, setEmail] = useState(null);

  // Fetch email from localStorage when component mounts
  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    setEmail(storedEmail);
  }, []);

  // Get username from localStorage (cached at login)
  const fetchUsername = useCallback(() => {
    const cachedUsername = localStorage.getItem("cachedUsername");
    if (cachedUsername) {
      setUsername(cachedUsername);
    }
  }, []);

  // Save offline responses that were pending
  const processSaveQueue = useCallback(async () => {
    const pending = JSON.parse(localStorage.getItem("pendingResponseSaves") || "[]");
    if (pending.length === 0) return; // No pending saves

    const successfullySaved = [];

    for (const item of pending) {
      try {
        await axios.post("http://localhost:4000/api/saveResponse", item);
        successfullySaved.push(item); // If save is successful, add to list
      } catch (error) {
        console.log("Failed to save:", item.response.substring(0, 20) + "...");
      }
    }

    // Remove successfully saved items from pending queue
    const stillPending = pending.filter(
      pendingItem => !successfullySaved.some(saved =>
        saved.userEmail === pendingItem.userEmail &&
        saved.response === pendingItem.response
      )
    );

    localStorage.setItem("pendingResponseSaves", JSON.stringify(stillPending));
  }, []);

  // Load previously saved responses and handle offline cases
  const loadSavedResponses = useCallback(async () => {
    if (!email) return; // If no email, skip

    const localData = localStorage.getItem("offlineResponses");
    let localResponses = localData ? JSON.parse(localData) : [];

    const pending = JSON.parse(localStorage.getItem("pendingResponseSaves") || "[]");
    const userPending = pending.filter(item => item.userEmail === email);

    const pendingItems = userPending.map((item, index) => ({
      _id: `pending-${index}-${Date.now()}`,
      userEmail: item.userEmail,
      response: item.response
    }));

    // Merge pending saves into local responses
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
      // If online, try syncing with server
      await processSaveQueue();
      try {
        const res = await axios.get(`http://localhost:4000/api/savedResponses?email=${email}`);
        localStorage.setItem("offlineResponses", JSON.stringify(res.data));
        setSavedResponses(res.data);
      } catch (error) {
        console.log("Using cached responses due to fetch error:", error.message);
      }
    } else {
      console.log("Offline mode: using cached responses only");
    }
  }, [email, processSaveQueue]);

  // Fetch user data when component mounts
  useEffect(() => {
    fetchUsername();
    if (email) {
      loadSavedResponses();
    }
  }, [email, fetchUsername, loadSavedResponses]);

  // Handle coming back online to re-sync data
  useEffect(() => {
    const handleOnline = async () => {
      if (!email) return;
      await processSaveQueue();
      await loadSavedResponses();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [email, processSaveQueue, loadSavedResponses]);

  // Send user input to AI service
  const handleSubmit = async () => {
    if (input.trim().length === 0) return; // Do nothing if input is empty
    setResponse("Loading..."); // Show loading indicator
    try {
      const res = await axios.post("http://localhost:5000/api/chat", {
        prompt: input,
      });
      setResponse(res.data); // Set AI response
    } catch (error) {
      console.error("Error fetching response:", error);
      setResponse("Error: Unable to fetch response."); // Handle error
    }
  };

  // Save AI response to server or offline queue
  const handleSave = async () => {
    if (!response || response === "Loading..." || response.startsWith("Error")) return;
    if (!email) return;

    const newItem = {
      userEmail: email,
      response: response,
    };

    setInput(""); // Clear input field
    setResponse(""); // Clear displayed response

    const pending = JSON.parse(localStorage.getItem("pendingResponseSaves") || "[]");

    const isDuplicateInQueue = pending.some(
      item => item.userEmail === newItem.userEmail && item.response === newItem.response
    );

    if (!isDuplicateInQueue) {
      pending.push(newItem); // Add to offline queue if not already pending
      localStorage.setItem("pendingResponseSaves", JSON.stringify(pending));
    }

    const tempId = `pending-${pending.length - 1}-${Date.now()}`;
    const newItemWithId = { _id: tempId, ...newItem };

    setSavedResponses(prev => {
      const isDuplicate = prev.some(
        item => item.response === newItemWithId.response && item.userEmail === newItemWithId.userEmail
      );
      return isDuplicate ? prev : [...prev, newItemWithId];
    });

    if (!navigator.onLine) {
      console.log("Offline: queued for save");
      return; // If offline, don't attempt to send to server
    }

    try {
      await axios.post("http://localhost:4000/api/saveResponse", newItem);
      const res = await axios.get(`http://localhost:4000/api/savedResponses?email=${email}`);
      localStorage.setItem("offlineResponses", JSON.stringify(res.data));

      const updatedPending = pending.filter(item =>
        !(item.userEmail === newItem.userEmail && item.response === newItem.response)
      );
      localStorage.setItem("pendingResponseSaves", JSON.stringify(updatedPending));
      await loadSavedResponses(); // Refresh list
    } catch (error) {
      console.log("Server unavailable, will retry later");
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
        </nav>
      </header>

      <div className="main-content">
        <div className="greeting">
          {username && <h2>Welcome, {username}!</h2>}
        </div>

        <div className="input-card">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
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
