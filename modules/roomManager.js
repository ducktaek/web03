let rooms = []; // 방 목록

const createRoom = (name) => {
  if (rooms.some((room) => room.name === name)) return null; // 중복 방 이름 방지
  const newRoom = { name, participants: 0 };
  rooms.push(newRoom);
  return newRoom;
};

const joinRoom = (name) => {
  const room = rooms.find((room) => room.name === name);
  if (!room) return null;
  room.participants += 1;
  return room;
};

module.exports = { rooms, createRoom, joinRoom };
