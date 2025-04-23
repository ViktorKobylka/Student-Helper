const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


const app = express();
const port = 4000;

//middleware
app.use(bodyParser.json());
app.use(cors());

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


//connect to MongoDB
mongoose.connect('mongodb+srv://admin:admin@student-helper.lwhbhrt.mongodb.net/');

//define the chema for user authentication
const loginSchema = new mongoose.Schema({
    username:String,
    email:String,
    password:String
});

//model for the UserInfo collection
const User = mongoose.model('UserInfo', loginSchema);

//API endpoint to create new User 
app.post('/api/registerData',async (req, res)=>{
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ username, email, password });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" }); 
    } catch (error) {
        res.status(500).json({ message: "Error registering user" }); //handles errors
    }
});

app.post('/api/loginData', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    
    if (user) {
        res.status(200).json({ message: "Login successful" });
    } else {
        res.status(401).json({ message: "Error logging user" });
    }
});


app.get('/api/getUser', async (req, res) => {
    try {
        const email = req.query.email; //get email from query

        const user = await User.findOne({ email });
        if (user) {
            res.status(200).json({ username: user.username });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching user" });
    }
});

const responseSchema = new mongoose.Schema({
    userEmail: String,
    response: String
});

const Response = mongoose.model('Response', responseSchema);

app.post("/api/saveResponse", async (req, res) => {
    try {
        const { userEmail, response } = req.body;

        const newResponse = new Response({ userEmail, response });
        await newResponse.save();
        res.status(201).json({ message: "Response saved successfully" });
    } catch (error) {
        console.error("Error saving response:", error);
    }
});

app.delete("/api/deleteResponse/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedResponse = await Response.findByIdAndDelete(id);

        res.status(200).json({ message: "Response deleted successfully" });
    } catch (error) {
        console.error("Error deleting response:", error);
    }
});

app.get("/api/savedResponses", async (req, res) => {
    try {
        const { email } = req.query;

        const responses = await Response.find({ userEmail: email });
        res.status(200).json(responses);
    } catch (error) {
        console.error("Error fetching responses:", error);
        res.status(500).json({ message: "Server error" });
    }
});
  