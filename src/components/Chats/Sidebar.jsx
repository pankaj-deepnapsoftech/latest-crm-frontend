import { useContext, useEffect, useState } from "react";
import { Users, MessageSquare, Plus, X } from "lucide-react";
import {
  fetchData,
  createGroupForm,
  addRecipient,
  addChatMessages,
  fetchGroup,
  togglechatarea,
  selectedGroupperson,
  fetchUnreadCounts,
  fetchGroupUnreadCounts,
  clearUnreadCount,
  clearGroupUnreadCount,
  updateUnreadCount,
  updateGroupUnreadCount,
} from "../../redux/reducers/Chatsystem";
import { useDispatch, useSelector } from "react-redux";
import { useCookies } from "react-cookie";
import Select from "react-select";
import { SocketContext } from "../../socket";

export default function Sidebar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [file, setFile] = useState(null);

  const user = useSelector((state) => state.auth);
  const socket = useContext(SocketContext);
  const dispatch = useDispatch();
  const [cookies] = useCookies();
  const baseURL = process.env.REACT_APP_IMG_URL;
  const handleCreateGroup = () => {
    const token = cookies?.access_token;
    if (token) {
      const formData = new FormData();
      console.log("user.id = ", user.id);
      const updatedMembers = [...selectedMembers, user.id];
      formData.append("image", file);
      formData.append("groupName", groupName);
      formData.append("groupAdmin", user.id);
      formData.append("selectedMembers", updatedMembers);
      dispatch(createGroupForm({ groupData: formData, token }));
      dispatch(fetchGroup({ adminId: user.id, token }));
    }
    setGroupName("");
    setSelectedMembers([]);
    setIsModalOpen(false);
  };

  const { data, status, error, groupPerson, unreadCounts, groupUnreadCounts, lastMessageTime, lastGroupMessageTime } =
    useSelector((state) => state.data);

  // Sort users by last message time (latest first)
  const sortedUsers = Array.isArray(data) ? [...data].sort((a, b) => {
    const timeA = lastMessageTime[a._id] ? new Date(lastMessageTime[a._id]).getTime() : 0;
    const timeB = lastMessageTime[b._id] ? new Date(lastMessageTime[b._id]).getTime() : 0;
    return timeB - timeA; // Latest first
  }) : [];

  // Sort groups by last message time (latest first)
  const sortedGroups = Array.isArray(groupPerson) ? [...groupPerson].sort((a, b) => {
    const timeA = lastGroupMessageTime[a._id] ? new Date(lastGroupMessageTime[a._id]).getTime() : 0;
    const timeB = lastGroupMessageTime[b._id] ? new Date(lastGroupMessageTime[b._id]).getTime() : 0;
    return timeB - timeA; // Latest first
  }) : [];

  const getusermessage = async (clickedUser) => {
    // First set the recipient and toggle to one-to-one chat
    await dispatch(addRecipient(clickedUser));
    await dispatch(togglechatarea("onetoonechat"));

    // Fetch all messages between the logged-in user and the clicked user
    socket.emit("getMessages", { user1: user.id, user2: clickedUser?._id });

    // Mark messages as read
    socket.emit("markAsRead", {
      userId: user.id,
      otherUserId: clickedUser?._id,
    });
    dispatch(clearUnreadCount(clickedUser?._id));
  };

  const getgroupmessage = async (clickedgroup) => {
    // First set the group and toggle to group chat
    await dispatch(togglechatarea("groupchat"));
    await dispatch(selectedGroupperson(clickedgroup));

    console.log("user clicked", clickedgroup);
    socket.emit("getgroupMessages", clickedgroup._id);

    // Mark group messages as read
    socket.emit("markGroupAsRead", {
      userId: user.id,
      groupId: clickedgroup._id,
    });
    dispatch(clearGroupUnreadCount(clickedgroup._id));
  };

  useEffect(() => {
    const token = cookies?.access_token;
    if (token) {
      dispatch(fetchData({ userid: user.id, token }));
      dispatch(fetchUnreadCounts({ userId: user.id, token }));
    }
  }, [dispatch, cookies, user]);

  useEffect(() => {
    console.log("groupPerson", user.id);
    const token = cookies?.access_token;
    if (token) {
      dispatch(fetchGroup({ adminId: user.id, token }));
      dispatch(fetchGroupUnreadCounts({ userId: user.id, token }));
    }
  }, []);

  // Listen for new messages to update unread counts
  useEffect(() => {
    const handleReceiveMessage = (message) => {
      const token = cookies?.access_token;
      if (token && message.sender !== user.id) {
        dispatch(fetchUnreadCounts({ userId: user.id, token }));
      }
    };

    const handleReceiveGroupMessage = (message) => {
      const token = cookies?.access_token;
      if (token && message.sender?.[0]?._id !== user.id) {
        dispatch(fetchGroupUnreadCounts({ userId: user.id, token }));
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("receiveGroupMessage", handleReceiveGroupMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("receiveGroupMessage", handleReceiveGroupMessage);
    };
  }, [socket, user.id, cookies, dispatch]);

  const handleSelect = (selectedOptions) => {
    // setSelectedMembers(selectedOptions)
    const values = selectedOptions
      ? selectedOptions.map((opt) => opt.value)
      : [];
    setSelectedMembers(values);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const options = Array.isArray(data)
    ? data.map((user) => ({
        value: user._id,
        label: user.name,
      }))
    : [];

  return (
    <>
      <div className="w-full md:w-[300px] h-full bg-white border-r border-gray-200 p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">Chats</span>
            <button
              className="px-2 py-1 text-sm bg-teal-500 text-white rounded flex items-center"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={16} className="mr-1" />
              New Group
            </button>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center mb-2">
              <Users size={18} className="mr-2" />
              <span className="font-medium">Groups</span>
            </div>
            <div className="flex flex-col space-y-2 overflow-y-scroll max-h-[24vh] scrollbar-thin">
              {sortedGroups.map((group) => {
                const unreadCount = groupUnreadCounts[group._id] || 0;
                return (
                  <div
                    key={group._id || group.id}
                    className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-50 relative
                                        }`}
                    onClick={() => getgroupmessage(group)}
                  >
                    <img
                      src={
                        group?.imageName
                          ? `${baseURL}tmp/uploads/${group.imageName}`
                          : "/profile.png"
                      }
                      alt={group?.groupName}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <span className={unreadCount > 0 ? "font-semibold" : ""}>
                      {group?.groupName}
                    </span>
                    {unreadCount > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                    {/* <span className="ml-auto text-xs text-gray-500">
                      {group?.participants?.length || 0} members
                    </span>f */}
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <div className="flex items-center mb-2">
              <MessageSquare size={18} className="mr-2" />
              <span className="font-medium">Direct Messages</span>
            </div>
            <div className="overflow-y-scroll max-h-[41vh] flex flex-col space-y-2 scrollbar-thin">
              {status === "succeeded" &&
                sortedUsers.map((chatUser) => {
                  const unreadCount = unreadCounts[chatUser._id] || 0;
                  return (
                    <div
                      key={chatUser?._id}
                      className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-50 relative`}
                      onClick={() => getusermessage(chatUser)}
                    >
                      <img
                        src={
                          chatUser?.profileimage
                            ? `${process.env.REACT_APP_IMAGE_URL}${chatUser.profileimage}`
                            : "/profile.png"
                        }
                        alt={chatUser?.name || "User"}
                        className="w-8 h-8 rounded-full mr-2"
                      />

                      <span className={unreadCount > 0 ? "font-semibold" : ""}>
                        {chatUser?.name}
                      </span>
                      {unreadCount > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                      <div
                        className={`ml-auto w-2 h-2 rounded-full ${
                          chatUser?.isOnline == true
                            ? "bg-green-400"
                            : "bg-gray-300"
                        }`}
                      />
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Create New Group</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2">Group Name</label>
                  <input
                    type="text"
                    placeholder="Enter group name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                <div>
                  <label className="block mb-2">Group Image</label>
                  <input
                    className="w-full p-2 border border-gray-300 rounded"
                    type="file"
                    onChange={handleFileChange}
                  />
                </div>

                <div>
                  <label className="block mb-2">Select Members</label>
                  <div className="space-y-2">
                    <Select
                      onChange={handleSelect}
                      closeMenuOnSelect={false}
                      isMulti
                      options={options}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 space-x-2">
                <button
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className={`px-4 py-2 bg-teal-500 text-white rounded ${
                    !groupName.trim() || selectedMembers.length === 0
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-teal-600"
                  }`}
                  onClick={handleCreateGroup}
                  disabled={!groupName.trim() || selectedMembers.length === 0}
                >
                  Create Group
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
