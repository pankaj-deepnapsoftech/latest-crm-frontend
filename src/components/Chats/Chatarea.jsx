import { useContext, useRef, useEffect, useState } from "react";
import {
  Send,
  Download,
  FileText,
  Image as ImageIcon,
  Video,
  File,
} from "lucide-react";
import { SocketContext } from "../../socket";
import { useDispatch, useSelector } from "react-redux";
import { updateChatMessages } from "../../redux/reducers/Chatsystem";
export default function Chatarea() {
  const messagesEndRef = useRef(null);
  const socket = useContext(SocketContext);
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth);
  const [fileData, setFileData] = useState(null);
  const fileInputRef = useRef(null); // Create a ref for the file input
  const { recipient, chatmessages } = useSelector((state) => state.data);
  const baseURL = process.env.REACT_APP_IMG_URL;
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (user.id) {
      socket.emit("register", user.id); // Register the user on the server
    }

    // Listen for incoming messages - ONLY for one-to-one chats
    const handleReceiveMessage = async (data) => {
      // Only add message if it's a one-to-one chat (no groupId)
      // AND it's between current user and recipient
      if (
        !data.groupId &&
        recipient &&
        ((data.sender === user.id && data.recipient === recipient._id) ||
          (data.sender === recipient._id && data.recipient === user.id))
      ) {
        await dispatch(updateChatMessages(data));
      }
    };

    // Listen for initial messages load
    const handleAllMessages = async (messages) => {
      // Replace all messages when loading chat history
      await dispatch({ type: "data/addChatMessages", payload: messages });
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("allMessages", handleAllMessages);

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("allMessages", handleAllMessages);
    };
  }, [chatmessages, recipient, user.id]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (file) {
      socket.emit("start upload", {
        fileName: file.name,
        sender: user.id,
        recipient: recipient?._id,
        message,
      });

      const stream = file.stream();
      const reader = stream.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        socket.emit("file chunk", value);
      }
      socket.emit("file chunk end");
    } else {
      socket.emit("sendMessage", {
        sender: user.id,
        sendername: user.name,
        recipient: recipient?._id,
        message,
      });
    }
    setMessage("");
    handleRemove();
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Download file handler - FIXED to actually download instead of opening in new tab
  const handleDownload = async (fileUrl, fileName) => {
    try {
      const fileFullUrl = `${baseURL}tmp/${fileUrl}`;

      // Fetch the file
      const response = await fetch(fileFullUrl);
      const blob = await response.blob();

      // Create blob URL
      const blobUrl = window.URL.createObjectURL(blob);

      // Create temporary link and trigger download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName || "download";
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up blob URL
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download error:", error);
      // Fallback: open in new tab if download fails
      window.open(`${baseURL}tmp/${fileUrl}`, "_blank");
    }
  };

  // Get file icon based on file type
  const getFileIcon = (fileName) => {
    if (!fileName) return <File size={20} />;

    const ext = fileName.split(".").pop().toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext)) {
      return <ImageIcon size={20} />;
    } else if (["mp4", "avi", "mov", "wmv", "mkv"].includes(ext)) {
      return <Video size={20} />;
    } else if (["pdf"].includes(ext)) {
      return <FileText size={20} />;
    } else {
      return <File size={20} />;
    }
  };

  // Check if file is an image
  const isImageFile = (fileName) => {
    if (!fileName) return false;
    const ext = fileName.split(".").pop().toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFile(file);
    const fileType = file.type;

    if (fileType.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileData({ type: "image", content: reader.result, name: file.name });
      };
      reader.readAsDataURL(file);
    } else if (fileType.startsWith("video/")) {
      const videoURL = URL.createObjectURL(file);
      setFileData({ type: "video", content: videoURL, name: file.name });
    } else if (fileType === "application/pdf") {
      const pdfURL = URL.createObjectURL(file);
      setFileData({ type: "pdf", content: pdfURL, name: file.name });
    } else {
      // For other types, just display name and size
      setFileData({ type: "other", name: file.name, size: file.size });
    }
  };

  const renderPreview = () => {
    if (!fileData) return null;

    switch (fileData.type) {
      case "image":
        return (
          <div className="relative inline-block">
            <img
              src={fileData.content}
              alt="Preview"
              className="max-w-[120px] max-h-[120px] object-cover rounded border border-gray-300"
            />
            <button
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
              title="Remove"
            >
              ✕
            </button>
          </div>
        );
      case "video":
        return (
          <div className="relative inline-block">
            <video
              width="200"
              height="150"
              controls
              className="rounded border border-gray-300"
            >
              <source src={fileData.content} />
              Your browser does not support the video tag.
            </video>
            <button
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
              title="Remove"
            >
              ✕
            </button>
          </div>
        );
      case "pdf":
        return (
          <div className="bg-gray-100 p-3 rounded border border-gray-300 max-w-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={24} className="text-red-500" />
                <span className="text-sm font-medium truncate">
                  {fileData.name}
                </span>
              </div>
              <button
                onClick={handleRemove}
                className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 flex-shrink-0"
                title="Remove"
              >
                ✕
              </button>
            </div>
          </div>
        );
      case "other":
        return (
          <div className="bg-gray-100 p-3 rounded border border-gray-300 max-w-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <File size={24} className="text-gray-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {fileData.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(fileData.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemove}
                className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 flex-shrink-0 ml-2"
                title="Remove"
              >
                ✕
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleRemove = () => {
    setFileData(null);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 bg-white flex items-center">
          <img
            src={
              recipient?.profileimage
                ? `${process.env.REACT_APP_IMAGE_URL}${recipient.profileimage}`
                : "/profile.png"
            }
            alt={recipient?.name}
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <div className="font-bold">{recipient?.name}</div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 scrollbar-thin overflow-y-auto p-4 bg-gray-50 flex flex-col">
          <div className="flex flex-col space-y-4 flex-1">
            {Array.isArray(chatmessages) &&
              chatmessages.map((message, index) => {
                const isUser = message?.sender === user?.id;
                const showDate =
                  index === 0 ||
                  new Date(message?.createdAt).toDateString() !==
                    new Date(message[index - 1]?.createdAt).toDateString();

                return message.sender === recipient._id ||
                  message.recipient === recipient._id ? (
                  <div key={message?._id}>
                    {showDate && (
                      <div className="flex justify-center my-4">
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div
                      className={`flex ${
                        isUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                          isUser
                            ? "bg-teal-500 text-white"
                            : "bg-white text-black"
                        }`}
                      >
                        {message.file && (
                          <div
                            className={`mb-2 p-2 rounded ${
                              isUser ? "bg-teal-600" : "bg-gray-100"
                            }`}
                          >
                            {/* Show image preview if it's an image */}
                            {isImageFile(message.fileName) && (
                              <img
                                src={`${baseURL}tmp/${message.file}`}
                                alt={message.fileName}
                                className="max-w-full h-auto rounded mb-2 max-h-64 object-contain"
                              />
                            )}

                            {/* File info and download button */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span
                                  className={
                                    isUser ? "text-white" : "text-teal-600"
                                  }
                                >
                                  {getFileIcon(message.fileName)}
                                </span>
                                <span className="text-sm truncate">
                                  {message.fileName}
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  handleDownload(message.file, message.fileName)
                                }
                                className={`flex items-center gap-1 px-3 py-1 rounded transition-colors ${
                                  isUser
                                    ? "bg-white text-teal-600 hover:bg-teal-50"
                                    : "bg-teal-500 text-white hover:bg-teal-600"
                                }`}
                                title="Download file"
                              >
                                <Download size={16} />
                                <span className="text-xs font-medium">
                                  Download
                                </span>
                              </button>
                            </div>
                          </div>
                        )}
                        <div> {message.message}</div>
                        <div
                          className={`text-xs ${
                            isUser ? "text-teal-100" : "text-gray-500"
                          } text-right mt-1`}
                        >
                          {formatTime(message?.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null;
              })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 bg-white border-t border-gray-200 items-center">
          <div style={{ marginTop: "20px" }}>{renderPreview()}</div>

          <form onSubmit={sendMessage} className="w-full flex items-center">
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-teal-500"
            >
              <img src="/file.png" alt="File Icon" className="h-10 w-10" />
            </label>
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ width: "80%", padding: "8px" }}
              className="flex-1 p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <input
              type="file"
              className="hidden"
              id="file-upload"
              onChange={handleFileChange}
              ref={fileInputRef} // Create a ref to the file input
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
  );
}
