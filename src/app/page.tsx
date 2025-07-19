// Main chat page for Unmesh GenAI
// This file implements the responsive chat UI, persona selection, and theme toggle.

"use client";

import { useState, useEffect, useRef } from "react";
import { generatePersonaResponse } from "@/ai/flows/generate-response";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "@/components/icons";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/theme-provider";

// Persona type definition
export type Persona = {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatar: string;
  specialties: string[];
  style: {
    voice: string;
    traits: string[];
  };
  tunes: string[];
  voiceSample?: string; // Optional voice sample URL
};

// List of available personas for the user to choose from
export const personas = [
  {
    id: "hitesh",
    name: "Hitesh Choudhary",
    title: "Tech Educator & Entrepreneur",
    bio: "Passionate about teaching programming with a focus on practical knowledge and real-world applications.",
    avatar: "https://github.com/hiteshchoudhary.png",
    specialties: ["JavaScript", "Python", "Web Development", "DSA", "AI"],
    style: {
      voice:
        "Hanji! Hamesha Hindi mein baat karte hain, thoda mazaak, thodi chai aur bhot saara code. Funny tone ke saath har baat relatable hoti hai.",
      traits: [
        "funny",
        "relatable",
        "chai-lover",
        "inspirational",
        "desi techie",
      ],
    },
    tunes: [
      "Hanji! Unboxing ho gayi h guys 😁 Bhut mehnat lagti h is T-shirt ke liye!",
      "Chai aur code, bs isi mein zindagi set hai ☕💻",
      "Hum padha rhe hain, aap padh lo... chai pe milte rahenge 😄",
      "Full stack Data Science cohort start ho rha h bhai, live class me milte h 🔥",
      "Code karo, chill karo, lekin pehle chai lao ☕😎",
    ],
    voiceSample: "/hitesh_voice.mp3",
  },
  {
    id: "piyush",
    name: "Piyush Garg",
    title: "Educator & Content Creator",
    bio: "Content creator, educator, and entrepreneur known for his expertise in the tech industry.",
    avatar: "https://github.com/piyushgarg-dev.png",
    specialties: ["Docker", "React", "Node.js", "Gen Ai", "Career Advice"],
    style: {
      voice:
        "Dekho bhai! Full-on desi swag ke saath, sab kuch Hindi mein samjhate hain, funny emojis ke saath. Straightforward + mazedaar!",
      traits: [
        "funny",
        "straight-shooter",
        "relatable",
        "energetic",
        "mentor-type",
      ],
    },
    tunes: [
      "Dekho bhai, Docker seekh lo, coupon DOCKERPRO use karo 🤓🔥",
      "Bhai, great work man! 🔥🔥",
      "Patila wale log dhyaan se suno, backend ka concept clear karo 😎💻",
      "System design ka dar khatam, bhai coding se pyaar badhao 🧠❤️",
      "Dekho bhai, DSA nhi seekha to internship me dukh hoga 😭",
    ],
    voiceSample: "/piyush_voice.mp3",
  },
  {
    id: "mannu",
    name: "Mannu Paaji",
    title: "Founder of Aceternity UI",
    bio: "Mannu paaji is chill gyus! Coding aur party dono mein expert, funnyness aur vibes ka perfect combo. Creator of ui.aceternity.com.",
    avatar: "https://pbs.twimg.com/profile_images/1417752099488636931/cs2R59eW_400x400.jpg",
    specialties: ["UI Design", "Coding", "Partying", "Vibing"],
    style: {
      voice:
        "Oye chill karo guys! Mannu paaji coding bhi karta hu aur party bhi karta hu – vo wali party! Full fun, full masti",
      traits: ["funny", "party-lover", "chill", "vibe-check", "cool-coder"],
    },
    tunes: [
      "Number bhejo sir 😎",
      "Chill gyus, aaj party meri taraf se 🎉",
      "Code kro, party kro, repeat 🔁",
      "Vo wali party ho rhi hai kya aaj? 🕺💃",
    ],
    voiceSample: "/mannu_voice.mp3",
  },
  {
    id: "partha",
    name: "Partha Ghosh Sir",
    title: "Automata & Compiler Design Expert.",
    bio: "Professor at Academy of Technology, known for his expertise in automata and compiler design.",
    avatar: "https://scontent.frdp1-1.fna.fbcdn.net/v/t39.30808-6/481764723_9576127692407785_9141188090577488665_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=XsizicdTJpYQ7kNvwHDHdaL&_nc_oc=AdnogYkGCThrVRs8TxpLoFzaFmOKp7dHYBkv5A4xaR1LuTsDOtlMvmfNMdshiYUKRR6oL6TMfttPFgn5aEEmCYDh&_nc_zt=23&_nc_ht=scontent.frdp1-1.fna&_nc_gid=MVC2SGDOOp6G9xD6mp_WAQ&oh=00_AfRlPb0MqTL7tNoxkZJVQFcpAhevHqZRT7AS_UnsIQ4qkQ&oe=688195F0",
    specialties: ["Automata", "Compiler Design","Computer Architecture","low level programming", "Artificial Intelligence", "Machine Learning"],
    style: {
      voice:
        "Areeh Listen ... You are an Engineer, not a clerk ! Understood? যতো Low Level যাবে তত Salary বাড়বে । ",
      traits: ["funny", "calm", "chill", "smart", "low level programming expert", "compiler design expert", "automata expert"],
    },
    tunes: [
      "এই তুমি Homework করে এসেছো ? ",
      "আচ্ছা এবার এটা একটু ভালো করে দেখো ! ",
      "আরে বুঝতে পেরেছো নাকি আবার বলবো? 🔁",
      "Getting my point? 🤔",
    ],
    voiceSample: "/partha_voice.mp3",
  }

];

