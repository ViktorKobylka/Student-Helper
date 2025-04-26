import { useEffect, useState } from "react";
import axios from "axios";
import logotype from "../styles/images/logotype.jpg";
import "../styles/StudyPage.css";

const StudyPage = () => {
  const [termText, setTermText] = useState("");
  const [definition, setDefinition] = useState("");
  const [savedTerms, setSavedTerms] = useState([]);
  const email = localStorage.getItem("userEmail");

  // Function to process (retry) pending term deletions when online
  const processDeleteQueue = async () => {
    const pending = JSON.parse(localStorage.getItem("pendingDeletes") || "[]");
    if (pending.length === 0) return;

    const successfullyDeleted = [];

    for (const id of pending) {
      try {
        await axios.delete(`http://localhost:4000/api/deleteTerm/${id}`);
        successfullyDeleted.push(id); // Collect IDs successfully deleted
        console.log("Delete:", id);
      } catch (error) {
        console.log("Error to delete:", id);
      }
    }

    // Save only IDs still pending deletion
    const stillPending = pending.filter(id => !successfullyDeleted.includes(id));
    localStorage.setItem("pendingDeletes", JSON.stringify(stillPending));
  };

  // Function to process (retry) pending term saves when online
  const processSaveQueue = async () => {
    const pending = JSON.parse(localStorage.getItem("pendingSaves") || "[]");
    if (pending.length === 0) return;
  
    const successfullySaved = [];
  
    for (const item of pending) {
      try {
        await axios.post("http://localhost:4000/api/saveTerm", {
          userEmail: item.email,
          term: item.term,
          definition: item.definition
        });
        successfullySaved.push(item); // Collect items successfully saved
        console.log("Save:", item.term);
      } catch (error) {
        console.log("Failed to save:", item.term);
      }
    }
  
    // Keep only items that were not successfully saved
    const stillPending = pending.filter(pendingItem =>
      !successfullySaved.some(savedItem =>
        savedItem.email === pendingItem.email &&
        savedItem.term === pendingItem.term &&
        savedItem.definition === pendingItem.definition
      )
    );
  
    localStorage.setItem("pendingSaves", JSON.stringify(stillPending));
  };

  // Load saved terms when the component mounts
  useEffect(() => {
    const loadData = async () => {
      const localData = localStorage.getItem("savedTerms");
      let localTerms = localData ? JSON.parse(localData) : [];

      // Include offline-created terms not yet synced
      const pendingSaves = JSON.parse(localStorage.getItem("pendingSaves") || "[]");
      const offlineTerms = pendingSaves.map((t, index) => ({
        ...t,
        _id: `pending-${index}-${t.term}` // Temporary ID
      }));

      setSavedTerms([...localTerms, ...offlineTerms]);

      // Process queued offline changes first
      await processDeleteQueue();
      await processSaveQueue();

      try {
        // Load the latest terms from server
        const res = await axios.get(`http://localhost:4000/api/savedTerms?email=${email}`);
        setSavedTerms(res.data);
        localStorage.setItem("savedTerms", JSON.stringify(res.data));
      } catch (error) {
        console.error("Error loading from server:", error);
      }
    };

    loadData();
  }, [email]);

  // Reload data and sync queues when back online
  useEffect(() => {
    const handleOnline = async () => {
      await processDeleteQueue();
      await processSaveQueue();

      try {
        const res = await axios.get(`http://localhost:4000/api/savedTerms?email=${email}`);
        setSavedTerms(res.data);
        localStorage.setItem("savedTerms", JSON.stringify(res.data));
      } catch (error) {
        console.error("Failed to reload:", error);
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [email]);

  // Handle submitting a term to generate its definition
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

  // Handle saving a term and its definition
  const handleSave = async () => {
    if (definition === "Loading..." || definition === "Error: Unable to fetch response.") return;

    // Create a new term object
    const newTerm = {
      _id: `temp-${Date.now()}`, // Temporary ID
      email,
      term: termText,
      definition
    };

    // Update local saved terms immediately
    const updated = [...savedTerms, newTerm];
    setSavedTerms(updated);
    localStorage.setItem("savedTerms", JSON.stringify(updated));

    // Reset input fields
    setTermText("");
    setDefinition("");

    try {
      // Try saving to server
      await axios.post("http://localhost:4000/api/saveTerm", {
        userEmail: email,
        term: termText,
        definition
      });

      // Refresh terms after successful save
      const res = await axios.get(`http://localhost:4000/api/savedTerms?email=${email}`);
      setSavedTerms(res.data);
      localStorage.setItem("savedTerms", JSON.stringify(res.data));
    } catch (error) {
      // If save fails, queue it for later
      console.log("Queued for saving later");
      const pending = JSON.parse(localStorage.getItem("pendingSaves") || "[]");
      pending.push({
        email,
        term: termText,
        definition
      });
      localStorage.setItem("pendingSaves", JSON.stringify(pending));
    }
  };

  // Handle deleting a saved term
  const handleDelete = async (id) => {
    console.log("Deleting:", id);

    // Remove term immediately from local state
    setSavedTerms(prev => {
      const updated = prev.filter(term => term._id !== id);
      localStorage.setItem("savedTerms", JSON.stringify(updated));
      return updated;
    });

    // Queue deletion locally
    const pending = JSON.parse(localStorage.getItem("pendingDeletes") || "[]");
    if (!pending.includes(id)) {
      pending.push(id);
      localStorage.setItem("pendingDeletes", JSON.stringify(pending));
    }

    try {
      // Try deleting on server
      await axios.delete(`http://localhost:4000/api/deleteTerm/${id}`);
      console.log("Deleted from server");

      // Remove from pending list after successful deletion
      const updatedPending = pending.filter(p => p !== id);
      localStorage.setItem("pendingDeletes", JSON.stringify(updatedPending));
    } catch (error) {
      // If failed, keep it queued
      console.log("Queued for deletion later");
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
            <a href="/mainPage">Main Page</a>
            <a href="/essay">Essay Checker</a>
            <a href="/saved">Saved Results</a>
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
