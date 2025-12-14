import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Sparkles, Bot, User, AlertCircle, Loader2, ArrowUp, Activity, Menu, X, Heart, Shield, Stethoscope, Zap, Brain, Pill } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const ChatInterface = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hello. I'm your Medical Assistant. Please describe your symptoms in detail so I can help you.",
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSend = async (text = input) => {
        if (!text.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: text,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:8000/predict', {
                text: userMessage.text
            });

            const { normalized_symptom, confidence } = response.data;
            const isApology = normalized_symptom.startsWith("I am sorry");

            let botText = normalized_symptom;
            if (!isApology) {
                botText = `I've identified this as: ${normalized_symptom}. Please consult a doctor for confirmation.`;
            }

            const botMessage = {
                id: Date.now() + 1,
                text: botText,
                sender: 'bot',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                details: isApology ? null : { symptom: normalized_symptom, confidence: (confidence * 100).toFixed(1) },
                isApology
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Error:", error);
            const errorMessage = {
                id: Date.now() + 1,
                text: "Sorry, connection issue. Please try again.",
                sender: 'bot',
                isError: true,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    const suggestions = [
        { icon: Heart, label: "Cardiology", query: "I have chest pain and rapid heartbeat" },
        { icon: Brain, label: "Neurology", query: "Frequent migraines and dizziness" },
        { icon: Stethoscope, label: "General", query: "Fever and body aches" },
        { icon: Pill, label: "Pharmacy", query: "Side effects of painkillers" },
    ];

    return (
        <div className="flex h-full w-full overflow-hidden bg-background relative selection:bg-primary/30 selection:text-white">
            {/* Enhanced Abstract Background with Grid */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />
                <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-purple-900/50 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] bg-indigo-900/50 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: '1s' }} />
                <div className="absolute top-[30%] left-[40%] w-[40%] h-[40%] bg-fuchsia-600/30 rounded-full blur-[100px] mix-blend-overlay" />
            </div>

            {/* Sidebar (Desktop) */}
            <div className="hidden md:flex flex-col w-80 border-r border-white/10 bg-black/20 backdrop-blur-2xl z-20 shadow-2xl relative overflow-hidden">
                {/* Robot Mascot Container */}
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px] z-0 pointer-events-none" />

                <div className="p-8 border-b border-white/5 relative z-10">
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative group cursor-pointer">
                            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/40 to-fuchsia-500/40 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="relative w-32 h-32 rounded-full flex items-center justify-center filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-105">
                                <img
                                    src="/src/assets/robot_mascot.png"
                                    alt="MediChat Bot"
                                    className="w-full h-full object-contain transform hover:rotate-2 transition-transform duration-300"
                                />
                            </div>
                            <div className="absolute bottom-1 right-2 w-4 h-4 rounded-full bg-emerald-500 border-2 border-black/50 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        </div>

                        <div className="text-center">
                            <h2 className="font-bold text-2xl tracking-tight text-white/90 mb-1">MediChat AI</h2>
                            <p className="text-sm text-white/60 font-medium bg-white/5 px-3 py-1 rounded-full inline-block border border-white/5">
                                Virtual Health Assistant
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-md hover:bg-white/10 transition-colors">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                            <div className="space-y-2">
                                <p className="text-sm font-semibold text-white/90">Disclaimer</p>
                                <p className="text-xs text-white/60 leading-relaxed">
                                    This AI tool provides <strong>symptom normalization</strong> only.
                                    <br /><br />
                                    It is <span className="text-amber-400">not a diagnosic tool</span> and should not replace professional medical advice.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-white/5 text-center bg-black/20">
                    <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">v2.0.0 • Encrypted</p>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative z-10 w-full max-w-5xl mx-auto">
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth custom-scrollbar">
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                                className={cn(
                                    "flex w-full",
                                    msg.sender === 'user' ? "justify-end" : "justify-start"
                                )}
                            >
                                <div className={cn(
                                    "flex max-w-[85%] md:max-w-[70%] gap-4",
                                    msg.sender === 'user' ? "flex-row-reverse" : "flex-row"
                                )}>
                                    {/* Avatar */}
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg ring-1 ring-white/10",
                                        msg.sender === 'user'
                                            ? "bg-gradient-to-tr from-indigo-500 to-purple-600 text-white"
                                            : "bg-white/10 backdrop-blur-md text-white"
                                    )}>
                                        {msg.sender === 'user' ? <User size={18} /> : <Bot size={18} />}
                                    </div>

                                    <div className={cn(
                                        "flex flex-col",
                                        msg.sender === 'user' ? "items-end" : "items-start"
                                    )}>
                                        <div className={cn(
                                            "px-6 py-4 text-[15px] leading-relaxed shadow-xl backdrop-blur-xl border border-white/10 transition-all duration-300",
                                            msg.sender === 'user'
                                                ? "bg-gradient-to-br from-primary to-violet-700 text-white rounded-3xl rounded-tr-sm"
                                                : "bg-white/5 text-white/90 rounded-3xl rounded-tl-sm hover:bg-white/10"
                                        )}>
                                            <p>{msg.text}</p>
                                        </div>

                                        {/* Confidence Chip */}
                                        {msg.details && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="mt-2"
                                            >
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider shadow-lg backdrop-blur-md",
                                                    Number(msg.details.confidence) > 80
                                                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                                        : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                                )}>
                                                    <Sparkles size={10} className="fill-current" />
                                                    {msg.details.confidence}% Match
                                                </span>
                                            </motion.div>
                                        )}

                                        <span className="text-[10px] text-white/30 mt-1.5 px-2 font-medium">
                                            {msg.timestamp}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Suggested Topics (Visible when minimal messages) */}
                    {messages.length <= 2 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
                        >
                            {suggestions.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSend(item.query)}
                                    className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 hover:border-primary/50 hover:scale-105 transition-all duration-300 group backdrop-blur-sm"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-white/10 to-white/5 flex items-center justify-center mb-3 group-hover:from-primary/20 group-hover:to-purple-500/20 transition-colors">
                                        <item.icon className="w-6 h-6 text-white/70 group-hover:text-primary transition-colors" />
                                    </div>
                                    <span className="text-sm font-medium text-white/80 group-hover:text-white">{item.label}</span>
                                </button>
                            ))}
                        </motion.div>
                    )}

                    {/* Typing Indicator */}
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start pl-14"
                        >
                            <div className="bg-white/5 border border-white/10 px-5 py-3.5 rounded-3xl rounded-tl-sm backdrop-blur-md flex items-center gap-3 shadow-lg">
                                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                <span className="text-xs text-white/60 font-medium tracking-wide animate-pulse">Running diagnostics...</span>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-8 w-full max-w-4xl mx-auto z-20">
                    <div className="relative group">
                        {/* Glow Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full opacity-30 group-hover:opacity-60 transition duration-500 blur-xl"></div>

                        <div className="relative flex items-center bg-black/40 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl p-2 pl-6 ring-1 ring-white/5 focus-within:ring-primary/50 transition-all duration-300">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Describe your symptoms in detail..."
                                className="flex-1 bg-transparent text-white placeholder:text-white/40 text-sm focus:outline-none py-2.5 font-medium tracking-wide"
                                disabled={loading}
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={loading || !input.trim()}
                                className="p-3.5 bg-gradient-to-br from-primary to-indigo-600 text-white rounded-full hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30"
                            >
                                <ArrowUp size={20} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-white/30 font-medium tracking-widest uppercase">
                        <Activity size={10} />
                        <span>AI-Powered Symptom Checker</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
