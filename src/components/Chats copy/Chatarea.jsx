import { useContext, useRef, useEffect, useState } from "react"
import { Send } from "lucide-react"
import { SocketContext } from "../../socket";
export default function Chatarea({ selectedChat, contacts, groups, onSendMessage }) {
    const messagesEndRef = useRef(null)
    const socket = useContext(SocketContext);
    const [username, setUsername] = useState('');
    const [recipient, setRecipient] = useState('');
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');


    const currentChat = selectedChat
        ? contacts.find((c) => c.id === selectedChat) || groups.find((g) => g.id === selectedChat)
        : null

    const isGroup = currentChat && "members" in currentChat

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages]);


    useEffect(() => {
        if (username) {
            socket.emit('register', username);  // Register the user on the server
        }

        // Listen for incoming messages
        socket.on('receiveMessage', (data) => {
            setMessages((prevMessages) => [
                ...prevMessages,
                { sender: data.sender, message: data.message },
            ]);
        });

        // Listen for all messages between two users
        socket.on('allMessages', (data) => {
            setMessages(data);
        });

        return () => {
            socket.off('receiveMessage');
            socket.off('allMessages');
        };
    }, [username]);


    const sendMessage = () => {
        if (recipient.trim() !== '' && message.trim() !== '') {
            socket.emit('sendMessage', { sender: username, recipient, message });
            setMessage('');  // Clear the input after sending the message
        }
    };

    const fetchMessages = (clickedUser) => {
        // Fetch all messages between the logged-in user and the clicked user
        socket.emit('getMessages', { user1: username, user2: clickedUser });
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp)
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    if (!selectedChat) {
        return (
            <div className="h-full flex justify-center items-center bg-gray-50">
                <span className="text-gray-500">Select a chat to start messaging</span>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white flex items-center">
                <img
                    src={currentChat?.avatar || "/placeholder.svg"}
                    alt={currentChat?.name}
                    className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                    <div className="font-bold">{currentChat?.name}</div>
                    {isGroup ? (
                        <div className="text-sm text-gray-500">{currentChat.members.length} members</div>
                    ) : (
                        <div className="text-sm text-gray-500">
                            {currentChat?.status === "online" ? "Online" : "Offline"}
                        </div>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col">
                <div className="flex flex-col space-y-4 flex-1">
                    {messages.map((message, index) => {
                        const isUser = message.sender === "me"
                        const showDate =
                            index === 0 ||
                            new Date(message.timestamp).toDateString() !==
                            new Date(messages[index - 1].timestamp).toDateString()

                        return (
                            <div key={message.id}>
                                {showDate && (
                                    <div className="flex justify-center my-4">
                                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                            {new Date(message.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                                <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                                    <div
                                        className={`max-w-[70%] p-3 rounded-lg shadow-sm ${isUser ? "bg-teal-500 text-white" : "bg-white text-black"
                                            }`}
                                    >
                                        {!isUser && isGroup && (
                                            <div className="text-xs font-bold mb-1">
                                                {contacts.find((c) => c.id === message.sender)?.name || "Unknown"}
                                            </div>
                                        )}
                                        <div>{message.content}</div>
                                        <div className={`text-xs ${isUser ? "text-teal-100" : "text-gray-500"} text-right mt-1`}>
                                            {formatTime(message.timestamp)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200 flex items-center">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={{ width: '80%', padding: '8px' }}
                    className="flex-1 p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                    className="ml-2 p-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 focus:outline-none"
                    onClick={sendMessage}
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    )
}
