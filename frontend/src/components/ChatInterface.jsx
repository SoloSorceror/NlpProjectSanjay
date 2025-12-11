import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Sparkles, Bot, User, AlertCircle, Loader2, ArrowUp, Activity } from 'lucide-react';
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

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: input,
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

    return (
        <div className="flex h-full w-full overflow-hidden bg-background relative">
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute top-[30%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]" />
                <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px]" />
            </div>

            {/* Sidebar (Desktop) */}
            <div className="hidden md:flex flex-col w-80 border-r border-border/50 bg-card/30 backdrop-blur-xl z-20">
                <div className="p-6 border-b border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/25">
                            <Activity className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-lg leading-tight">MediChat AI</h2>
                            <p className="text-xs text-muted-foreground">Symptom Checker</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 flex-1">
                    <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-primary">Disclaimer</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    This AI tool provides symptom normalization only. It is <strong>not</strong> a substitute for professional medical advice.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-border/50 text-center">
                    <p className="text-[10px] text-muted-foreground/50">v2.0.0 • Secure & Private</p>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative z-10 w-full max-w-5xl mx-auto">
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth">
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className={cn(
                                    "flex w-full",
                                    msg.sender === 'user' ? "justify-end" : "justify-start"
                                )}
                            >
                                <div className={cn(
                                    "flex max-w-[85%] md:max-w-[75%] gap-3",
                                    msg.sender === 'user' ? "flex-row-reverse" : "flex-row"
                                )}>
                                    {/* Avatar */}
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm mt-1",
                                        msg.sender === 'user' ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"
                                    )}>
                                        {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                                    </div>

                                    <div className={cn(
                                        "flex flex-col",
                                        msg.sender === 'user' ? "items-end" : "items-start"
                                    )}>
                                        <div className={cn(
                                            "px-5 py-3.5 text-[15px] leading-relaxed shadow-sm backdrop-blur-sm transition-all duration-200",
                                            msg.sender === 'user'
                                                ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                                                : "bg-card/50 border border-border/50 text-foreground rounded-2xl rounded-tl-sm hover:bg-card/80"
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
                                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border uppercase tracking-wider",
                                                    Number(msg.details.confidence) > 80
                                                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                                )}>
                                                    <Sparkles size={10} />
                                                    {msg.details.confidence}% Confidence
                                                </span>
                                            </motion.div>
                                        )}

                                        <span className="text-[10px] text-muted-foreground/60 mt-1 px-1">
                                            {msg.timestamp}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Typing Indicator */}
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start pl-11"
                        >
                            <div className="bg-card/50 border border-border/50 px-4 py-3 rounded-2xl rounded-tl-sm backdrop-blur-sm flex items-center gap-2">
                                <span className="text-xs text-muted-foreground animate-pulse">Analyzing symptoms...</span>
                                <Loader2 className="w-3 h-3 text-primary animate-spin" />
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-6 w-full max-w-4xl mx-auto z-20">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-full opacity-0 group-hover:opacity-100 transition duration-500 blur-lg pointer-events-none"></div>
                        <div className="relative flex items-center bg-card/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl p-1.5 pl-5 ring-1 ring-white/5 focus-within:ring-primary/50 transition-all duration-300">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Describe your symptoms in detail..."
                                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/70 text-sm focus:outline-none py-2"
                                disabled={loading}
                            />
                            <button
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                className="p-2.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                            >
                                <ArrowUp size={18} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                    <p className="text-center text-[10px] text-muted-foreground/50 mt-3">
                        AI can make mistakes. Consider checking important information.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
