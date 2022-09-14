const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelectorAll('.chat-messages');
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')

const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});


console.log({username, room})

const socket = io()

// join chatroom
socket.emit('joinRoom', { username, room })

// get room and its users
socket.on('roomUsers', ({ room, users}) => {
    outputRoomName(room);
    outputUsers(users);
})

// message from server
socket.on('message', (message) => {
    console.log(message)    
    outputMessage(message);
    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
})


// message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let msg = e.target.elements.msg.value;
    msg = msg.trim()

    if (!msg) {
        return false
    }

    socket.emit('chatMessage', msg)

    e.target.elements.msg.value = ''
    e.target.elements.msg.focus()
})

// display new message
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    const p = document.createElement('p');
    p.classList.add('meta');
    p.innerText = message.username;
    p.innerHTML += `<span>${message.time}</span>`;
    div.appendChild(p);
    const para = document.createElement('p');
    para.classList.add('text');
    para.innerText = message.text;
    div.appendChild(para);
    document.querySelector('.chat-messages').appendChild(div);
}

// display room name
function outputRoomName(room) {
    roomName.innerText = room;
}

// display Users
function outputUsers(users) {
    console.log({users})
    userList.innerHTML = ''
    users.forEach((user) => {
        const li = document.createElement('li');
        li.innerText = user.username;
        userList.appendChild(li)
    })
}

// user leave chat confirm prompt
document.getElementById('leave-btn').addEventListener('click', () => {
    const leaveRoom = confirm('Are you sure you want to leave?')
    if (leaveRoom) {
        window.location = '../index.html'
    }
})


