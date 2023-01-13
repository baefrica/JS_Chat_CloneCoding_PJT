// http 를 import
import http from "http";
// socket.io 를 import
import { Server } from "socket.io";
// Socket IO Admin UI import
import { instrument } from "@socket.io/admin-ui";
// express 를 import
import express from "express";

/*
// ws 를 import
import WebSocket from "ws";
*/

// express 앱 구성
const app = express();

// 나중에 pug 페이지들을 렌더하기 위해 view engine 을 pug 로 설정
app.set("view engine", "pug");
// views 디렉토리 설정
app.set("views", __dirname + "/views");

// Express 에 template 이 어디 있는지 지정
// public url 을 생성해서 "/public" 으로 가게 되면 유저에게 public 폴더의 파일을 공유
app.use("/public", express.static(__dirname + "/public"));

// 홈페이지로 이동 시 사용될 템플릿 -> home.pug
// home.pug 페이지를 render 해주는 route handler 생성
app.get("/", (req, res) => res.render("home"));
// catchall url 생성
// 유저가 어떤 url 로 이동하던지 home 으로 가도록 함
app.get("/*", (req, res) => res.redirect("/"));

// express.js 를 이용하여 http 서버 생성
const httpServer = http.createServer(app);
// websocket 서버 생성
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

instrument(wsServer, {
  auth: false,
});

/*
// http 서버 위에 WebSocket 서버 생성
const wss = new WebSocket.Server({ server });
*/

function publicRooms() {
  const sids = wsServer.sockets.adapter.sids;
  const rooms = wsServer.sockets.adapter.rooms;

  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });

  return publicRooms;
}

function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

// BE 에서 connection 받을 준비
wsServer.on("connection", (socket) => {
  // 처음 connection 되었을 때
  socket["nickname"] = "Anonymous";

  socket.onAny((event) => {
    console.log(`Socket Event : ${event}`);
  });

  // 전송받은 object 를 그대로 msg 로 받음
  // 전송받은 함수 () 를 done 으로 받음
  socket.on("enter_room", (nickname, roomName, showRoom) => {
    socket["nickname"] = nickname;
    console.log(roomName + " 입장");
    // socket 이 있는 rooms 를 보여줌
    console.log(socket.rooms);

    // SocketIO 는 기본적으로 room 을 제공
    // 방으로 입장시키는 SocketIO 의 기능
    socket.join(roomName);
    showRoom();
    // 중복되는 요소가 없는 set
    console.log(socket.rooms);

    // "welcome" event 를 roomName 에 있는 모든 사람들에게 emit
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));

    // 연결된 모든 socket 에게 메시지를 보냄
    wsServer.sockets.emit("room_change", publicRooms());
  });

  // socket 이 방을 떠나기 바로 직전에 발생
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
    );
  });

  socket.on("disconnect", () => {
    // 연결된 모든 socket 에게 메시지를 보냄
    wsServer.sockets.emit("room_change", publicRooms());
  });

  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("sendMsg", `${socket.nickname} : ${msg}`);
    // 이 done() 은 BE 에서는 실행하지 않음. FE 에서만.
    done();
  });

  socket.on("nickname", (nickname) => {
    socket["nickname"] = nickname;
  });
});

/*
// 브라우저가 꺼졌을 때
function onSocketClose() {
  console.log("Disconnected from Browser ❌");
}

// 누군가 서버에 연결하면, 그 connection 을 여기다가 넣어줌
const sockets = [];

// 여기의 socket 은 연결된 브라우저를 의미
// 브라우저가 연결되면..
wss.on("connection", (socket) => {
  sockets.push(socket);
  // 처음 연결되었을 때엔 익명임
  socket["nickname"] = "Anonymous";
  console.log("Connected to Browser ✔");

  socket.on("close", onSocketClose);

  // connection 이 생겼을 때 socket 으로 즉시 메시지를 보냄
  // 브라우저에 메시지를 보내보자 -> socket 으로 직접적인 연결을 제공
  socket.on("message", (msg) => {
    // String 형태로 받은 msg 를 JSON 형태로 파싱
    const message = JSON.parse(msg);
    // JSON 형태로 파싱한 메시지의 타입을 확인
    switch (message.type) {
      case "newMsg":
        sockets.forEach((soc) => {
          // nickname 프로퍼티를 socket object 에 저장
          soc.send(`${socket.nickname} : ${message.payload}`);
        });
        break;

      case "nickname":
        // socket 안에 새로운 정보를 저장
        socket["nickname"] = message.payload;
    }
  });
});
*/

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);
