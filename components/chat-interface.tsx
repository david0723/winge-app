"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Message = {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

type Profile = {
  id: string;
  name: string;
  avatar_url: string;
  seat_number: string;
};

export function ChatInterface({
  matchId,
  currentUserId,
  targetProfile,
  initialMessages
}: {
  matchId: string;
  currentUserId: string;
  targetProfile: Profile;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const supabase = createClient();
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Scroll to bottom on load and when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Setup Realtime subscription
    const channel = supabase
      .channel(`chat_${matchId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${matchId}`
      }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages(prev => [...prev, newMsg]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, supabase]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageText = newMessage;
    setNewMessage("");

    // Optimistic UI could be added here, but for simplicity we rely on realtime or fast insert
    const { error } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: currentUserId,
        content: messageText
      });

    if (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center gap-4 fixed top-0 w-full z-10 max-w-lg left-1/2 -translate-x-1/2 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Avatar className="w-10 h-10">
          <AvatarImage src={targetProfile.avatar_url} />
          <AvatarFallback>{targetProfile.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-bold text-lg leading-tight">{targetProfile.name}</h2>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Seat: {targetProfile.seat_number}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto pt-20 pb-20 p-4 max-w-lg mx-auto w-full hide-scrollbar">
        <div className="flex flex-col gap-3">
          {messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[75%] p-3 rounded-2xl ${
                    isMe 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 fixed bottom-0 w-full max-w-lg left-1/2 -translate-x-1/2 z-10 pb-6">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..." 
            className="flex-1 rounded-full bg-slate-100 dark:bg-slate-800 border-none focus-visible:ring-1 focus-visible:ring-blue-500"
          />
          <Button type="submit" size="icon" className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
