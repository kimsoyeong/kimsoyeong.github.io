import React, { useState, useEffect, useRef } from "react";
import Draggable from "react-draggable";
import TopButtons from "./TopButtons";

const cvMessages = [
  { type: "date", text: "Today" },
  { type: "received", text: "Hi! I'm Soyeong Kim 👋" },
  { type: "received", text: "Feel free to ask me anything!" },
  { type: "date", text: "" },
  { type: "sent", text: "What's your education?" },
  {
    type: "received",
    sub: [
      { label: "M.S.", desc: "Computer Science & Engineering" },
      { detail: "Seoul National University" },
    ],
  },
  {
    type: "received",
    sub: [
      { label: "B.S.", desc: "Computer Science & Engineering" },
      { detail: "ChungNam National University" },
    ],
  },
  { type: "date", text: "" },
  { type: "sent", text: "What are you interested in?" },
  { type: "received", text: "AI, AI Agent, Web, Android/iOS" },
  { type: "date", text: "" },
  { type: "sent", text: "What skills do you have?" },
  { type: "received", text: "Python, LangGraph, ADK, Microsoft Agent Framework, Docker, React, FastAPI...",
  },
  { type: "date", text: "" },
  { type: "sent", text: "Tell me about your projects!" },
  {
    type: "received",
    sub: [
      { label: "PreFlight" },
      { detail: "An AI agent that validates system architectures for compliance during the design phase" },
    ],
  },
  {
    type: "received",
    sub: [
      { label: "Human Activity Recognition" },
      { detail: "Deep learning using smartwatch sensor data" },
    ],
  },
  {
    type: "received",
    sub: [
      { label: "YOCO" },
      { detail: "AI model that predicts ingredient doneness" },
    ],
  },
  {
    type: "received",
    sub: [
      { label: "PruPru" },
      { detail: "Android app for waste sorting using deep learning-based camera recognitio" },
    ],
  },
  { type: "date", text: "" },
  { type: "sent", text: "How can I reach you?" },
  { type: "received", text: "📧 soyeong.kim9@gmail.com" },
  { type: "received", text: "💻 github.com/kimsoyeong" },
  { type: "date", text: "" },
  {
    type: "sent",
    text: "Thanks! Your profile looks great! 👏",
  },
];

