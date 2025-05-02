import express from 'express';
import { createServer } from 'node:http';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server } from 'socket.io';
import mongodb from "mongodb";


const app = express();
const server = createServer(app)
const io = new Server(server);
const { MongoClient } = mongodb;



var users = [];
var activeUsers = 0;

const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(join(__dirname, "public")));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '../html/index.html'));
});

MongoClient.connect("mongodb://127.0.0.1/Skilaverkefni4", { useUnifiedTopology: true }, function (err, db) {
  if (err) {
    throw err;
  }

  var chatDB = db.db("Gagnasafn");

  io.on('connection', (socket) => {



    socket.on("pW", (password) => {
      if (password == "42") {
        socket.emit("lock", true)
        activeUsers++;
        chatDB.collection("messages").find({}, { projection: { _id: 0, message: 1 } }).toArray(function (err, result) {
          if (err) throw err;
          for (let k = 0; k < result.length; k++) {
            io.emit("chat message", result[k].message);
          }
        });

        socket.on("usernameHistory", (username) => {
          console.log("Looking up messages for:", username);  // ekki að virka
        });
        // socket.on("usernameHistory", (username) => {
        //   console.log("Looking up messages for:", username);
        //   chatDB.collection("messages").find({ user: username }).toArray(function (err, userResult) {
        //     if (err) {
        //       throw err;
        //     }
        //     for (let j = 0; j < userResult.length; j++) {
        //       io.emit("chat message", userResult[j].message)
        //     }
        //   })
        // });

        io.emit("userNum", activeUsers);
        socket.on("disconnect", () => {
          for (let i = 0; i < users.length; i++) {
            if (socket.userName === users[i]) {
              users.splice(i, 1)
            }
          }
          activeUsers--;
        });
        socket.on('chat message', (msg) => {
          io.emit('chat message', Tímiskilaboða() + socket.userName + ": " + msg);
          chatDB.collection("messages").insertOne({ user: socket.userName, message: socket.userName + " : " + msg + " : " + Tímiskilaboða() });
        });
        socket.on("join", (person) => {
          socket.userName = person;
          users.push(socket.userName);
          io.emit("userArray", users);
        });
        // https://www.w3schools.com/nodejs/nodejs_mongodb_find.asp
        // socket.on("usernameHistory", (username) => {
        //   db.getUser(username, { showCustomData: true })
        //     .then((userData) => {
        //       if (userData) {
        //         socket.emit("historyResponse", userData);
        //       } else {
        //         socket.emit("historyError", "User not found");
        //       }
        //     })
        //     .catch((error) => {
        //       console.error("Villa í gagnagrunni: ", error);
        //       socket.emit("historyError", "Villa í gagnagrunni");
        //     });
        // });
      }
      else {
        socket.emit("lock", false)
      }
    });
  });
});

function Tímiskilaboða() {
  const tími = new Date();
  const klst = String(tími.getHours()).padStart(2, "0");
  const min = String(tími.getMinutes()).padStart(2, "0");
  const sek = String(tími.getSeconds()).padStart(2, "0");

  return `[${klst}:${min}:${sek}] - `;
}

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});