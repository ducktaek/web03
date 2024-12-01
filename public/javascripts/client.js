const socket = io();

const myFace = document.getElementById('myFace');
const muteBtn = document.getElementById('mute');
const cameraBtn = document.getElementById('camera');
const cameraSelect = document.getElementById('cameras');
const call = document.getElementById('call');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');

let myStream;
let muted = false;
let cameraOff = false;
let roomname;
let peers = {}; // 각 사용자의 RTCPeerConnection 객체를 저장

// 채팅 기능
chatForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = chatInput.value;
  if (message.trim() === '') return;
  const timestamp = new Date().toLocaleTimeString(); // 현재 시간 가져오기
  addMessage(`You (${timestamp}): ${message}`);
  socket.emit('chat message', { message, timestamp }, roomname);
  chatInput.value = '';
});

socket.on('chat message', (data) => {
  addMessage(`${data.id} (${data.timestamp}): ${data.message}`);
});

const addMessage = (message) => {
  const messageElement = document.createElement('li');
  messageElement.textContent = message;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

// WebRTC 코드
const getCameras = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === 'videoinput');
    const currentCamera = myStream.getVideoTracks()[0];

    cameras.forEach((camera) => {
      const option = document.createElement('option');
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }
      cameraSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
};

const getMedia = async (deviceId) => {
  const constraints = deviceId
    ? { audio: true, video: { deviceId: { exact: deviceId } } }
    : { audio: true, video: { facingMode: 'user' } };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(constraints);
    myFace.srcObject = myStream;
    if (!deviceId) await getCameras();
  } catch (e) {
    console.log(e);
  }
};

call.hidden = true;

const handleMuteClick = () => {
  myStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
  muteBtn.innerText = muted ? 'Mute' : 'Unmute';
  muted = !muted;
};

const handleCameraClick = () => {
  myStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
  cameraBtn.innerText = cameraOff ? 'Turn Camera Off' : 'Turn Camera On';
  cameraOff = !cameraOff;
};

const handleCameraChange = async () => {
  await getMedia(cameraSelect.value);
  Object.values(peers).forEach((peer) => {
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = peer.getSenders().find((sender) => sender.track.kind === 'video');
    videoSender.replaceTrack(videoTrack);
  });
};

const startMedia = async () => {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
};

const welcome = document.getElementById('welcome');
const welcomeForm = welcome.querySelector('form');

welcomeForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const input = welcomeForm.querySelector('input');
  roomname = input.value;
  await startMedia();
  socket.emit('join room', roomname);
});

muteBtn.addEventListener('click', handleMuteClick);
cameraBtn.addEventListener('click', handleCameraClick);
cameraSelect.addEventListener('input', handleCameraChange);

// Socket events for WebRTC
socket.on('welcome', async (socketId) => {
  if (peers[socketId]) return; // 이미 연결된 사용자 처리 방지
  const peerConnection = makeConnection(socketId);
  const offer = await peerConnection.createOffer();
  peerConnection.setLocalDescription(offer);
  socket.emit('offer', offer, roomname, socketId);
});

socket.on('offer', async (offer, socketId) => {
  if (peers[socketId]) return; // 이미 연결된 사용자 처리 방지
  const peerConnection = makeConnection(socketId);
  peerConnection.setRemoteDescription(offer);
  const answer = await peerConnection.createAnswer();
  peerConnection.setLocalDescription(answer);
  socket.emit('answer', answer, roomname, socketId);
});

socket.on('answer', (answer, socketId) => {
  const peerConnection = peers[socketId];
  peerConnection.setRemoteDescription(answer);
});

socket.on('ice', (ice, socketId) => {
  const peerConnection = peers[socketId];
  peerConnection.addIceCandidate(ice);
});

// RTC Connection
const makeConnection = (socketId) => {
  const peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
  });

  peerConnection.addEventListener('icecandidate', (event) => {
    socket.emit('ice', event.candidate, roomname, socketId);
  });

  peerConnection.addEventListener('track', (event) => {
    addStreamToUI(event.streams[0], socketId);
  });

  myStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, myStream);
  });

  peers[socketId] = peerConnection;
  return peerConnection;
};

const addStreamToUI = (stream, socketId) => {
  if (document.getElementById(`video-${socketId}`)) return; // 중복 영상 방지
  const video = document.createElement('video');
  video.id = `video-${socketId}`;
  video.srcObject = stream;
  video.autoplay = true;
  video.playsInline = true;
  video.width = 300;
  video.height = 300;
  document.getElementById('mystream').appendChild(video);
};

socket.on('user disconnected', (socketId) => {
  const video = document.getElementById(`video-${socketId}`);
  if (video) video.remove();
  delete peers[socketId];
});
