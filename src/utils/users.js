const users = [];

const addUser = ({ id, username, room }) => {
  strimmedUsername = username.trim().toLowerCase();
  strimmedRoom = room.trim().toLowerCase();

  if (!username || !room) {
    return {
      error: "Username and room are required!"
    };
  }
  const existingUser = users.find(user => {
    return user.room === strimmedRoom && user.username === strimmedUsername;
  });
  if (existingUser) {
    return {
      error: "Username is in used"
    };
  }
  const newuser = { id, username, room };
  users.push(newuser);
  return { user: newuser };
};

const removeUser = userId => {
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex !== -1) {
    return users.splice(userIndex, 1)[0];
  }
};

const getUser = userId => {
  return users.find(user => user.id === userId);
};

const getUsersInRoom = room => {
  return users.filter(
    user => user.room.trim().toLowerCase() === room.trim().toLowerCase()
  );
};

// TODO: Unit testing
/* 
addUser({ id: 1, username: "Hana", room: "Chitchat" });
addUser({ id: 2, username: "Tony", room: "Chitchat" });
addUser({ id: 3, username: "David", room: "Chitchat" });
addUser({ id: 4, username: "Susan", room: "Chitchat" });
addUser({ id: 5, username: "Sunny", room: "Demo" });
addUser({ id: 6, username: "Sam", room: "Demo" });
console.log({ removedUser: removeUser(4) });
console.log(users);
console.log({ chosenUser: getUser(1) });
console.log({ users: getUsersInRoom("Demo") }); */

module.exports = { addUser, getUser, getUsersInRoom, removeUser };
