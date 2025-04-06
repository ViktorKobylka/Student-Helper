import { useEffect, useState } from "react";
import axios from "axios";
import logotype from "../styles/images/logotype.jpg";

const SavedResponsesPage = () => {
    //state to hold list of saved responses
    const [savedResponses, setSavedResponses] = useState([]);
    const email = localStorage.getItem("userEmail");//get user email

    //fetch saved responses
    useEffect(() => {
        const fetchSavedResponses = async () => {
            try {
                const res = await axios.get(`http://localhost:4000/api/savedResponses?email=${email}`);
                setSavedResponses(res.data);//save fetched data to state
            } catch (error) {
                console.error("Error fetching responses:", error);
            }
        };

        fetchSavedResponses();
    }, [email]); //run again if email changes

    //delete saved response
    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:4000/api/deleteResponse/${id}`);
            //update state to remove the deleted response
            setSavedResponses(savedResponses.filter(response => response._id !== id));
        } catch (error) {
            console.error("Error deleting response:", error);
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
                    <a href="/schedule">Schedule</a>
                    <a href="/settings">Settings</a>
                </nav>
            </header>

            <main className="main-content">
                <h2>Saved Responses</h2>
                {/*map through responses and render each*/}
                {savedResponses.length === 0 ? (
                    <h2>No saved responses</h2>
                ) : (
                    <div>
                        {savedResponses.map((response) => (
                            <div key={response._id} className="response-card">
                                <p>Response: {response.response}</p>
                                <button onClick={() => handleDelete(response._id)}>Delete</button>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default SavedResponsesPage;
