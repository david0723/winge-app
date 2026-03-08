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
    <div className="flex flex-col h-[100dvh] bg-black text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-purple-900/10 blur-[100px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="bg-black/60 backdrop-blur-2xl border-b border-white/10 p-4 pt-6 flex items-center gap-4 fixed top-0 w-full z-30 max-w-lg left-1/2 -translate-x-1/2 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-white/10 text-white">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <Avatar className="w-12 h-12 border border-white/10 shadow-sm">
          <AvatarImage src={targetProfile.avatar_url} className="object-cover" />
          <AvatarFallback className="bg-zinc-800 text-zinc-400 font-bold">{targetProfile.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-black text-xl leading-tight tracking-tight">{targetProfile.name}</h2>
          <p className="text-xs text-purple-400 font-bold tracking-wider uppercase mt-0.5">Seat {targetProfile.seat_number}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto pt-28 pb-32 p-5 max-w-lg mx-auto w-full hide-scrollbar z-10">
        <div className="flex flex-col gap-4">
          {messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[75%] p-4 rounded-[1.5rem] shadow-sm ${
                    isMe 
                      ? 'bg-blue-600 text-white rounded-br-sm' 
                      : 'bg-zinc-900/80 backdrop-blur-md border border-white/5 text-white rounded-bl-sm'
                  }`}
                >
                  <p className="text-[15px] font-medium leading-snug">{msg.content}</p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-black/60 backdrop-blur-2xl border-t border-white/10 p-5 fixed bottom-0 w-full max-w-lg left-1/2 -translate-x-1/2 z-30 pb-safe">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <Input 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Send a message..." 
            className="flex-1 rounded-full bg-zinc-900/80 border border-white/10 text-white h-14 px-6 focus-visible:ring-blue-500 focus-visible:ring-2 focus-visible:border-transparent transition-all font-medium"
          />
          <Button type="submit" size="icon" className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white shrink-0 transition-transform hover:scale-105 shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
