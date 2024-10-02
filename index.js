const port = 2005;
const express = require('express');
const cors = require('cors');
const { connectDb } = require('./db/connectDb');
const multer = require('multer');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');
require('dotenv').config();
const task = require('./routes/tasks.route');
const zikrTasks = require('./routes/zikrRoutes');
const adminTasks = require('./routes/admin.route');
const messageTasks = require('./routes/messages.route');
const userRegLog = require('./routes/userRegLog.route');
const setupSwagger = require('./utils/swaggerSetup');
const authenticate = require('./middleware/authorization.middleware');

const app = express();
setupSwagger(app);

const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",  // Be sure to set the correct origin in production
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

app.use('/', task);
app.use('/', zikrTasks);
app.use('/', adminTasks);
app.use('/', messageTasks);
app.use('/', userRegLog);

// Image Storage Engine
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage: storage });

// Creating Upload for images
app.use('/images', express.static('upload/images'));
app.post('/upload', upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    });
});

// WebSocket setup
io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    socket.on('joinGroup', ({ groupId, userId }) => {
        console.log(`User ${userId} joined group ${groupId}`);
        socket.join(groupId);
    });

    socket.on('sendMessage', ({ groupId, message, userId }) => {
        console.log(`Message from user ${userId} in group ${groupId}: ${message}`);
        io.to(groupId).emit('message', { userId, message, timestamp: new Date().toISOString() });
        // Save the message to the database here if needed
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const start = async () => {
    try {
        const connection = await connectDb('localhost', 3306, 'root', 'hikmat2005$', 'Zikr');
        console.log("Connected successfully");
        server.listen(port, () => {
            console.log(`Server running on port ${port}`);
            
        });
    } catch (error) {
        console.error(error);
    }
}

start();
