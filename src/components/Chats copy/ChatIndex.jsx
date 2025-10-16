import { useState } from "react"
import Sidebar from "./Sidebar"
import Chatarea from "./Chatarea"

export default function ChatIndex() {
  const [selectedChat, setSelectedChat] = useState(null)
  const [contacts, setContacts] = useState([
    { id: "1", name: "John Doe", avatar: "/profile.png?height=40&width=40", status: "online" },
    { id: "2", name: "Jane Smith", avatar: "/profile.png?height=40&width=40", status: "offline" },
    { id: "3", name: "Mike Johnson", avatar: "/profile.png?height=40&width=40", status: "online" },
  ])

  const [groups, setGroups] = useState([
    { id: "g1", name: "Team Alpha", members: ["1", "2"], avatar: "/profile.png?height=40&width=40" },
    { id: "g2", name: "Project Beta", members: ["1", "3"], avatar: "/profile.png?height=40&width=40" },
  ])

  const [messages, setMessages] = useState({
    "1": [
      { id: "m1", sender: "1", content: "Hey there!", timestamp: new Date(Date.now() - 3600000).toISOString() },
      {
        id: "m2",
        sender: "me",
        content: "Hi John! How are you?",
        timestamp: new Date(Date.now() - 3500000).toISOString(),
      },
    ],
    g1: [
      {
        id: "m3",
        sender: "1",
        content: "Welcome to Team Alpha!",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "m4",
        sender: "2",
        content: "Thanks for adding me!",
        timestamp: new Date(Date.now() - 85400000).toISOString(),
      },
    ],
  })

  const handleSendMessage = (content) => {
    if (!selectedChat || !content.trim()) return

    const newMessage = {
      id: `m${Date.now()}`,
      sender: "me",
      content,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), newMessage],
    }))
  }

  const handleCreateGroup = (name, memberIds) => {
    if (!name.trim() || memberIds.length === 0) return

    const newGroup = {
      id: `g${Date.now()}`,
      name,
      members: memberIds,
      avatar: "/placeholder.svg?height=40&width=40",
    }

    setGroups((prev) => [...prev, newGroup])
  }

  return (
    <div className="flex h-screen w-full">
      <Sidebar
        contacts={contacts}
        groups={groups}
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
        onCreateGroup={handleCreateGroup}
      />
      <div className="flex-1 h-full">
        <Chatarea
          selectedChat={selectedChat}
          messages={selectedChat ? messages[selectedChat] || [] : []}
          contacts={contacts}
          groups={groups}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  )
}
