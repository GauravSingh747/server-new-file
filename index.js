const http = require("http");
const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");

const app = express();
const port = process.env.PORT;
const server = http.createServer(app);

const users = [{}];

app.use(cors());
app.get("/", (req, res) => {
  res.send("Server is Working");
});

const io = socketIO(server);

//___________________________________________
io.on("connection", (socket) => {
  console.log("Got A new connection");
  //__
  socket.on("joined", ({ user }) => {
    users[socket.id] = user;
    console.log(`${user} has joined`);

    socket.broadcast.emit("userJoined", {
      user: "Admin",
      message: `${users[socket.id]} has joined the chat`,
    });

    socket.emit("welcome", {
      user: "Admin",
      message: `welcome to the chat, ${users[socket.id]}`,
    });
  });

  socket.on("message", ({ message, id }) => {
    io.emit("sendMessage", { user: users[id], message, id });
  });

  socket.on("notConnected", () => {
    socket.broadcast.emit("leave", {
      user: "Admin",
      message: `${users[socket.id]} has left`,
    });
    console.log(`user left`);
  });
});

server.listen(port, () => {
  console.log(`server is working on http://localhost:${port}`);
});
