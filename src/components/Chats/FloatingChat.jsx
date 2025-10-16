import { useState, useContext, useEffect, useRef } from 'react';
import { MessageCircle, X, Minimize2, Maximize2, Send, Download, FileText, Image as ImageIcon, Video, File } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { SocketContext } from '../../socket';
import {
  fetchData,
  addRecipient,
  addChatMessages,
  fetchGroup,
  togglechatarea,
  selectedGroupperson,
  updateChatMessages,
  clearUnreadCount,
  clearGroupUnreadCount,
  fetchUnreadCounts,
  fetchGroupUnreadCounts,
} from '../../redux/reducers/Chatsystem';
import { useCookies } from 'react-cookie';
import { notificationContext } from '../ctx/notificationContext';

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [activeView, setActiveView] = useState('list'); // 'list' or 'chat'
  
  const user = useSelector((state) => state.auth);
  const { data, chatmessages, recipient, selectedGroup, togglechat, unreadCounts, groupUnreadCounts, lastMessageTime, lastGroupMessageTime } = useSelector((state) => state.data);
  const socket = useContext(SocketContext);
  const dispatch = useDispatch();
  const [cookies] = useCookies();
  const messagesEndRef = useRef(null);
  const baseURL = process.env.REACT_APP_IMG_URL;
  const notificationCtx = useContext(notificationContext);

  // Sort users by last message time (latest first)
  const sortedUsers = Array.isArray(data) ? [...data].sort((a, b) => {
    const timeA = lastMessageTime[a._id] ? new Date(lastMessageTime[a._id]).getTime() : 0;
    const timeB = lastMessageTime[b._id] ? new Date(lastMessageTime[b._id]).getTime() : 0;
    return timeB - timeA;
  }) : [];

  // Fetch users and groups on mount
  useEffect(() => {
    const token = cookies?.access_token;
    if (token && user?.id) {
      dispatch(fetchData({ userid: user.id, token }));
      dispatch(fetchGroup({ adminId: user.id, token }));
      dispatch(fetchUnreadCounts({ userId: user.id, token }));
      dispatch(fetchGroupUnreadCounts({ userId: user.id, token }));
    }
  }, [user?.id, cookies, dispatch]);

  // Socket listeners
  useEffect(() => {
    if (!user?.id) return;

    const handleReceiveMessage = async (data) => {
      if (!data.groupId && recipient && 
          ((data.sender === user.id && data.recipient === recipient._id) || 
           (data.sender === recipient._id && data.recipient === user.id))) {
        await dispatch(updateChatMessages(data));
      }
    };

    const handleReceiveGroupMessage = async (data) => {
      if (data.groupId && selectedGroup && data.groupId === selectedGroup._id) {
        await dispatch(updateChatMessages(data));
      }
    };

    const handleAllMessages = async (messages) => {
      await dispatch({ type: 'data/addChatMessages', payload: messages });
    };

    const handleAllGroupMessages = async (messages) => {
      await dispatch({ type: 'data/addChatMessages', payload: messages });
    };

    // ✅ Listen for notification updates
    const handleNotificationUpdate = async () => {
      console.log("FloatingChat: Notification update received");
      // Refresh unread counts
      const token = cookies?.access_token;
      if (token) {
        await dispatch(fetchUnreadCounts({ userId: user.id, token }));
        await dispatch(fetchGroupUnreadCounts({ userId: user.id, token }));
        // Update notification context count
        notificationCtx.getUnseenchatNotificationCount();
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('receiveGroupMessage', handleReceiveGroupMessage);
    socket.on('allMessages', handleAllMessages);
    socket.on('allgroupMessages', handleAllGroupMessages);
    socket.on('sendNotification', handleNotificationUpdate);
    socket.on('newNotification', handleNotificationUpdate);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('receiveGroupMessage', handleReceiveGroupMessage);
      socket.off('allMessages', handleAllMessages);
      socket.off('allgroupMessages', handleAllGroupMessages);
      socket.off('sendNotification', handleNotificationUpdate);
      socket.off('newNotification', handleNotificationUpdate);
    };
  }, [socket, user.id, recipient, selectedGroup, dispatch, cookies, notificationCtx]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatmessages]);

  const openChat = async (chatUser) => {
    await dispatch(addRecipient(chatUser));
    await dispatch(togglechatarea('onetoonechat'));
    socket.emit('getMessages', { user1: user.id, user2: chatUser._id });
    socket.emit('markAsRead', { userId: user.id, otherUserId: chatUser._id });
    dispatch(clearUnreadCount(chatUser._id));
    setActiveView('chat');
  };

  const openGroupChat = async (group) => {
    await dispatch(togglechatarea('groupchat'));
    await dispatch(selectedGroupperson(group));
    socket.emit('getgroupMessages', group._id);
    socket.emit('markGroupAsRead', { userId: user.id, groupId: group._id });
    dispatch(clearGroupUnreadCount(group._id));
    setActiveView('chat');
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (togglechat === 'onetoonechat') {
      socket.emit('sendMessage', {
        sender: user.id,
        sendername: user.name,
        recipient: recipient._id,
        message,
      });
    } else if (togglechat === 'groupchat') {
      socket.emit('sendGroupMessage', {
        sender: user.id,
        groupId: selectedGroup._id,
        message,
      });
    }
    setMessage('');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const goBackToList = () => {
    setActiveView('list');
  };

  // Use actual chat notification count from notificationContext
  const totalUnreadCount = notificationCtx.unseenchatNotifications || 0;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-teal-500 text-white rounded-full p-4 shadow-lg hover:bg-teal-600 transition-all z-50"
      >
        <MessageCircle size={24} />
        {totalUnreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
            {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 transition-all ${
        isMinimized ? 'w-80 h-14' : 'w-96 h-[600px]'
      }`}
    >
      {/* Header */}
      <div className="bg-teal-500 text-white p-3 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle size={20} />
          <span className="font-semibold">
            {activeView === 'chat' 
              ? (togglechat === 'onetoonechat' ? recipient?.name : selectedGroup?.groupName)
              : 'Messages'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {activeView === 'chat' && (
            <button
              onClick={goBackToList}
              className="hover:bg-teal-600 p-1 rounded"
              title="Back to list"
            >
              ←
            </button>
          )}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-teal-600 p-1 rounded"
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-teal-600 p-1 rounded"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {activeView === 'list' ? (
            // Chat List View
            <div className="h-[calc(100%-56px)] overflow-y-auto">
              <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Direct Messages</h3>
                {sortedUsers.map((chatUser) => {
                  const unreadCount = unreadCounts?.[chatUser._id] || 0;
                  return (
                    <div
                      key={chatUser._id}
                      onClick={() => openChat(chatUser)}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer mb-1"
                    >
                      <img
                        src={chatUser?.profileimage ? `${process.env.REACT_APP_IMAGE_URL}${chatUser.profileimage}` : '/profile.png'}
                        alt={chatUser?.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm truncate ${unreadCount > 0 ? 'font-bold' : ''}`}>
                            {chatUser?.name}
                          </span>
                          {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // Chat View
            <>
              <div className="h-[calc(100%-112px)] overflow-y-auto p-3 bg-gray-50">
                {Array.isArray(chatmessages) && chatmessages.map((msg) => {
                  const isUser = togglechat === 'onetoonechat' 
                    ? msg.sender === user.id 
                    : msg.sender?.[0]?._id === user.id;

                  return (
                    <div key={msg._id} className={`mb-3 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] p-2 rounded-lg ${isUser ? 'bg-teal-500 text-white' : 'bg-white text-black shadow-sm'}`}>
                        {!isUser && togglechat === 'groupchat' && (
                          <div className="text-xs font-bold mb-1">{msg?.sender?.[0]?.name}</div>
                        )}
                        {msg.file && (
                          <div className="text-xs mb-1">
                            📎 {msg.fileName}
                          </div>
                        )}
                        <div className="text-sm">{msg.message}</div>
                        <div className={`text-xs mt-1 ${isUser ? 'text-teal-100' : 'text-gray-500'}`}>
                          {formatTime(msg.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="p-3 border-t border-gray-200 bg-white">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 p-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="submit"
                    className="bg-teal-500 text-white p-2 rounded-full hover:bg-teal-600 transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </>
          )}
        </>
      )}
    </div>
  );
}
