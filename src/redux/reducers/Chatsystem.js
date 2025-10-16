import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const baseURL = process.env.REACT_APP_BACKEND_URL;

export const fetchData = createAsyncThunk(
  "data/fetchData",
  async ({ userid, token }) => {
    console.log("fetchData =dedwe", userid);
    const response = await fetch(`${baseURL}chat/all-user/${userid}`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    return await response.json();
  }
);

export const createGroupForm = createAsyncThunk(
  "data/createGroupForm",
  async ({ groupData, token }) => {
    const response = await fetch(`${baseURL}chat/createGroup`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: groupData,
    });
    return await response.json();
  }
);

export const fetchGroup = createAsyncThunk(
  "data/fetchGroup",
  async ({ adminId, token }) => {
    const response = await fetch(`${baseURL}chat/fetchGroup/${adminId}`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    return await response.json();
  }
);

export const fetchUnreadCounts = createAsyncThunk(
  "data/fetchUnreadCounts",
  async ({ userId, token }) => {
    const response = await fetch(`${baseURL}chat/unread-counts/${userId}`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    return await response.json();
  }
);

export const fetchGroupUnreadCounts = createAsyncThunk(
  "data/fetchGroupUnreadCounts",
  async ({ userId, token }) => {
    const response = await fetch(
      `${baseURL}chat/group-unread-counts/${userId}`,
      {
        method: "GET",
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );
    return await response.json();
  }
);

const Chatsystem = createSlice({
  name: "data",
  initialState: {
    data: [],
    groupPerson: [],
    recipient: null,
    selectedGroup: null,
    togglechat: null,
    chatmessages: null,
    unreadCounts: {}, // { userId: count }
    groupUnreadCounts: {}, // { groupId: count }
    lastMessageTime: {}, // { userId: timestamp } - for sorting
    lastGroupMessageTime: {}, // { groupId: timestamp } - for sorting
    status: "idle",
    error: null,
  },

  reducers: {
    addRecipient: (state, action) => {
      state.recipient = action.payload; // Add a new user
    },

    selectedGroupperson: (state, action) => {
      state.selectedGroup = action.payload; // Add a new user
    },

    updateChatMessages: (state, action) => {
      console.log("updateChatMessages action.payload:", action.payload);
      state.chatmessages.push(action.payload);
      
      // Update last message time for sorting
      const message = action.payload;
      const timestamp = message.timestamp || new Date().toISOString();
      
      if (message.groupId) {
        // Group message
        state.lastGroupMessageTime[message.groupId] = timestamp;
      } else if (message.sender || message.recipient) {
        // One-to-one message - store for both sender and recipient
        if (message.sender) {
          state.lastMessageTime[message.sender] = timestamp;
        }
        if (message.recipient) {
          state.lastMessageTime[message.recipient] = timestamp;
        }
      }
    },

    addChatMessages: (state, action) => {
      state.chatmessages = action.payload; // Add a new message to the chat
      console.log("updateChatMessages action.payload:", state.chatmessages);
    },

    togglechatarea: (state, action) => {
      state.togglechat = action.payload; // Add a new user
    },

    // Update unread count for specific user
    updateUnreadCount: (state, action) => {
      const { userId, count } = action.payload;
      if (count > 0) {
        state.unreadCounts[userId] = count;
      } else {
        delete state.unreadCounts[userId];
      }
    },

    // Update unread count for specific group
    updateGroupUnreadCount: (state, action) => {
      const { groupId, count } = action.payload;
      if (count > 0) {
        state.groupUnreadCounts[groupId] = count;
      } else {
        delete state.groupUnreadCounts[groupId];
      }
    },

    // Clear unread count for user
    clearUnreadCount: (state, action) => {
      const userId = action.payload;
      delete state.unreadCounts[userId];
    },

    // Clear unread count for group
    clearGroupUnreadCount: (state, action) => {
      const groupId = action.payload;
      delete state.groupUnreadCounts[groupId];
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.admins;
        console.log("Data fetched state.data:", action.payload);
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      // create group Chat
      .addCase(createGroupForm.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createGroupForm.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.groupPerson.push(action.payload.chatgroup);
      })
      .addCase(createGroupForm.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      // fatch group data
      .addCase(fetchGroup.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchGroup.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.groupPerson = action.payload.chatgroup;
      })
      .addCase(fetchGroup.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      // fetch unread counts
      .addCase(fetchUnreadCounts.fulfilled, (state, action) => {
        state.unreadCounts = action.payload.unreadCounts || {};
      })
      // fetch group unread counts
      .addCase(fetchGroupUnreadCounts.fulfilled, (state, action) => {
        state.groupUnreadCounts = action.payload.unreadCounts || {};
      });
  },
});

export const {
  addRecipient,
  selectedGroupperson,
  updateChatMessages,
  addChatMessages,
  togglechatarea,
  updateUnreadCount,
  updateGroupUnreadCount,
  clearUnreadCount,
  clearGroupUnreadCount,
} = Chatsystem.actions;

export default Chatsystem.reducer;