const Messages = ({ func }) => {
  const [visibleCount, setVisibleCount] = useState(0);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (visibleCount < cvMessages.length) {
      const msgType = cvMessages[visibleCount]?.type;
      const delay = msgType === "date" ? 300 : msgType === "sent" ? 800 : 600;
      const timer = setTimeout(() => {
        setVisibleCount((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [visibleCount]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleCount]);

  return (
    <Draggable handle=".iphone-drag-handle">
      <div className="absolute top-[30%] left-[5%] w-[350px] h-[700px] z-40 flex items-center justify-center">
        {/* iPhone Frame */}
        <div className="relative w-[340px] h-[690px]">
          {/* Outer titanium frame */}
          <div className="absolute inset-0 rounded-[55px] bg-gradient-to-b from-[#2a2a2c] via-[#1d1d1f] to-[#2a2a2c] shadow-[0_0_40px_rgba(0,0,0,0.3)]" />

          {/* Side buttons */}
          {/* Left - Silent switch */}
          <div className="absolute -left-[2px] top-[130px] w-[3px] h-[28px] bg-[#2a2a2c] rounded-l-sm" />
          {/* Left - Volume Up */}
          <div className="absolute -left-[2px] top-[175px] w-[3px] h-[52px] bg-[#2a2a2c] rounded-l-sm" />
          {/* Left - Volume Down */}
          <div className="absolute -left-[2px] top-[237px] w-[3px] h-[52px] bg-[#2a2a2c] rounded-l-sm" />
          {/* Right - Power */}
          <div className="absolute -right-[2px] top-[195px] w-[3px] h-[72px] bg-[#2a2a2c] rounded-r-sm" />

          {/* Inner black bezel */}
          <div className="absolute inset-[2px] rounded-[53px] bg-black" />

          {/* Screen */}
          <div className="absolute inset-[10px] rounded-[46px] overflow-hidden bg-white flex flex-col">
            {/* Status Bar with Dynamic Island */}
            <div className="iphone-drag-handle relative flex justify-between items-start px-7 pt-[10px] pb-0 bg-[#f6f6f6] cursor-move">
              <span className="text-[15px] font-semibold text-black mt-[2px]">9:41</span>
              {/* Dynamic Island */}
              <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full" />
              <div className="flex items-center gap-[5px] mt-[2px]">
                {/* Cellular */}
                <svg width="18" height="12" viewBox="0 0 18 12" fill="black">
                  <rect x="0" y="8" width="3" height="4" rx="0.5" fillOpacity="0.3" />
                  <rect x="4.5" y="5.5" width="3" height="6.5" rx="0.5" fillOpacity="0.3" />
                  <rect x="9" y="3" width="3" height="9" rx="0.5" />
                  <rect x="13.5" y="0" width="3" height="12" rx="0.5" />
                </svg>
                {/* WiFi */}
                <svg width="16" height="12" viewBox="0 0 16 12" fill="black">
                  <path d="M8 3.6c2 0 3.8.8 5.1 2.1l1.2-1.2C12.6 2.8 10.4 1.8 8 1.8S3.4 2.8 1.7 4.5l1.2 1.2C4.2 4.4 6 3.6 8 3.6z" />
                  <path d="M8 7c1.2 0 2.3.5 3.1 1.3l1.2-1.2C11.1 5.9 9.6 5.2 8 5.2S4.9 5.9 3.7 7.1l1.2 1.2C5.7 7.5 6.8 7 8 7z" />
                  <circle cx="8" cy="10.5" r="1.5" />
                </svg>
                {/* Battery */}
                <svg width="27" height="13" viewBox="0 0 27 13" fill="black">
                  <rect x="0" y="0.5" width="23" height="12" rx="3" stroke="black" strokeWidth="1" fill="none" opacity="0.35" />
                  <rect x="1.5" y="2" width="20" height="9" rx="2" fill="black" />
                  <rect x="24" y="4" width="2.5" height="5" rx="1" opacity="0.35" />
                </svg>
              </div>
            </div>

            {/* iMessage Header */}
            <div className="flex flex-col items-center pt-0 pb-2 bg-[#f6f6f6] border-b border-gray-200">
              {/* Back button & video call */}
              <div className="flex w-full justify-between items-center px-4 mb-1">
                <button
                  onClick={func}
                  className="text-[#007AFF] flex items-center gap-1"
                >
                  <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
                    <path d="M9 1L2 9l7 8" stroke="#007AFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {/* Video call icon */}
                <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
                  <rect x="0" y="2" width="16" height="14" rx="3" stroke="#007AFF" strokeWidth="1.8" />
                  <path d="M17 7.5l5-3v9l-5-3v-3z" stroke="#007AFF" strokeWidth="1.8" strokeLinejoin="round" />
                </svg>
              </div>
              {/* Profile */}
              <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-br from-blue-400 to-cyan-300 flex items-center justify-center">
                <span className="text-white text-xl font-semibold">S</span>
              </div>
              <p className="text-[13px] font-semibold text-black mt-1">Soyeong</p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-[6px] scrollbar-hide bg-white">
              {cvMessages.slice(0, visibleCount).map((msg, idx) =>
                msg.type === "date" ? (
                  msg.text ? (
                    <div
                      key={idx}
                      className="text-center text-[11px] text-gray-400 font-medium py-2"
                    >
                      {msg.text}
                    </div>
                  ) : (
                    <div key={idx} className="h-3" />
                  )
                ) : msg.type === "received" ? (
                  <div
                    key={idx}
                    className="flex justify-start animate-fadeInUp"
                  >
                    <div className="max-w-[80%] px-3 py-[7px] rounded-2xl bg-[#e9e9eb] text-black text-[15px] leading-[20px]">
                      {msg.sub ? (
                        <div className="flex flex-col gap-[2px]">
                          {msg.sub.map((item, i) =>
                            item.label ? (
                              <span key={i} className="font-semibold text-[15px]">
                                {item.label}
                                {item.desc && (
                                  <span className="font-normal text-[13px] text-black/60">
                                    {" "}— {item.desc}
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span
                                key={i}
                                className="text-[12px] text-black/45"
                              >
                                {item.detail}
                              </span>
                            )
                          )}
                        </div>
                      ) : (
                        <span className="whitespace-pre-line">{msg.text}</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div key={idx} className="flex justify-end animate-fadeInUp">
                    <div className="max-w-[75%] px-3 py-[7px] rounded-2xl bg-[#34C759] text-white text-[15px] leading-[20px] whitespace-pre-line">
                      {msg.text}
                    </div>
                  </div>
                )
              )}
              {visibleCount < cvMessages.length &&
                cvMessages[visibleCount]?.type !== "date" && (
                  <div className="flex justify-start pl-2 py-1">
                    <div className="flex gap-[5px] items-center bg-[#e9e9eb] rounded-full px-3 py-[10px]">
                      <span
                        className="w-[7px] h-[7px] bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-[7px] h-[7px] bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-[7px] h-[7px] bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-2 px-3 py-[6px] bg-white border-t border-gray-200">
              <div className="flex items-center justify-center w-[30px] h-[30px] rounded-full bg-[#e9e9eb]">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 4v10M4 9h10" stroke="#8e8e93" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex-1 h-[36px] rounded-full bg-[#f2f2f7] border border-gray-300/60 flex items-center justify-between px-4">
                <span className="text-gray-400 text-[15px]">iMessage</span>
                {/* Send button */}
                <div className="w-[26px] h-[26px] rounded-full bg-[#34C759] flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 11V3M7 3l-3.5 3.5M7 3l3.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Home Indicator */}
            <div className="flex justify-center py-[8px] bg-white">
              <div className="w-[134px] h-[5px] bg-black/20 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </Draggable>
  );
};

export default Messages;
