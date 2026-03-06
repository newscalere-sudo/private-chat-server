const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

const rooms = {};

io.on("connection", (socket) => {

  socket.on("join_room", (room) => {

    if (!rooms[room]) {
      rooms[room] = [];
    }

    if (rooms[room].length >= 2) {
      socket.emit("room_full");
      return;
    }

    rooms[room].push(socket.id);
    socket.join(room);

  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data.message);
  });

  socket.on("disconnect", () => {
    for (let room in rooms) {
      rooms[room] = rooms[room].filter(id => id !== socket.id);
    }
  });

});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});