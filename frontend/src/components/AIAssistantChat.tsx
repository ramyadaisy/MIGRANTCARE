import React, { useState } from 'react';
import { Bot, Send, Volume2, ShieldAlert, Sparkles, HelpCircle, MessageSquare } from 'lucide-react';
import { ApiService } from '../services/api';
import { VoiceAssistant } from '../services/voice';
import { LanguageCode, translations } from '../locales/translations';

interface AIAssistantChatProps {
  language: LanguageCode;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
  explanation?: string;
  suggestedQuestions?: string[];
  isEmergency?: boolean;
}

export const AIAssistantChat: React.FC<AIAssistantChatProps> = ({ language }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "Hello! I am MigrantCare AI, your multilingual health information assistant. I can explain clinical terms from your reports, clarify prescription directions, or suggest questions to ask your doctor. How can I help you today?",
      suggestedQuestions: [
        "What is Hemoglobin (Hb)?",
        "How do I take Levocetirizine?",
        "Explain Blood Pressure numbers",
        "How to protect lungs from cement dust?"
      ]
    }
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const t = translations[language];

  const handleSend = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim()) return;

    const userMsg: Message = { sender: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    setInputQuery("");
    setLoading(true);

    try {
      const res = await ApiService.queryAI(q, language);
      const isEmergency = q.toLowerCase().includes("chest pain") || q.toLowerCase().includes("cannot breathe");
      
      const aiMsg: Message = {
        sender: 'ai',
        text: res.reply,
        explanation: res.explanation,
        suggestedQuestions: res.suggested_questions_for_doctor,
        isEmergency: isEmergency
      };
      setMessages(prev => [...prev, aiMsg]);

      // If user has TTS active or wants automatic readout
      if (isEmergency) {
        VoiceAssistant.speak("Emergency alert triggered. Please seek immediate professional medical care.", language);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: "I am unable to connect to the medical knowledge base right now. Please consult a healthcare professional."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleReadAloud = (text: string) => {
    VoiceAssistant.speak(text.replace(/[*#_]/g, ''), language);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Title */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">MigrantCare AI Health Assistant</h2>
            <p className="text-xs text-slate-500">
              Educational explanation of clinical terms, prescription schedules, and doctor visit prep.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-200">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Multilingual Assist</span>
        </div>
      </div>

      {/* Safety Disclaimer Banner */}
      <div className="bg-amber-50 rounded-2xl p-3.5 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span>
          <strong>Safety Guardrail:</strong> MigrantCare AI does not diagnose diseases or prescribe medications. It helps you understand medical terminology and prepare questions for your doctor. In acute emergencies, call 108/112 or visit an emergency room immediately.
        </span>
      </div>

      {/* Chat Messages Log */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 min-h-[420px] flex flex-col justify-between space-y-4">
        <div className="space-y-4 overflow-y-auto max-h-[450px] pr-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-xl p-4 rounded-3xl text-xs leading-relaxed shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : msg.isEmergency
                    ? 'bg-rose-50 border-2 border-rose-300 text-rose-950 rounded-tl-none'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {msg.sender === 'ai' && (
                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <button
                      onClick={() => handleReadAloud(msg.text)}
                      className="text-[11px] font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 transition"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      Read Aloud
                    </button>
                    <span className="text-[10px] text-slate-400">MigrantCare AI</span>
                  </div>
                )}
              </div>

              {/* Suggested Follow-up Questions Pills */}
              {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-2 max-w-xl">
                  {msg.suggestedQuestions.map((q, qIdx) => (
                    <button
                      key={qIdx}
                      onClick={() => handleSend(q)}
                      className="text-[11px] font-semibold bg-indigo-50/80 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 px-3 py-1 rounded-full transition flex items-center gap-1 text-left"
                    >
                      <HelpCircle className="w-3 h-3 text-indigo-500 shrink-0" />
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 italic">
              <Bot className="w-4 h-4 animate-spin text-indigo-500" />
              MigrantCare AI is researching healthcare knowledge...
            </div>
          )}
        </div>

        {/* Query Input */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about a medical term, test result, or symptom (e.g. What is Fasting Glucose?)"
            className="flex-1 text-xs font-medium p-3.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || loading}
            className="p-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-md shadow-blue-500/20 disabled:bg-slate-200 disabled:text-slate-400"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
