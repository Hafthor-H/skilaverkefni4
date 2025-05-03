import Express from 'express';
import mongodb from "mongodb";
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import router from "../routes/routes.js";


const app = Express();
const server = createServer(app)
const io = new Server(server);
const { MongoClient } = mongodb;
app.use('/', router);


var users = [];
var activeUsers = 0;

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
            socket.emit("chat message", result[k].message);
          }
        });

        socket.on("resetChat", () => {
          chatDB.collection("messages").find({}, { projection: { _id: 0, message: 1 } }).toArray(function (err, result) {
            if (err) throw err;
            for (let b = 0; b < result.length; b++) {
              socket.emit("chat message", result[b].message);
            }
          });
        });

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
          chatDB.collection("messages").insertOne({ user: socket.userName, message: Tímiskilaboða() + socket.userName + " : " + msg });
        });
        socket.on("join", (person) => {
          socket.userName = person;
          users.push(socket.userName);
          io.emit("userArray", users);
        });

        socket.on("usernameHistory", (username) => {
          let query = { user: username };
          chatDB.collection("messages").find(query).toArray((err, result) => {
            if (err) {
              throw err
            };
            for (let l = 0; l < result.length; l++) {
              socket.emit("chat message", result[l].message)
            }
          });
        });
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