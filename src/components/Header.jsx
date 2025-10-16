import { Avatar } from "@chakra-ui/react";
import logo from "../assets/images/logo/logo.png";
import { useContext, useEffect, useState } from "react";
import UserDetailsMenu from "./ui/Modals/UserDetailsMenu";
import { useDispatch, useSelector } from "react-redux";
import { userNotExists } from "../redux/reducers/auth";
import { Link, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import ClickMenu from "./ui/ClickMenu";
import { IoIosNotifications } from "react-icons/io";
import Loading from "./ui/Loading";
// import { fetchData, createGroupForm, addRecipient, addChatMessages, fetchGroup, togglechatarea, selectedGroupperson } from "../../redux/reducers/Chatsystem";
import {
  closeAddLeadsDrawer,
  closeNotificationsShowDetailsLeadsDrawer,
  closeShowDetailsLeadsDrawer,
  openNotificationsShowDetailsLeadsDrawer,
  openShowDetailsLeadsDrawer,
} from "../redux/reducers/misc";
import LeadsDetailsDrawer from "./ui/Drawers/Details Drawers/LeadsDetailsDrawer";
import IndiamartLeadDetails from "./ui/Drawers/Details Drawers/IndiamartLeadDetails";
import LeadsDrawer from "./ui/Drawers/Add Drawers/LeadsDrawer";
import { notificationContext } from "./ctx/notificationContext";
import { SocketContext } from "../socket";

const Header = () => {
  const socket = useContext(SocketContext);
  const [showUserDetailsMenu, setShowUserDetailsMenu] = useState(false);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [cookies, , removeCookie] = useCookies();
  const user = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [unseenNotifications, setUnseenNotifications] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [dataId, setDataId] = useState();
  const [isIndiamartLead, setIsIndiamartLead] = useState(false);
  const baseURL = process.env.REACT_APP_BACKEND_URL;
  const notificationCtx = useContext(notificationContext);

  const { showNotificationsDetailsLeadsDrawerIsOpened } = useSelector(
    (state) => state.misc
  );

  const toggleUserDetailsMenu = () => {
    setShowUserDetailsMenu((prev) => !prev);
  };

  const toggleNotificationsMenu = () => {
    setShowNotificationsMenu((prev) => !prev);
  };

  const logoutHandler = () => {
    if (cookies.access_token !== undefined) {
      changeOnlineStatus(false);
      removeCookie("access_token");
    }
    dispatch(userNotExists());
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const changeOnlineStatus = async (status) => {
    try {
      const response = await fetch(`${baseURL}chat/changestatus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, userId: user.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }
      const data = await response.json();
      console.log("Status updated successfully:", data);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  useEffect(() => {
    notificationCtx.getNotifications();

    // Register user for receiving personal notifications
    if (user?.id) {
      socket.emit("register", user.id);
      console.log("User registered for notifications:", user.id);
    }

    // Register notification listeners inside useEffect with cleanup
    const handleSendNotification = async (data) => {
      console.log("New one-to-one notification arrived:", data);
      
      // Show toast for one-to-one messages
      if (data.sender && data.sender !== user.id) {
        toast.info("You have a new message!");
      }
      
      // Refresh notification count
      notificationCtx.getChatNotificationsHandler(user.id);
      notificationCtx.getUnseenchatNotificationCount();
    };

    const handleNewNotification = async (data) => {
      console.log("Group message notification:", data);
      const { notification, groupName, senderName, fileName } = data;

      // Show toast notification
      if (fileName) {
        toast.info(`${senderName} sent a file in ${groupName}`);
      } else {
        toast.info(`New message in ${groupName} from ${senderName}`);
      }

      // Refresh notifications
      notificationCtx.getChatNotificationsHandler(user.id);
      notificationCtx.getUnseenchatNotificationCount();
    };

    socket.on("sendNotification", handleSendNotification);
    socket.on("newNotification", handleNewNotification);

    // Cleanup listeners on unmount
    return () => {
      socket.off("sendNotification", handleSendNotification);
      socket.off("newNotification", handleNewNotification);
    };
  }, [user]);

  useEffect(() => {
    notificationCtx.getChatNotificationsHandler(user.id);
    notificationCtx.getUnseenchatNotificationCount();
  }, []);

  useEffect(() => {
    if (showNotificationsMenu) {
      notificationCtx.seenNotificationHandler();
    }
  }, [showNotificationsMenu]);

  useEffect(() => {
    socket.on("NEW_SUPPORT_QUERY", (data) => {
      toast.info(data);
      notificationCtx.getUnseenNotificationsHandler();
    });

    // socket.on("NEW_MESSAGE_NOTIFICATION", (data) => {
    //   toast.info(data);
    // notificationCtx.getChatNotificationsHandler(user.id);
    // });

    socket.on("SUPPORT_QUERY_ASSIGNED", (data) => {
      toast.info(data);
      notificationCtx.getUnseenNotificationsHandler();
    });
    socket.on("NEW_FOLLOWUP_LEAD", (data) => {
      toast.info(data);
      notificationCtx.getUnseenNotificationsHandler();
    });
    socket.on("NEW_ASSIGNED_LEAD", (data) => {
      toast.info(data);
      notificationCtx.getUnseenNotificationsHandler();
    });

    return () => {
      socket.off("NEW_SUPPORT_QUERY", (data) => {
        toast.info(data);
        notificationCtx.getUnseenNotificationsHandler();
      });
      socket.off("SUPPORT_QUERY_ASSIGNED", (data) => {
        toast.info(data);
        notificationCtx.getUnseenNotificationsHandler();
      });
      socket.off("NEW_FOLLOWUP_LEAD", (data) => {
        toast.info(data);
        notificationCtx.getUnseenNotificationsHandler();
      });
      socket.off("NEW_ASSIGNED_LEAD", (data) => {
        toast.info(data);
        notificationCtx.getUnseenNotificationsHandler();
      });
    };
  }, []);

  // const getusermessage = async (clickedUser) => {
  //   // Fetch all messages between the logged-in user and the clicked user
  //   socket.emit('getMessages', { user1: user.id, user2: clickedUser?.sender });
  //   // // Listen for all messages between two users
  //   socket.on('allMessages', async (data) => {
  //       await dispatch(addChatMessages(data));
  //   });
  //   try {
  //     const response = await fetch(`${baseURL}chat/getuser/${user.id}`, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to update status');
  //     }

  //     const data = await response.json();
  //     await dispatch(addRecipient(data.admins));
  //     await dispatch(togglechatarea('onetoonechat'));

  //     navigate('/chats');
  //   } catch (error) {
  //     console.error('Error updating status:', error);
  //   }
  // };

  return (
    <div className="relative flex justify-between items-center py-2 px-3">
      {/* {showNotificationsDetailsLeadsDrawerIsOpened && (
        <ClickMenu
          top={0}
          right={0}
          closeContextMenuHandler={() =>
            dispatch(closeNotificationsShowDetailsLeadsDrawer())
          }
        >
          {dataId && (
            <>
              {!isIndiamartLead && (
                <LeadsDetailsDrawer
                  dataId={dataId}
                  closeDrawerHandler={() =>
                    dispatch(closeNotificationsShowDetailsLeadsDrawer())
                  }
                />
              )}
              {isIndiamartLead && (
                <IndiamartLeadDetails
                  dataId={dataId}
                  closeDrawerHandler={() =>
                    dispatch(closeNotificationsShowDetailsLeadsDrawer())
                  }
                />
              )}
            </>
          )}
        </ClickMenu>
      )} */}

      <img src={logo} className="w-[150px]"></img>

      <div className="flex gap-x-5 items-center">
        {user?.isTrial && !user?.isTrialEnded && (
          <div>
            <Link to="/pricing">
              <button className="border border-[#d61616] rounded-md px-7 py-2 bg-[#d61616] text-white font-medium hover:bg-white hover:text-[#d61616] ease-in-out duration-300">
                {user?.account?.trial_started || user?.isSubscriptionEnded
                  ? "Upgrade"
                  : "Activate Free Trial"}
              </button>
            </Link>
          </div>
        )}
        <Link to="/contact">
          <button className="border border-[#1640d6] rounded-md px-7 py-2 bg-[#1640d6] text-white font-medium hover:bg-white hover:text-[#1640d6] ease-in-out duration-300">
            Raise a Request
          </button>
        </Link>
        <div className="relative cursor-pointer">
          {notificationCtx.unseenNotifications +
            notificationCtx.unseenchatNotifications >
            0 && (
            <span className="absolute top-[-10px] left-[18px] bg-red-600 text-white h-[25px] w-[25px] rounded-full flex items-center justify-center">
              {notificationCtx.unseenNotifications +
                notificationCtx.unseenchatNotifications}
            </span>
          )}
          <IoIosNotifications
            size={40}
            onClick={() => {
              notificationCtx.getChatNotificationsHandler(user.id);
              // notificationCtx.getNotifications();
              toggleNotificationsMenu();
            }}
          />
        </div>

        {showNotificationsMenu && (
          <ClickMenu
            top={70}
            right={100}
            closeContextMenuHandler={() => setShowNotificationsMenu(false)}
          >
            <div
              className="relative bg-white px-6 py-6 z-30 rounded-lg w-[25rem] h-[20rem] overflow-auto"
              style={{
                boxShadow:
                  "0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)",
              }}
            >
              <h1 className="text-2xl mb-2">Notifications </h1>
              {notificationContext.isLoading && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <Loading />
                </div>
              )}
              {!notificationCtx.isLoading &&
                notificationCtx.notifications?.length === 0 && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    No Notifications.
                  </div>
                )}
              {/* {!notificationCtx.isLoading &&
                notificationCtx.notifications?.length > 0 && ( */}
              <div className="overflow-auto">
                {notificationCtx.notifications.map((notification) =>
                  notification.messageType == "chat" ? (
                    <button
                      key={notification.leadId}
                      className="text-lg border-b pb-1 mt-2 cursor-pointer"
                      // onClick={() => { getusermessage(notification) }}
                    >
                      {notification.message}
                    </button>
                  ) : (
                    <div
                      key={notification.leadId}
                      className="cursor-pointer text-lg border-b pb-1 mt-2"
                      // onClick={() => {
                      //   setIsIndiamartLead(notification.leadtype === "Indiamart");
                      //   setDataId(notification.lead);
                      //   setShowNotificationsMenu(false);
                      //   dispatch(openNotificationsShowDetailsLeadsDrawer());
                      // }}
                    >
                      {notification.message}
                    </div>
                  )
                )}
              </div>
              {/* )} */}
            </div>
          </ClickMenu>
        )}

        <Avatar
          cursor="pointer"
          size="md"
          name={user.name ? user.name : ""}
          onClick={toggleUserDetailsMenu}
        />
        {showUserDetailsMenu && (
          <ClickMenu
            top={70}
            right={0}
            closeContextMenuHandler={() => setShowUserDetailsMenu(false)}
          >
            <UserDetailsMenu
              name={user?.name}
              email={user?.email}
              role={user?.role}
              logoutHandler={logoutHandler}
              closeUserDetailsMenu={toggleUserDetailsMenu}
            />
          </ClickMenu>
        )}
      </div>
    </div>
  );
};

export default Header;
