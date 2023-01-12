// http 를 import
import http from "http";
// ws 를 import
import WebSocket from "ws";
// express 를 import
import express from "express";

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

const handleListen = () => console.log(`Listening on http://localhost:3000`);

// express.js 를 이용하여 http 서버 생성
const server = http.createServer(app);
// http 서버 위에 WebSocket 서버 생성
const wss = new WebSocket.Server({ server });

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

server.listen(3000, handleListen);
