"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface TutorChatProps {
  cardId: string;
  cardFront: string;
  cardBack: string;
  isOpen: boolean;
  onClose: () => void;
}

const SUGGESTIONS = [
  "Explain this differently",
  "Give me an example",
  "Why is this true?",
  "Break it down step by step",
];

export default function TutorChat({
  cardId,
  cardFront,
  cardBack,
  isOpen,
  onClose,
}: TutorChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    setMessages([]);
    setInput("");
  }, [cardId]);

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/tutor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId, messages: updatedMessages }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
    } catch {
      toast.error("Failed to get tutor response. Please try again.");
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-white shadow-2xl sm:w-[400px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                </div>
                <h2 className="text-base font-semibold text-slate-900">AI Tutor</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Card reference */}
            <div className="mx-4 mt-4 rounded-xl border border-indigo-100 bg-indigo-50 p-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
                Studying
              </p>
              <p className="mt-1 text-sm font-medium leading-snug text-slate-800">
                {cardFront}
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {messages.length === 0 && !isLoading && (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
                    <MessageCircle className="h-7 w-7 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      Ask me anything about this card
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      I&apos;ll help you understand it better
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-white"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-1.5 rounded-2xl bg-slate-100 px-4 py-3">
                      {[0, 150, 300].map((delay) => (
                        <span
                          key={delay}
                          className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                          style={{ animationDelay: `${delay}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Starter suggestions */}
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-wrap gap-2 px-4 pb-3">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="rounded-xl border border-indigo-200 bg-white px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="border-t border-slate-200 p-4">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask the tutor..."
                  rows={1}
                  className="max-h-24 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition-all hover:bg-indigo-600 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-center text-[10px] text-slate-400">
                Shift+Enter for new line
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
