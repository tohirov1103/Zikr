const port = 3000;
const express = require('express');
const cors = require('cors');
const {connectDb} = require('./db/connectDb');
const task = require('./routes/tasks');
const app = express();

app.use(cors())
app.use(express.json());

app.use('/',task)


const start = async()=>{
    try {
    const connection = await connectDb('localhost',3306,'root','hikmat2005$','Zikr');
    console.log("Connected successfully");
    app.listen(port,()=>{
        console.log(`Server running on port ${port}`);
    })
    } catch (error) {
        console.log(error);
    }
}

start();