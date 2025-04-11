import express from 'express';
import { createServer } from 'node:http';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server } from 'socket.io';


const app = express();
const server = createServer(app)
const io = new Server(server);

var users = [];
var activeUsers = 0;

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '../html/index.html'));
});

io.on('connection', (socket) => {
  socket.on("pW", (password) => {
    if (password == "42") {
      socket.emit("lock", true)
      activeUsers++;
      io.emit("userNum", activeUsers);
      socket.on("disconnect", () => {
        for (let i = 0; i < users.length; i++) {
          if (socket.userName === users[i]) {
            users.splice(i, 1)
          }
        }
        activeUsers--;
      })
      socket.on('chat message', (msg) => {
        io.emit('chat message', Tímiskilaboða() + socket.userName + ": " + msg);
      });
      socket.on("join", (person) => {
        socket.userName = person;
        users.push(socket.userName);
        io.emit("userArray", users)
      }
      )
    }
    else {
      socket.emit("lock", false)
    }
  })
});

function Tímiskilaboða(){
  const tími = new Date();
  const klst = String(tími.getHours()).padStart(2, "0");
  const min = String(tími.getMinutes()).padStart(2, "0");
  const sek = String(tími.getSeconds()).padStart(2, "0");

  return `[${klst}:${min}:${sek}] - `;
}

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
