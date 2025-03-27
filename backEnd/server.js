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
mongoose.connect('mongodb+srv://admin:admin@student-helper.lwhbhrt.mongodb.net/')

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
})

app.post('/api/loginData', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    
    if (user) {
        res.status(200).json({ message: "Login successful" });
    } else {
        res.status(401).json({ message: "Error logging user" });
    }
});
