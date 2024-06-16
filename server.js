const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

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
  host: "127.0.0.1",
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

// Hash password in database
const hashPassword = async (password) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

// Endpoint per il login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Cerca l'utente nel database tramite l'email fornita
    const getUserQuery = "SELECT * FROM user WHERE email = ?";
    db.query(getUserQuery, [email], async (err, result) => {
      if (err) {
        console.error("Errore durante il recupero dell'utente dal database: ", err);
        res.status(500).send("Errore durante il login");
        return;
      }
      if (result.length === 0) {
        // Se non esiste un utente con l'email fornita, restituisci un errore
        res.status(400).send("Email non registrata");
        return;
      }

      // Verifica la corrispondenza della password
      const user = result[0];
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        // Se la password non corrisponde, restituisci un errore
        res.status(400).send("Password errata");
        return;
      }

      // Se l'utente esiste e la password corrisponde, restituisci OK
      res.status(200).send("Login effettuato con successo");
    });
  } catch (error) {
    console.error("Errore durante il login: ", error);
    res.status(500).send("Errore durante il login");
  }
});

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

app.post("/register", async (req, res) => {
  const { username, password, email } = req.body;

  try {
    // Controlla se l'email esiste già nel database
    const emailExistsQuery = "SELECT * FROM user WHERE email = ?";
    db.query(emailExistsQuery, [email], async (err, result) => {
      if (err) {
        console.error("Errore durante il controllo dell'email nel database: ", err);
        res.status(500).send("Errore durante la registrazione");
        return;
      }
      if (result.length > 0) {
        res.status(400).send("L'email esiste già nel database");
        return;
      }

      // Cifra la password prima di salvarla nel database
      const hashedPassword = await hashPassword(password);

      const insertUserQuery = "INSERT INTO user (username, password, email) VALUES (?, ?, ?)";
      db.query(insertUserQuery, [username, hashedPassword, email], (err, result) => {
        if (err) {
          console.error("Errore durante l'inserimento dell'utente: ", err);
          res.status(500).send("Errore durante la registrazione");
          return;
        }
        res.status(200).send("Registrazione avvenuta con successo");
      });
    });
  } catch (error) {
    console.error("Errore durante la cifratura della password: ", error);
    res.status(500).send("Errore durante la registrazione");
  }
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