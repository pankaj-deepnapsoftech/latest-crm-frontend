import { useContext, useRef, useEffect, useState } from "react"
import { Send, Upload } from "lucide-react"
import { SocketContext } from "../../socket";
import { useDispatch, useSelector } from 'react-redux'
import { updateChatMessages } from "../../redux/reducers/Chatsystem";
export default function Chatarea({ contacts, groups }) {
    const messagesEndRef = useRef(null)
    const socket = useContext(SocketContext);
    const [message, setMessage] = useState("");
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth);

    const { recipient, chatmessages } = useSelector(state => state.data);

    
    
    const isGroup = false;
    // const isGroup = recipient && "members" in recipient

    // useEffect(() => {
    //     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    // }, [messages]);

    useEffect(() => {
        console.log("messaging to neeraj = ", chatmessages)
        if (user.id) {
            socket.emit('register', user.id);  // Register the user on the server
        }
        // Listen for incoming messages


        socket.on('receiveMessage', async(data) => {
            await dispatch(updateChatMessages(data));
            console.log("receiveMessage = 11", data)
        });
        
        return () => {
            socket.off('receiveMessage');
        };
    }, [chatmessages]);

    const sendMessage = (e) => {
        e.preventDefault();
        console.log("sendMessage = ", recipient)
        if (recipient && message) {
            socket.emit('sendMessage', { sender: user.id, recipient: recipient?._id, message });
            
            setMessage("");  // Clear the input after sending the message
        }
    }
    
    const formatTime = (timestamp) => {
        const date = new Date(timestamp)
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    if (!recipient) {
        return (
            <div className="h-full flex justify-center items-center bg-gray-50">
                <span className="text-gray-500">Select a chat to start messaging</span>
            </div>
        )
    }

    return (
        <>
            {/* <h1>{Array.isArray(chatmessages) && chatmessages.map(msg => (
                <p key={msg._id}>{msg.message}</p>
            ))}</h1> */}
            <div className="h-full flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-white flex items-center">
                    <img
                        src="/profile.png"
                        alt={recipient?.name}
                        className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                        <div className="font-bold">{recipient?.name}</div>
                        {isGroup ? (
                            <div className="text-sm text-gray-500">{recipient?.members.length} members</div>
                        ) : (
                            <div className="text-sm text-gray-500">
                                {recipient?.status === "online" ? "Online" : "Offline"}
                            </div>
                        )}
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col">
                    <div className="flex flex-col space-y-4 flex-1">
                        {Array.isArray(chatmessages) && chatmessages.map((message, index) => {
                            const isUser = message?.sender === user?.id
                            const showDate =
                                index === 0 ||
                                new Date(message?.createdAt).toDateString() !==
                                new Date(message[index - 1]?.createdAt).toDateString()

                            return (
                                <div key={message?._id}>
                                    {showDate && (
                                        <div className="flex justify-center my-4">
                                            <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                                {new Date(message.createdAt).toLocaleDateString()}
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
                                                    {contacts.find((c) => c.id === message?.sender).name || "Unknown"}
                                                </div>
                                            )}
                                            <div>{message.message}</div>
                                            {/* share file */}
                                            {/* {msg.file && (
                                                <a href={`http://localhost:5000/${msg.file}`} target="_blank" rel="noopener noreferrer">
                                                    📎 Download File
                                                </a>
                                            )} */}

                                            <a href={`http://localhost:5000/`} target="_blank" rel="noopener noreferrer">
                                                📎 Download File
                                            </a>


                                            <div className={`text-xs ${isUser ? "text-teal-100" : "text-gray-500"} text-right mt-1`}>
                                                {formatTime(message?.createdAt)}
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
                    <form onSubmit={sendMessage} className="w-full flex items-center">
                        <label htmlFor="file-upload" className="cursor-pointer text-teal-500">
                            <img src="/file.png" alt="File Icon" className="h-10 w-10" />
                        </label>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            style={{ width: '80%', padding: '8px' }}
                            className="flex-1 p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <input
                            type="file"
                            className="hidden"
                            id="file-upload"
                        />
                        
                        <button
                            className="ml-2 p-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 focus:outline-none"
                            type="submit"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </>
        
    )
}
