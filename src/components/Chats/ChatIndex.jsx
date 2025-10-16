import { useState } from "react"
import Sidebar from "./Sidebar"
import Chatarea from "./Chatarea";
import Groupchatarea from "./Groupchatarea";
import { useSelector } from 'react-redux';
import { MessagesSquare } from "lucide-react";
export default function ChatIndex() {
  const { togglechat } = useSelector(state => state.data);
  

  return (
    <div className="flex h-[83vh] w-full border border-gray-200">
      <Sidebar />
      <div className="flex-1 h-full">
        {togglechat === 'onetoonechat' && (
          <Chatarea />
        )}
        {togglechat === 'groupchat' && <Groupchatarea />}

        {togglechat == null && 
          <div className="h-[83vh] flex flex-col">
            <div className="h-[83vh] flex items-center justify-center bg-gray-100 border border-gray-200" style={{ backgroundImage: "url('/chatpattern-02.png')" }}>
              <div className="p-6 text-center rounded-lg shadow-md max-w-md w-full">
                <div className="mx-auto mb-4 w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                  <MessagesSquare className="bx bxs-message-alt-detail text-blue-600 text-4xl" />
                </div>
                <h4 className="text-2xl font-semibold mb-2">Welcome to Deepnap Chat</h4>
                <p className="text-gray-500 mb-6">
                   Deepnap Chat — designed for quick chats, deep convos, and everything in between.
                </p>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  )
}