export default function Home() {
  // State for the currently selected persona
  const [selectedPersona, setSelectedPersona] = useState<Persona>(personas[0]);
  // State for the user's input in the chat box
  const [userInput, setuserInput] = useState("");
  // State for the chat history (array of user and bot messages)
  const [chatHistory, setChatHistory] = useState<
    { type: "user" | "bot"; message: string }[]
  >([]);
  // State for loading indicator when waiting for bot response
  const [isLoading, setIsLoading] = useState(false);
  // State for sidebar visibility on mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Toast hook for showing error messages
  const { toast } = useToast();
  // Ref for scrolling chat to bottom
  const chatDisplayRef = useRef<HTMLDivElement>(null);
  // Theme context for dark/light mode
  const { theme, toggleTheme } = useTheme();

  // Ensure a persona is always selected on mount
  useEffect(() => {
    if (!selectedPersona) {
      setSelectedPersona(personas[0]);
    }
  }, []);

  // Scroll chat to bottom when new messages are added
  useEffect(() => {
    chatDisplayRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Handle persona selection (resets chat and closes sidebar on mobile)
  const handlePersonaSelection = (persona: Persona) => {
    setSelectedPersona(persona);
    setChatHistory([]); // Clear chat history on persona change
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  // Handle user input change in textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setuserInput(e.target.value);
  };

  // Handle sending a message (user submits input)
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    setChatHistory((prev) => [...prev, { type: "user", message: userInput }]);
    setuserInput("");
    setIsLoading(true);
    try {
      // Call the AI to generate a persona-based response
      const response = await generatePersonaResponse({
        personaId: selectedPersona.id,
        userInput: userInput,
        personas: personas,
      });
      setChatHistory((prev) => [
        ...prev,
        { type: "bot", message: response.response },
      ]);
    } catch (error: any) {
      // Show error toast if response fails
      console.error("Error generating response:", error);
      toast({
        title: "Error",
        description: "Failed to generate response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key for sending message
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Main UI layout
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header with theme toggle and sidebar toggle for mobile */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-border sticky top-0 z-20 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          {/* Sidebar open button for mobile */}
          <button
            className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Open sidebar"
            onClick={() => setSidebarOpen(true)}
          >
            <Icons.menuSquare className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Unmesh GenAI</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Theme toggle switch */}
          <span className="text-xs text-muted-foreground mr-2">{theme === "dark" ? "Dark" : "Light"} Mode</span>
          <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} aria-label="Toggle dark mode" />
        </div>
      </header>
      <main className="flex flex-1 w-full overflow-hidden">
        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar overlay"
          />
        )}
        {/* Sidebar for persona selection */}
        <aside
          className={`fixed z-40 top-0 left-0 h-full w-4/5 max-w-xs bg-card border-r border-border p-4 transition-transform duration-300 md:static md:translate-x-0 md:w-64 md:max-w-none md:h-auto md:p-4 flex-shrink-0 overflow-y-auto ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
          aria-label="Sidebar"
        >
          {/* Sidebar header for mobile */}
          <div className="flex items-center justify-between mb-4 md:hidden">
            <h2 className="text-lg font-semibold">Select Persona</h2>
            <button
              className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Close sidebar"
              onClick={() => setSidebarOpen(false)}
            >
              <Icons.close className="w-6 h-6" />
            </button>
          </div>
          {/* Sidebar header for desktop */}
          <div className="hidden md:block mb-4">
            <h2 className="text-lg font-semibold">Select Persona</h2>
          </div>
          {/* Persona selection buttons */}
          <div className="flex flex-col gap-2">
            {personas.map((persona) => (
              <Button
                key={persona.id}
                variant="outline"
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-base transition-colors ${
                  selectedPersona?.id === persona.id ? "bg-accent text-accent-foreground" : ""
                }`}
                onClick={() => handlePersonaSelection(persona)}
                aria-label={`Select persona ${persona.name}`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={persona.avatar} alt={persona.name} />
                  <AvatarFallback>{persona.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <span className="truncate">{persona.name}</span>
              </Button>
            ))}
          </div>
        </aside>
        {/* Chat Interface */}
        <section className="flex flex-col flex-1 p-2 md:p-4 max-w-full overflow-x-hidden">
          {/* Persona Display Card */}
          {selectedPersona && (
            <Card className="mb-4">
              <CardHeader>
                <div className="flex items-center">
                  <Avatar className="mr-4 w-12 h-12">
                    <AvatarImage src={selectedPersona.avatar} alt={selectedPersona.name} />
                    <AvatarFallback>{selectedPersona.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <CardTitle className="text-lg md:text-xl">{selectedPersona.name}</CardTitle>
                    <p className="text-sm md:text-base text-muted-foreground">{selectedPersona.title}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm md:text-base text-muted-foreground">{selectedPersona.bio}</p>
              </CardContent>
            </Card>
          )}
          {/* Chat Display Area */}
          <div className="flex-grow overflow-y-auto mb-4 max-h-[40vh] md:max-h-none px-1 md:px-0">
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={`mb-2 p-3 rounded-2xl max-w-[90vw] md:max-w-2xl break-words shadow-sm transition-colors text-base md:text-lg ${
                  chat.type === "user"
                    ? "bg-primary text-primary-foreground self-end ml-auto"
                    : "bg-muted text-foreground self-start mr-auto"
                }`}
                style={{ wordBreak: "break-word" }}
              >
                {chat.message}
              </div>
            ))}
            {/* Loading indicator for bot typing */}
            {isLoading && (
              <div className="mb-2 p-3 rounded-2xl bg-muted text-foreground self-start shadow-sm">
                Loading <Icons.spinner className="inline-block animate-spin" />
              </div>
            )}
            {/* Dummy div for scroll-to-bottom */}
            <div ref={chatDisplayRef} />
          </div>
          {/* Input and Actions (sticky at bottom) */}
          <form
            className="flex flex-col gap-2 w-full max-w-2xl mx-auto sticky bottom-0 bg-background/80 pt-2 pb-4 z-10"
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <div className="flex items-center gap-2">
              <Textarea
                value={userInput}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                placeholder="Type your message..."
                className="flex-grow rounded-md border border-input bg-background px-3 py-2 text-base md:text-lg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[48px]"
                aria-label="Message input"
                rows={1}
                autoFocus
              />
              <Button type="submit" disabled={isLoading} className="h-12 px-6 text-base md:text-lg" aria-label="Send message">
                Send
              </Button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
// End of main chat page
