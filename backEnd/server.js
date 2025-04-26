const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


const app = express();
const port = 4000;

//middleware
app.use(bodyParser.json());
app.use(cors());
// Start the server and listen on specified port
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// Connect to MongoDB Atlas database using mongoose
mongoose.connect('mongodb+srv://admin:admin@student-helper.lwhbhrt.mongodb.net/');

// Schema defines the structure of documents in MongoDB for user login
const loginSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
});

// Mongoose model based on the login schema to interact with 'UserInfo' collection
const User = mongoose.model('UserInfo', loginSchema);

// API endpoint to register a new user
app.post('/api/registerData', async (req, res) => {
    try {
        const { username, email, password } = req.body; // Extract data from request body
        const newUser = new User({ username, email, password }); // Create new user document
        await newUser.save(); // Save to MongoDB
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error registering user" }); // Handle server error
    }
});

// API endpoint to log in a user
app.post('/api/loginData', async (req, res) => {
    const { email, password } = req.body; // Get login credentials
    const user = await User.findOne({ email, password }); // Check credentials in database
    
    if (user) {
        res.status(200).json({ message: "Login successful" }); // Successful login
    } else {
        res.status(401).json({ message: "Error logging user" }); // Unauthorized login
    }
});

// API endpoint to get username by email
app.get('/api/getUser', async (req, res) => {
    try {
        const email = req.query.email; // Get email from query parameters
        const user = await User.findOne({ email }); // Find user by email

        if (user) {
            res.status(200).json({ username: user.username }); // Send username
        } else {
            res.status(404).json({ message: "User not found" }); // No user found
        }
    } catch (error) {
        console.error("Error fetching user:", error); // Log error
    }
});

// Schema for saving text responses (e.g. essay checker results)
const responseSchema = new mongoose.Schema({
    userEmail: String,
    response: String
});

// Model for interacting with saved responses collection
const Response = mongoose.model('Response', responseSchema);

// API endpoint to save a new response
app.post("/api/saveResponse", async (req, res) => {
    try {
        const { userEmail, response } = req.body; // Extract request data
        const newResponse = new Response({ userEmail, response }); // Create new document
        await newResponse.save(); // Save to DB
        res.status(200).json({ message: "Response saved successfully" });
    } catch (error) {
        console.error("Error saving response:", error); // Handle error
    }
});

// API endpoint to delete a response by its ID
app.delete("/api/deleteResponse/:id", (req, res) => {
    const { id } = req.params;

    // Check if id is null or the string "null"
    if (id === null || id === "null") {
        console.log("Received null ID, rejecting request");
        return res.status(400).json({ message: "Invalid ID: null value not allowed" });
    }

    // Check if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log("Invalid ID format, skipping delete:", id);
        return res.status(400).json({ message: "Invalid ID, not deleting from database" });
    }

    Response.findByIdAndDelete(id)
        .then((deletedResponse) => {
            if (!deletedResponse) {
                return res.status(404).json({ message: "Response not found" });
            }
            res.json({ message: "Response deleted successfully" });
        })
        .catch((error) => {
            console.error("Error deleting response:", error);
            res.status(500).json({ message: "Error deleting response" });
        });
});

// API endpoint to get all saved responses for a user
app.get("/api/savedResponses", async (req, res) => {
    try {
        const { email } = req.query; // Get email from query
        const responses = await Response.find({ userEmail: email }); // Find matching documents
        res.status(200).json(responses); // Send them to client
    } catch (error) {
        console.error("Error fetching responses:", error); // Handle error
    }
});

// Schema for saving terms and definitions
const savedTermSchema = new mongoose.Schema({
    userEmail: String,
    term: String,
    definition: String
});

// Model to interact with saved terms collection
const SavedTerm = mongoose.model("SavedTerm", savedTermSchema);

// API endpoint to save a new term
app.post("/api/saveTerm", async (req, res) => {
    try {
        const { userEmail, term, definition } = req.body; // Extract request data
        const newTerm = new SavedTerm({ userEmail, term, definition }); // Create document
        await newTerm.save(); // Save to DB
        res.status(201).json({ message: "Term saved successfully" });
    } catch (error) {
        console.error("Error saving term:", error); // Log error
    }
});

// API endpoint to get all terms for a specific user
app.get("/api/savedTerms", async (req, res) => {
    try {
        const { email } = req.query; // Get email from query
        const terms = await SavedTerm.find({ userEmail: email }); // Find terms
        res.json(terms); // Return list of terms
    } catch (error) {
        console.error("Error fetching terms:", error); // Log error
    }
});

// API endpoint to delete a term by ID
app.delete("/api/deleteTerm/:id", (req, res) => {
    const { id } = req.params;

    // Check if id is null or the string "null"
    if (id === null || id === "null") {
        console.log("Received null ID, rejecting request");
        return res.status(400).json({ message: "Invalid ID: null value not allowed" });
    }

    // Check if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log("Invalid ID format, skipping delete:", id);
        return res.status(400).json({ message: "Invalid ID, not deleting from database" });
    }

    SavedTerm.findByIdAndDelete(id)
        .then((deletedTerm) => {
            if (!deletedTerm) {
                return res.status(404).json({ message: "Term not found" });
            }
            res.json({ message: "Term deleted successfully" });
        })
        .catch((error) => {
            console.error("Error deleting term:", error);
            res.status(500).json({ message: "Error deleting term" });
        });
});
