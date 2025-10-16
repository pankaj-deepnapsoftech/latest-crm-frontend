import { useContext, useRef, useEffect, useState } from "react";
import {
  Send,
  Info,
  X,
  Users,
  Crown,
  Download,
  FileText,
  Image as ImageIcon,
  Video,
  File,
} from "lucide-react";
import { SocketContext } from "../../socket";
import { useDispatch, useSelector } from "react-redux";
import { updateChatMessages } from "../../redux/reducers/Chatsystem";
export default function Groupchatarea() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const socket = useContext(SocketContext);
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth);
  const [fileData, setFileData] = useState(null);
  const fileInputRef = useRef(null); // Create a ref for the file input
  const { chatmessages, selectedGroup } = useSelector((state) => state.data);

  const [file, setFile] = useState(null);

  const baseURL = process.env.REACT_APP_IMG_URL;

  useEffect(() => {
    console.log("selectedGroup =", selectedGroup);
    if (user.id && selectedGroup?._id) {
      socket.emit("joinGroup", selectedGroup._id, user.id); // Register the user on the server
    }

    // Listen for incoming messages - ONLY for group chats
    const handleReceiveGroupMessage = async (data) => {
      console.log("group message Data = 12", data);
      // Only add message if it's for THIS specific group
      if (data.groupId && selectedGroup && data.groupId === selectedGroup._id) {
        await dispatch(updateChatMessages(data));
      }
    };

    // Listen for initial group messages load
    const handleAllGroupMessages = async (messages) => {
      // Replace all messages when loading group chat history
      await dispatch({ type: "data/addChatMessages", payload: messages });
    };

    socket.on("receiveGroupMessage", handleReceiveGroupMessage);
    socket.on("allgroupMessages", handleAllGroupMessages);

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    return () => {
      socket.off("receiveGroupMessage", handleReceiveGroupMessage);
      socket.off("allgroupMessages", handleAllGroupMessages);
    };
  }, [chatmessages, selectedGroup, user.id]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (file) {
      socket.emit("startgroupupload", {
        fileName: file.name,
        sender: user.id,
        groupId: selectedGroup._id,
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
      socket.emit("sendGroupMessage", {
        sender: user.id,
        groupId: selectedGroup._id,
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
              selectedGroup?.imageName
                ? `${baseURL}tmp/uploads/${selectedGroup.imageName}`
                : "/profile.png"
            }
            alt={selectedGroup?.groupName}
            className="w-10 h-10 rounded-full mr-3"
          />
          <div className="flex items-center justify-between w-full">
            <div>
              <div className="font-bold">{selectedGroup?.groupName}</div>
              <div className="text-sm text-gray-500">
                {selectedGroup?.participants.length} members
              </div>
            </div>
            <div className="ml-auto cursor-pointer">
              <Info onClick={() => setIsModalOpen(true)} />
            </div>
          </div>
        </div>
        {/* Messages Area */}
        <div className="flex-1 scrollbar-thin overflow-y-auto p-4 bg-gray-50 flex flex-col">
          <div className="flex flex-col space-y-4 flex-1">
            {Array.isArray(chatmessages) &&
              chatmessages.map((message, index) => {
                const isUser = message?.sender[0]?._id === user?.id;
                const showDate =
                  index === 0 ||
                  new Date(message?.createdAt).toDateString() !==
                    new Date(message[index - 1]?.createdAt).toDateString();
                return (
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
                        {!isUser && (
                          <div className="text-xs font-bold mb-1">
                            {message?.sender[0]?.name}
                          </div>
                        )}
                        {/* share file with download button */}
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
                        <div>{message.message}</div>

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
                );
              })}
            <div ref={messagesEndRef} />
          </div>
        </div>
        {/* Message Input */}
        <div className="p-4 bg-white border-t border-gray-200 items-center">
          <div style={{ marginTop: "10px" }}>{renderPreview()}</div>
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-lg w-full max-w-md p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden">
                  {/* Group Header */}

                  <div className="relative">
                    <X
                      className="cursor-pointer absolute right-[13px] top-[10px]"
                      onClick={() => setIsModalOpen(false)}
                      size={20}
                    />
                    <img
                      src={
                        selectedGroup?.imageName
                          ? `${baseURL}tmp/uploads/${selectedGroup.imageName}`
                          : "/profile.png"
                      }
                      alt={selectedGroup?.groupName}
                      className="w-full h-48 object-full"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <h1 className="text-white text-2xl font-bold">
                        {selectedGroup.groupName}
                      </h1>
                      <div className="flex items-center text-gray-200 mt-1">
                        <Users size={16} className="mr-2" />
                        <span>
                          {selectedGroup.participants.length} participants
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Participants List */}
                  <div className="p-4">
                    <h2 className="text-gray-700 font-semibold mb-4">
                      Participants
                    </h2>
                    <div className="space-y-3">
                      {selectedGroup.participants.map((participant) => (
                        <div
                          key={participant.id}
                          className="flex items-center space-x-3"
                        >
                          <div className="relative">
                            <img
                              src={
                                participant?.profileimage
                                  ? `${process.env.REACT_APP_IMAGE_URL}${participant.profileimage}`
                                  : "/profile.png"
                              }
                              alt={participant.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div
                              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
                    ${
                      participant?.status === "online"
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="font-medium text-gray-900">
                                {participant.name}
                              </span>
                              {selectedGroup.groupAdmin == participant._id && (
                                <Crown
                                  size={16}
                                  className="ml-2 text-yellow-500"
                                />
                              )}
                            </div>
                            <span className="text-sm text-gray-500 capitalize">
                              {participant?.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
