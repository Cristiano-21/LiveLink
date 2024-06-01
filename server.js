const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const mysql = require("mysql");
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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

app.use("/peerjs", ExpressPeerServer(server, opinions));
app.use(express.static("public"));

// Configurazione del database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Fincons24!",
  database: "videochat"
});

db.connect((err) => {
  if (err) {
    console.error("Errore di connessione al database: ", err);
    return;
  }
  console.log("Connesso al database MySQL");
});

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

app.post("/register", (req, res) => {
  const { username, password } = req.body;

  const query = "INSERT INTO users (username, password) VALUES (?, ?)";
  db.query(query, [username, password], (err, result) => {
    if (err) {
      console.error("Errore durante l'inserimento dell'utente: ", err);
      res.status(500).send("Errore durante la registrazione");
      return;
    }
    res.status(200).send("Registrazione avvenuta con successo");
  });
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

server.listen(process.env.PORT || 3030, () => {
  console.log("Server in ascolto sulla porta 3030");
});