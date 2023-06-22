const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
app.set("view engine", "ejs");
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
const { ExpressPeerServer } = require("peer");
const opinions = {
  debug: true,
};

const { Client } = require("@elastic/elasticsearch");
const elasticClient = new Client({ node: "http://localhost:9200" });

app.post("/logs", (req, res) => {
  const logText = req.body.logText;
  elasticClient
    .index({
      index: "logs",
      body: {
        message: logText,
        timestamp: new Date(),
      },
    })
    .then(() => {
      res.sendStatus(200);
    })
    .catch((error) => {
      console.error("Error indexing log:", error);
      res.sendStatus(500);
    });
});

app.use("/peerjs", ExpressPeerServer(server, opinions));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId);
    setTimeout(() => {
      socket.to(roomId).broadcast.emit("user-connected", userId);
    }, 1000);
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, userName);
    });
  });
});

server.listen(process.env.PORT || 3030);