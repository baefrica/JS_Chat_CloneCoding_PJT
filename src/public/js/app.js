// 사용자에게 보여지는 FE 에 사용되는 js 파일

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
