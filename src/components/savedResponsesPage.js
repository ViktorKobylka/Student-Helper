import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import logotype from "../styles/images/logotype.jpg";
import "../styles/SavedResponsesPage.css";


const SavedResponsesPage = () => {
    // State to store saved responses
    const [savedResponses, setSavedResponses] = useState([]);
    // State to store user's email
    const [email, setEmail] = useState(null);
    
    // Fetch user's email from localStorage when component mounts
    useEffect(() => {
        const storedEmail = localStorage.getItem("userEmail");
        setEmail(storedEmail);
    }, []);

    // Attempt to process any pending deletions stored locally
    const processDeleteQueue = async () => {
        const pending = JSON.parse(localStorage.getItem("pendingResponseDeletes") || "[]");
        if (pending.length === 0) return;
    
        const successfullyDeleted = [];
    
        for (const id of pending) {
            try {
                // Try deleting each pending response from server
                await axios.delete(`http://localhost:4000/api/deleteResponse/${id}`);
                successfullyDeleted.push(id);
                console.log("Deleted:", id);
            } catch (error) {
                console.log("Error deleting:", id);
            }
        }
    
        // Update pending deletions with any remaining failures
        const stillPending = pending.filter(id => !successfullyDeleted.includes(id));
        localStorage.setItem("pendingResponseDeletes", JSON.stringify(stillPending));
    };

    // Attempt to process any pending saves stored locally
    const processSaveQueue = async () => {
        const pending = JSON.parse(localStorage.getItem("pendingResponseSaves") || "[]");
        if (pending.length === 0) return;
    
        const successfullySaved = [];
    
        for (const item of pending) {
            try {
                // Try saving each pending response to server
                const response = await axios.post("http://localhost:4000/api/saveResponse", item);
                successfullySaved.push(item);
                console.log("Saved:", item.response.substring(0, 20) + "...");
            } catch (error) {
                console.log("Failed to save:", item.response.substring(0, 20) + "...");
            }
        }
    
        // Update pending saves with any remaining unsaved items
        const stillPending = pending.filter(pendingItem =>
            !successfullySaved.some(savedItem =>
                savedItem.userEmail === pendingItem.userEmail &&
                savedItem.response === pendingItem.response
            )
        );
        localStorage.setItem("pendingResponseSaves", JSON.stringify(stillPending));
    };

    // Load responses either from local storage or server
    const loadResponses = useCallback(async () => {
        if (!email) return;

        // Load responses cached offline
        const localData = localStorage.getItem("offlineResponses");
        let localResponses = localData ? JSON.parse(localData) : [];

        // Find any pending saves related to this user
        const pendingSaves = JSON.parse(localStorage.getItem("pendingResponseSaves") || "[]");
        const userPendingSaves = pendingSaves.filter(item => item.userEmail === email);

        // Add temporary IDs to pending saves
        const pendingItems = userPendingSaves.map((item, index) => ({
            _id: `pending-${index}-${Date.now()}`,
            userEmail: item.userEmail,
            response: item.response
        }));

        // Combine cached and pending responses
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

        // Set state with combined responses
        setSavedResponses(combinedResponses);

        // If online, sync with server
        if (navigator.onLine) {
            await processDeleteQueue();
            await processSaveQueue();
            try {
                const res = await axios.get(`http://localhost:4000/api/savedResponses?email=${email}`);
                
                // Check again for updated pending saves after sync
                const updatedPendingSaves = JSON.parse(localStorage.getItem("pendingResponseSaves") || "[]");
                const updatedUserPendingSaves = updatedPendingSaves.filter(item => item.userEmail === email);

                if (updatedUserPendingSaves.length > 0) {
                    const updatedPendingItems = updatedUserPendingSaves.map((item, index) => ({
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
                console.error("Error loading responses from server:", error);
            }
        }
    }, [email]);

    // Load responses once email is ready
    useEffect(() => {
        if (email) {
            loadResponses();
        }
    }, [email, loadResponses]);
    
    // Re-load responses when the device comes online
    useEffect(() => {
        const handleOnline = async () => {
            if (!email) return;
            await loadResponses();
        };
        window.addEventListener("online", handleOnline);
        return () => window.removeEventListener("online", handleOnline);
    }, [email, loadResponses]);
    
    // Handle deleting a response
    const handleDelete = async (id) => {
        console.log("Deleting response:", id);

        // Immediately remove response from local state
        setSavedResponses(prev => prev.filter(r => r._id !== id));

        // If the response was pending (never saved to server yet)
        if (id.toString().startsWith('pending-')) {
            const parts = id.split('-');
            const pendingIndex = parseInt(parts[1]);
            const pendingSaves = JSON.parse(localStorage.getItem("pendingResponseSaves") || "[]");
            const filteredSaves = pendingSaves.filter((_, index) => index !== pendingIndex);
            localStorage.setItem("pendingResponseSaves", JSON.stringify(filteredSaves));
            
            const localCache = JSON.parse(localStorage.getItem("offlineResponses") || "[]");
            localStorage.setItem("offlineResponses", JSON.stringify(localCache));
            return;
        }

        // For already saved responses, queue deletion if offline
        const pending = JSON.parse(localStorage.getItem("pendingResponseDeletes") || "[]");
        if (!pending.includes(id)) {
            pending.push(id);
            localStorage.setItem("pendingResponseDeletes", JSON.stringify(pending));
        }

        // Also remove it from cached responses
        const localCache = JSON.parse(localStorage.getItem("offlineResponses") || "[]");
        const updatedCache = localCache.filter(item => item._id !== id);
        localStorage.setItem("offlineResponses", JSON.stringify(updatedCache));

        // If online, try deleting from server immediately
        if (navigator.onLine) {
            try {
                await axios.delete(`http://localhost:4000/api/deleteResponse/${id}`);
                console.log("Deleted from server");
                const updatedPending = pending.filter(p => p !== id);
                localStorage.setItem("pendingResponseDeletes", JSON.stringify(updatedPending));
            } catch (error) {
                console.log("Queued for deletion later");
            }
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
                    <a href="/study">Study terms</a>
                </nav>
            </header>

            <main className="main-content">
                <h2>Saved Responses</h2>
                {savedResponses.length === 0 ? (
                    <h2>No saved responses</h2>
                ) : (
                    savedResponses.map((response) => (
                        <div key={response._id} className="response-card">
                            <p>Response: {response.response}</p>
                            {response._id && response._id.toString().startsWith('pending-') && (
                                <span style={{color: '#888', fontSize: '0.8rem'}}>(Not yet synchronized)</span>
                            )}
                            <button onClick={() => handleDelete(response._id)}>Delete</button>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
};

export default SavedResponsesPage;