// 사용자에게 보여지는 FE 에 사용되는 js 파일

// SocketIO 를 FE 와 연결
// io() 는 자동적으로 BE 의 socket.io 와 연결해주는 함수
// 알아서 socket.io 를 실행하고 있는 서버를 찾음
const socket = io();
// welcome 이란 id 를 가지는 div 에서
const welcome = document.getElementById("welcome");
// roomNameForm 을 가져옴
const roomNameForm = welcome.querySelector("#roomName");
// nicknameForm 을 가져옴
const nicknameForm = welcome.querySelector("#nickname");
// room 이란 id 를 가지는 div 에서
const room = document.getElementById("room");
// room 을 숨김
room.hidden = true;

let roomName;

const msgForm = room.querySelector("#msg");
msgForm.addEventListener("submit", handleMsgSubmit);
nicknameForm.addEventListener("submit", handleNameSubmit);

function addMessage(msg) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");

  li.innerText = msg;
  ul.appendChild(li);
}

function handleMsgSubmit(event) {
  event.preventDefault();

  const input = room.querySelector("#msg input");
  const value = input.value;

  // BE 로 "new_message" event 를 보냄
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You : ${value}`);
  });

  input.value = "";
}

function handleNameSubmit(event) {
  event.preventDefault();

  const input = welcome.querySelector("#nickname input");

  // BE 로 "nickname" event 를 보냄
  socket.emit("nickname", input.value);
}

function showRoom() {
  nicknameForm.hidden = true;
  room.hidden = false;

  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
}

function handleRoomSubmit(event) {
  event.preventDefault();

  const nicknameInput = nicknameForm.querySelector("input");
  const roomNameInput = roomNameForm.querySelector("input");

  // 1. 특정한 event 를 emit 가능(어떤 event 든 간에)
  // 2. object 전송
  // 3. 이름없는 함수 전송
  socket.emit("enter_room", nicknameInput.value, roomNameInput.value, showRoom);
  console.log(nicknameInput.value);
  roomName = roomNameInput.value;
  roomNameInput.value = "";
}

roomNameForm.addEventListener("submit", handleRoomSubmit);

// "welcome" event 를 받으면 addMessage 함수 실행
socket.on("welcome", (user, newCnt) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCnt})`;
  addMessage(`${user} joined ✔`);
});

// "disconnecting" event 를 받으면 addMessage 함수 실행
socket.on("bye", (user, newCnt) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCnt})`;
  addMessage(`${user} left ❌`);
});

socket.on("sendMsg", addMessage);

// rooms 로 방 배열을 받음
socket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  // 항상 방 목록을 비워줌
  roomList.innerHTML = "";
  // rooms 가 없는 상태로 오면 = 어플리케이션에 방이 하나도 없을 때
  // 모든 것을 비워줌
  if (rooms.length === 0) {
    return;
  }

  rooms.forEach((room) => {
    const li = document.createElement("li");

    li.innerText = room;
    roomList.append(li);
  });
});

/*

const msgList = document.querySelector("ul");
const msgForm = document.querySelector("#message");
const nicknameForm = document.querySelector("#nickname");

// FE 에서 BE 로 연결하는 방법
// 여기의 socket 은 서버로의 연결을 의미
const socket = new WebSocket(`ws://${window.location.host}`);

function makeMsg(type, payload) {
  const msg = {
    type,
    payload,
  };

  return JSON.stringify(msg);
}

// 서버에 connection 했을 때
socket.addEventListener("open", () => {
  // vscode 이모지 추가 : Windows + .
  console.log("Connected to Server ✔");
});
// message 를 받을 때마다
socket.addEventListener("message", (message) => {
  // 리스트로 만들어서 담는다
  const li = document.createElement("li");
  li.innerText = message.data;
  msgList.append(li);

  console.log(
    `"${message.data}" 라는 내용의 메시지를 서버로부터 받아왔습니다.`
  );
});
// 서버가 연결이 끊겼을 때
socket.addEventListener("close", () => {
  console.log("Disconnected to Server ❌");
});

// 채팅 메시지 보내기 함수
function handleSubmit(event) {
  event.preventDefault();

  const input = msgForm.querySelector("input");
  // FE 에서 BE 로 메시지 입력값을 보냄
  socket.send(makeMsg("newMsg", input.value));

  // 리스트로 만들어서 담는다
  const li = document.createElement("li");
  li.innerText = `You : ${input.value}`;
  msgList.append(li);

  // 입력값을 비워줌
  input.value = "";

  console.log(
    `"${message.data}" 라는 내용의 메시지를 서버로부터 받아왔습니다.`
  );
}

// 닉네임 보내기 함수
function handleNicknameSubmit(event) {
  event.preventDefault();

  const input = nicknameForm.querySelector("input");
  // 입장 메시지 출력
  document.querySelector("h2").innerText = `${input.value}님 입장`;

  // JSON 형태로 보내줌
  socket.send(makeMsg("nickname", input.value));
  // 입력값을 비워줌
  input.value = "";
}

msgForm.addEventListener("submit", handleSubmit);
nicknameForm.addEventListener("submit", handleNicknameSubmit);

*/
