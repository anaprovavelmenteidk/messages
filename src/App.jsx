import { useState, useEffect, use } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([])
  const [ws, setWs] = useState(null)
  const [input, setInput] = useState('')
  const [username, setUsername] = useState('')
  const [room, setRoom] = useState('')

  const connectWebSocket = () => {
    const socket = new WebSocket('ws://localhost:81')
    socket.onopen = () => {
      console.log('WebSocket connection established')
      // Send a join message
      socket.send(JSON.stringify({ type: 'join', room: room, id: username }))
    }
    socket.onmessage = (event) => {
      setMessages(prev => [...prev, event.data])
    }
    socket.onclose = () => {
      console.log('WebSocket connection closed')
    }
    socket.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
    setWs(socket)
  }


  const toggleMessages = (show) => {
    const messagesDiv = document.querySelectorAll('.App')[0]
    const roomDiv = document.querySelectorAll('.room_choice')[0]
    const usernameDiv = document.querySelectorAll('.username_choice')[0]
    if (messagesDiv && show === "change_message") {
      roomDiv.style.display = 'none'
      messagesDiv.style.display = 'block'

      connectWebSocket()
    }
    if (roomDiv && show === "change_room") {
      roomDiv.style.display = 'block'
    }
    if (usernameDiv && show) {
      usernameDiv.style.display = 'none'
    }
  }

  const sendMessage = () => {
    if (ws && ws.readyState === WebSocket.OPEN && input.trim()) {
      // Include type in the message
      const send_data = { type: 'message', id: username, message: input, room: room }
      ws.send(JSON.stringify(send_data))
      setMessages(prev => [...prev, `You: ${input}`]) // Add sent message to local state
      setInput('') // Clear input after sending
    }
  }

  return (
    <>
      <div className='username_choice'>
        <h1>Enter your username:</h1>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && toggleMessages("change_room")}
          placeholder="Username..."
        />
      </div>
      <div className='room_choice' style={{ display: 'none' }}>
        <h1>Enter room name:</h1>
        <input
          type="text"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && toggleMessages("change_message")}
          placeholder="Room name..."
        />
      </div>
      <div id="messages" className="App" style={{ display: 'none' }}>
        <h2>Messages:</h2>
        <ul>
          {messages.map((msg, i) => (
            <li key={i}>{msg}</li>
          ))}
        </ul>
        <h1>WebSocket Test</h1>
        <div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </>
  )
}

export default App
