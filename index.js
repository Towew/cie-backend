const express = require('express');
require('dotenv').config();
const cors = require('cors');

const app = express();

const port = process.env.PORT || 5000;

//Socket.io
const http = require('http');
const {Server} = require('socket.io')

const server = http.createServer(app)
const io = new Server(server, {
 cors: {
   origin: process.env.CLIENT_URL// define client origin if both client and server have different origin
 }
});

require('./src/socket')(io);
/* const socketIO = require('./src/socket')
socketIO(io) */

//Import routing dari folder routes
const router = require('./src/routes');

//Allow app for incoming json request
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

//Gunakan fungsi route yang sudah dijadikan variabel
app.use('/api/v1/', router); 
app.use('/uploads', express.static('uploads'));

server.listen(port, () => console.log(`Listening on port: ${port}`));