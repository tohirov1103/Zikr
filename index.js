const port = 3000;
const express = require('express');
const cors = require('cors');
const {connectDb} = require('./db/connectDb');
const multer = require('multer');
const task = require('./routes/tasks');
const zikrTasks = require('./Zikr/routes/zikrRoutes');
const app = express();

app.use(cors())
app.use(express.json());

app.use('/tasks', task);
app.use('/zikrs', zikrTasks);


// Image Storage Engine
const storage = multer.diskStorage({
    destination:'./upload/images',
    filename:(req,file,cb)=>{
        return cb(null,`${file.file}_${Date.now()}${path.extname(file.originalname)}`)
    }
})
const upload = multer({storage:storage})
// Creating Upload for images
app.use('/images',express.static('upload/images'));
app.post('/upload',upload.single('product'),(req,res)=>{
    res.json({
        success:1,
        image_url:`http://localhost:${port}/images/${req.file.filename}`
    })
})


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