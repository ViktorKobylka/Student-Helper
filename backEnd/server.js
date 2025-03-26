const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


const app = express();
const port = 4000;

//middleware
app.use(bodyParser.json());
app.use(cors());

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