"use client";

import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import { Send, MessageCircle } from "lucide-react";

const socket = io("http://localhost:8080");

interface IMessage {
  sender: string;
  text: string;
  createdAt?: string;
}

const ChatBox = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    axios.get("http://localhost:8080/api/v1/chat").then((res) => setMessages(res.data));

    socket.on("receiveMessage", (message: IMessage) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
    }, 100);
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const message: IMessage = { sender: "user", text: input };
    socket.emit("sendMessage", message);
    axios.post("http://localhost:8080/api/v1/chat", message);

    setInput("");
  };

  return (
    <div className="fixed bottom-5 right-5">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all"
        >
          <MessageCircle size={24} />
        </button>
      ) : (
        <div className="w-96 h-[450px] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl flex flex-col">
          {/* Header */}
          <div className="p-4 bg-blue-600 text-white flex justify-between items-center rounded-t-lg">
            <span className="font-semibold">Live Chat</span>
            <button onClick={() => setIsOpen(false)} className="text-white">
              ✖
            </button>
          </div>

          {/* Chat Messages */}
          <div
            ref={chatRef}
            className="flex-1 p-4 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
          >
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`p-3 rounded-lg max-w-xs ${
                    msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  {msg.createdAt && (
                    <p className="text-xs mt-1 text-gray-400 text-right">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-300 dark:border-gray-700 flex">
            <input
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
            />
            <button onClick={sendMessage} className="ml-2 bg-blue-600 p-2 rounded-lg text-white hover:bg-blue-700 transition-all">
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
