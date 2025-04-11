"use client";

import { useState, useEffect, useRef } from "react";
import { generatePersonaResponse } from "@/ai/flows/generate-response";
import { promoteCourse } from "@/ai/flows/promote-course";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "@/components/icons";

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
  genAICourse: {
    promoteLine: string;
    courseLink: string;
    examples: string[];
  };
  voiceSample?: string; // Optional voice sample URL
};

export const personas: Persona[] = [
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
    genAICourse: {
      promoteLine:
        "Hanji! Gen AI course le lo bhai, aapke liye banaya h specially. Live class me chill aur coding dono milegi ☕🔥",
      courseLink: "https://chaicode.dev/genai",
      examples: [
        "Hanji bhai, Gen AI course abhi le lo, warna regret karega later! 🤖💥",
        "AI seekhna hai? Chai leke aao aur iss course me ghus jao 😎☕",
      ],
    },
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
    genAICourse: {
      promoteLine:
        "Dekho bhai, Gen AI ka course le lo. Puri life set ho jayegi. Hitesh bhai ke saath LIVE aane ka mauka bhi milega! 😎🔥",
      courseLink: "https://chaicode.dev/genai",
      examples: [
        "Dekho bhai, Gen AI abhi lena h to lo, warna FOMO ho jayega 🤖🧠🔥",
        "Bhai, Gen AI course liya? Nahi? Patila miss kar raha tu 😂💥",
      ],
    },
    voiceSample: "/piyush_voice.mp3",
  },
  {
    id: "mannu",
    name: "Mannu Paaji",
    title: "Chill Coder & Party Lover",
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
      "Vo wali party ho rhi hai kya aaj? 🕺💻",
    ],
    genAICourse: {
      promoteLine:
        "O bhaiyo aur behno! Gen AI course le lo – coding aur creativity ka ultimate party hai ye 🤖🎉",
      courseLink: "https://chaicode.dev/genai",
      examples: [
        "Mannu paaji bolte – Gen AI le lo, warna regret karega party mein! 🧠🔥",
        "AI seekh ke vo wali party bhi smartly enjoy karo 😎🤖",
        "Chalo accernity ui ka competitor banate hain"
      ],
    },
     voiceSample: "/mannu_voice.mp3",
  }
];

export default function Home() {
  const [selectedPersona, setSelectedPersona] = useState<Persona>(personas[0]);
  const [userInput, setuserInput] = useState("");
  const [chatHistory, setChatHistory] = useState<
    { type: "user" | "bot"; message: string }[]
  >([]);
    const [isPromotingCourse, setIsPromotingCourse] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const chatDisplayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedPersona) {
      setSelectedPersona(personas[0]);
    }
  }, []);

    useEffect(() => {
        // Scroll to the bottom of the chat display when new messages are added
        chatDisplayRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

  const handlePersonaSelection = (persona: Persona) => {
    setSelectedPersona(persona);
    setChatHistory([]); // Clear chat history on persona change
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setuserInput(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    setChatHistory((prev) => [...prev, { type: "user", message: userInput }]);
    setuserInput("");
    setIsLoading(true);

    try {
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

  const handlePromoteCourse = async () => {
    setIsPromotingCourse(true);
    setIsLoading(true);
    try {
      const promotion = await promoteCourse({
        personaName: selectedPersona.name,
        personaStyleVoice: selectedPersona.style.voice,
        personaCoursePromoteLine: selectedPersona.genAICourse.promoteLine,
        personaCourseExamples: selectedPersona.genAICourse.examples,
        courseLink: selectedPersona.genAICourse.courseLink,
      });

      setChatHistory((prev) => [
        ...prev,
        { type: "bot", message: promotion.promotion },
      ]);
    } catch (error: any) {
      console.error("Error promoting course:", error);
      toast({
        title: "Error",
        description: "Failed to promote course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsPromotingCourse(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex flex-row h-full">
        {/* Persona Selection Sidebar */}
        <div className="w-full md:w-64 p-4 border-r border-border">
          <h2 className="text-lg font-semibold mb-4">Select Persona</h2>
          <div className="flex flex-row md:flex-col flex-wrap gap-2 md:gap-4">
            {personas.map((persona) => (
              <Button
                key={persona.id}
                variant="outline"
                className={`${
                  selectedPersona?.id === persona.id ? "bg-accent text-accent-foreground" : ""
                } justify-start w-full md:w-auto`}
                onClick={() => handlePersonaSelection(persona)}
              >
                <Avatar className="mr-2 w-6 h-6">
                  <AvatarImage src={persona.avatar} alt={persona.name} />
                  <AvatarFallback>{persona.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                {persona.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex flex-col flex-grow p-4">
          {/* Persona Display */}
          {selectedPersona && (
            <Card className="mb-4">
              <CardHeader>
                <div className="flex items-center">
                  <Avatar className="mr-4 w-12 h-12">
                    <AvatarImage src={selectedPersona.avatar} alt={selectedPersona.name} />
                    <AvatarFallback>{selectedPersona.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <CardTitle>{selectedPersona.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{selectedPersona.title}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{selectedPersona.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Chat Display */}
          <div className="flex-grow overflow-y-auto mb-4">
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={`mb-2 p-3 rounded-lg ${
                  chat.type === "user" ? "bg-secondary text-secondary-foreground self-end" : "bg-muted text-foreground self-start"
                }`}
              >
                {chat.message}
              </div>
            ))}
            {isLoading && (
              <div className="mb-2 p-3 rounded-lg bg-muted text-foreground self-start">
                Loading <Icons.spinner className="inline-block animate-spin" />
              </div>
            )}
              <div ref={chatDisplayRef} />
          </div>

          {/* Input and Actions */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center">
              <Textarea
                value={userInput}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                placeholder="Type your message..."
                className="flex-grow mr-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button onClick={handleSendMessage} disabled={isLoading}>
                Send
              </Button>
            </div>
            <Button
              variant="secondary"
              onClick={handlePromoteCourse}
              disabled={isLoading || isPromotingCourse}
            >
              {isPromotingCourse ? "Promoting..." : "Promote GenAI Course"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
