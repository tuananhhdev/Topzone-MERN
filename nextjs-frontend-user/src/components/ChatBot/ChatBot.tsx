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
          className="rounded-full bg-blue-600 p-3 text-white shadow-lg transition-all hover:bg-blue-700"
        >
          <MessageCircle size={24} />
        </button>
      ) : (
        <div className="flex h-[450px] w-96 flex-col rounded-lg border border-gray-300 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-lg bg-blue-600 p-4 text-white">
            <span className="font-semibold">Live Chat</span>
            <button onClick={() => setIsOpen(false)} className="text-white">
              ✖
            </button>
          </div>

          {/* Chat Messages */}
          <div
            ref={chatRef}
            className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 flex-1 space-y-2 overflow-y-auto p-4"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs rounded-lg p-3 ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-black dark:bg-gray-700 dark:text-white"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  {msg.createdAt && (
                    <p className="mt-1 text-right text-xs text-gray-400">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex border-t border-gray-300 p-4 dark:border-gray-700">
            <input
              className="flex-1 rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
            />
            <button
              onClick={sendMessage}
              className="ml-2 rounded-lg bg-blue-600 p-2 text-white transition-all hover:bg-blue-700"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
