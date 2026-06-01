import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Volume2, Mic, MicOff, Info, HelpCircle, X, ShieldAlert, HeartPulse } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface DhanvantariChatProps {
  onClose?: () => void;
}

export default function DhanvantariChat({ onClose }: DhanvantariChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Pranam! Main Dhanvantari Ji hoon—aapki Sehat Setu Swasthya aur Healthcare Assistance guide.\n\nMain aapko clinical reports (biomarkers), home remedies (gharelu nuskhe), common health symptoms (fever, sugar, BP, pait gas), transparent surgery costs, live ICU beds, aur sarkari yojanao (schemes) ki sateek aur transparent jankari de sakti hoon.\n\nKrupya puchiye—aapki kya seva karoon?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeSpeechIndex, setActiveSpeechIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const speechTimer = useRef<NodeJS.Timeout | null>(null);

  const suggestionPills = [
    "Sardi-khansi aur bukhar ke remedies?",
    "Sugar control & fasting checking rules?",
    "High BP control tips (lifestyle)?",
    "First aid guidelines for burns/trauma?",
    "Patna me free ICU beds kahan hain?",
    "Angioplasty surgery ka standard cost?",
    "Ayushman Bharat documents list?"
  ];

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    
    const text = textToSend;
    setInputMessage('');
    // Append user message
    const updatedMessages = [...messages, { role: 'user' as const, content: text }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      setMessages([...updatedMessages, { role: 'assistant', content: data.text }]);
    } catch (e) {
      console.error(e);
      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: 'Krupya khed hai. Server response me samasya aayi hai. Krupya dobara prayas karein ya niche diye suggestions ka sahara lein.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate Voice input microphone
  const toggleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      // Inject random spoken queries in Hinglish for Patna/Bihar
      const randomVoiced = [
        "Sarkari Mukhyamantri Yojana ke bare me bataiye",
        "Knee Replacement operation me kitna kharch hota h",
        "Emergency ambulance service kahan milegi"
      ];
      const selected = randomVoiced[Math.floor(Math.random() * randomVoiced.length)];
      handleSendMessage(selected);
    } else {
      setIsListening(true);
      if (isPlayingAudio) stopVoiceSimulation();
    }
  };

  const simulateSpeechSynthesis = (msgIndex: number, textContent: string) => {
    if (isPlayingAudio) {
      stopVoiceSimulation();
      return;
    }

    setIsPlayingAudio(true);
    setActiveSpeechIndex(msgIndex);

    // Simulate 4-second audio wave motion
    speechTimer.current = setTimeout(() => {
      stopVoiceSimulation();
    }, 5500);
  };

  const stopVoiceSimulation = () => {
    if (speechTimer.current) clearTimeout(speechTimer.current);
    setIsPlayingAudio(false);
    setActiveSpeechIndex(null);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden flex flex-col h-[600px] w-full max-w-lg mx-auto" id="dhanvantari-chat-panel">
      {/* Brand Header */}
      <div className="bg-gradient-to-r from-[#0F9D58] to-[#128a4f] p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-white/15 backdrop-blur-xs rounded-full flex items-center justify-center border border-white/20">
            <HeartPulse className="w-5 h-5 text-yellow-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-sans font-bold text-base leading-none">Dhanvantari Ji</h2>
              <span className="bg-white/20 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm letter-spacing">Super AI Guide</span>
            </div>
            <p className="text-[10px] text-emerald-100 mt-1 flex items-center gap-1 leading-none">
              <span className="w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping"></span>
              Hindi & English Margdarshak
            </p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full border border-white/10"
            aria-label="Close Chat"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Warning Healthcare Advisory disclaimer */}
      <div className="bg-amber-50/85 px-4 py-2 border-b border-amber-100 flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span className="text-[10px] font-medium leading-normal text-amber-800">
          <strong>LAL BADGE NOTICE:</strong> AI paramarsh keval shiksha aur discovery transparency ke liye hai. Sateek ilaaj aur dawayo ke liye certified doctor ya emergency specialist se turant milen.
        </span>
      </div>

      {/* Messages Scroll Feed Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 flex flex-col">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
          >
            <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-[#4285F4] text-white rounded-br-none shadow-xs' 
                : 'bg-white text-gray-800 border border-gray-150 rounded-bl-none shadow-2xs'
            }`}>
              <p className="whitespace-pre-line font-medium">{msg.content}</p>
            </div>
            {msg.role === 'assistant' && (
              <div className="flex items-center gap-2 mt-1 px-1">
                <button 
                  onClick={() => simulateSpeechSynthesis(index, msg.content)}
                  className={`text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1 transition-all ${
                    activeSpeechIndex === index 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                      : 'bg-gray-200/60 hover:bg-gray-200 text-gray-600 border border-gray-250/50'
                  }`}
                  title="Simulate Voice Output"
                >
                  <Volume2 className={`w-3 h-3 ${activeSpeechIndex === index ? 'animate-bounce' : ''}`} />
                  {activeSpeechIndex === index ? 'Speaking...' : 'Listen Output'}
                </button>
                {activeSpeechIndex === index && (
                  <div className="flex gap-0.5 items-center shrink-0">
                    <span className="w-1 h-3 bg-emerald-500 animate-pulse"></span>
                    <span className="w-1 h-4 bg-emerald-500 animate-pulse" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-1 h-2 bg-emerald-500 animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1 h-5 bg-emerald-500 animate-pulse" style={{ animationDelay: '0.3s' }}></span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="self-start flex gap-1.5 items-center bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none">
            <span className="text-xs text-gray-500 font-semibold italic flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#0F9D58] animate-spin" />
              Dhanvantari Ji is analyzing Swasthya data...
            </span>
            <div className="flex gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 bg-[#0F9D58] rounded-full"></span>
              <span className="w-1.5 h-1.5 bg-[#0F9D58] rounded-full" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-1.5 h-1.5 bg-[#0F9D58] rounded-full" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Quick Chips */}
      <div className="px-3 py-2 bg-gray-100 border-t border-gray-200 scroll-x flex gap-1.5 overflow-x-auto whitespace-nowrap shrink-0">
        {suggestionPills.map((pill, i) => (
          <button 
            key={i} 
            onClick={() => handleSendMessage(pill)}
            className="text-[11px] font-semibold text-[#0F9D58] bg-white border border-emerald-150/60 hover:bg-emerald-50 hover:border-emerald-200 px-3 py-1 rounded-full cursor-pointer shrink-0 shadow-3xs"
          >
            {pill}
          </button>
        ))}
      </div>

      {/* Input controls and Voice capture */}
      <div className="p-3 border-t bg-white flex flex-col gap-2 shrink-0">
        {isListening && (
          <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-2xl text-center flex items-center justify-between gap-3 shrink-0 animate-pulse">
            <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5 animate-bounce">
              <span className="w-2 h-2 bg-rose-600 rounded-full"></span>
              Sehat Voice: Capture status active... (Hindi/English Spoken)
            </span>
            <div className="flex gap-0.5 items-center">
              {[4, 10, 6, 12, 8, 4].map((h, i) => (
                <span 
                  key={i} 
                  className="w-1 bg-rose-500 animate-pulse rounded-full" 
                  style={{ height: `${h}px`, animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <button 
              onClick={() => setIsListening(false)}
              className="text-xs font-semibold text-rose-700 hover:underline shrink-0 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Simulated Mic trigger */}
          <button 
            onClick={toggleVoiceInput}
            className={`p-3 rounded-2xl text-white transition-all duration-300 scale-hover cursor-pointer shadow-xs ${
              isListening ? 'bg-rose-600 animate-pulse' : 'bg-[#4285F4] hover:bg-blue-600'
            }`}
            title="Simulate Speech Input"
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input area */}
          <input 
            type="text" 
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
            placeholder="Type your query (e.g. ICU bed near PMCH)..."
            className="flex-1 bg-gray-50 border border-gray-250 hover:border-gray-350 focus:border-[#0F9D58] focus:bg-white focus:outline-hidden text-sm px-4 py-3 rounded-2xl transition-all"
            id="chat-text-input"
          />

          {/* Trigger dispatch */}
          <button 
            onClick={() => handleSendMessage(inputMessage)}
            disabled={!inputMessage.trim() || isLoading}
            className="p-3 bg-[#0F9D58] hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl shadow-xs cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
