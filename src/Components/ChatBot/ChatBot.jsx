import React, { useState, useRef, useEffect } from 'react';
import classes from './ChatBot.module.css';
import { FaRobot, FaTimes, FaPaperPlane, FaUser, FaMicrophone, FaPhone, FaPhoneSlash, FaVolumeUp } from 'react-icons/fa';
import { db } from '../../Utility/Firebase';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isCallMode, setIsCallMode] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const isCallModeRef = useRef(false);
    const isListeningRef = useRef(false);
    const isSpeakingRef = useRef(false);
    const isProcessingRef = useRef(false);
    const silenceCountRef = useRef(0);
    const utteranceRef = useRef(null); // Preserve utterance from garbage collection

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [siteKnowledge, setSiteKnowledge] = useState({
        assistantName: "Virtual Assistant",
        developerBio: "",
        siteFeatures: "",
        shippingInfo: "",
        returnPolicy: "",
        systemPrompt: ""
    });
    const messagesEndRef = useRef(null);

    // Speech Recognition setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = useRef(null);

    useEffect(() => {
        if (SpeechRecognition) {
            recognition.current = new SpeechRecognition();
            recognition.current.continuous = false;
            recognition.current.interimResults = false;
            recognition.current.lang = 'en-US';

            recognition.current.onresult = (event) => {
                const transcript = event.results[event.results.length - 1][0].transcript;
                
                // BARGE-IN: If user interrupts while AI is speaking, stop the AI immediately
                if (isSpeakingRef.current || isProcessingRef.current) {
                    window.speechSynthesis.cancel();
                    isSpeakingRef.current = false;
                    setIsSpeaking(false);
                    isProcessingRef.current = false;
                    setIsTyping(false);
                }

                setIsListening(false);
                isListeningRef.current = false;
                handleVoiceInput(transcript);
            };

            recognition.current.onerror = (event) => {
                if (event.error === 'no-speech') {
                    silenceCountRef.current += 1;
                    setIsListening(false);
                    isListeningRef.current = false;
                    return;
                }
                console.error("Speech Recognition Error:", event.error);
                setIsListening(false);
                isListeningRef.current = false;
            };

            recognition.current.onend = () => {
                setIsListening(false);
                isListeningRef.current = false;

                // LOGIC FIX: Add a tiny delay to ensure TTS has time to set its 'isSpeaking' flag
                setTimeout(() => {
                    if (isCallModeRef.current && !isSpeakingRef.current && !isProcessingRef.current) {
                        if (silenceCountRef.current >= 3) {
                            silenceCountRef.current = 0;
                            speakText(`I'm still here and listening! Did you have a question about ${siteKnowledge?.assistantName || 'the site'}?`);
                        } else {
                            startListening();
                        }
                    }
                }, 100);
            };
        }
        
        return () => {
            if (recognition.current) {
                recognition.current.onend = null; // Prevent loop on unmount
                try { recognition.current.abort(); } catch(e) {}
            }
            window.speechSynthesis.cancel();
        }
    }, []);

    // Fetch programmable knowledge base from Firebase
    useEffect(() => {
        const unsubscribe = db.collection('assistant_config').doc('main')
            .onSnapshot((doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    setSiteKnowledge(data);
                    // Set initial greeting only if this is the first load
                    setMessages(prev => prev.length === 0 ? [{ 
                        role: 'assistant', 
                        content: (data.systemPrompt?.split('\n')[0] || "System Active")
                    }] : prev);
                }
            });
        
        return () => unsubscribe();
    }, []);

    // Automated Watchdog: Restarts the listener if the system gets stuck idle
    useEffect(() => {
        let interval;
        if (isCallMode) {
            interval = setInterval(() => {
                // If call mode is active but NOTHING is happening, restart listener
                if (!isSpeakingRef.current && !isTyping && !isListeningRef.current && !isProcessingRef.current) {
                    console.log("Watchdog: Auto-restarting idle listener...");
                    startListening();
                }
            }, 3000); // Check every 3 seconds
        }
        return () => clearInterval(interval);
    }, [isCallMode, isTyping]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!input.trim() || !siteKnowledge) return;

        const userMsg = input;
        processQuery(userMsg);
        setInput('');
    };

    const handleVoiceInput = (transcript) => {
        silenceCountRef.current = 0; // Reset silence counter on success
        processQuery(transcript);
    };

    const processQuery = (query) => {
        if (!query.trim()) return;
        setMessages(prev => [...prev, { role: 'user', content: query }]);
        setIsTyping(true);
        isProcessingRef.current = true; // Block loop restart 

        setTimeout(() => {
            const botResponse = generateResponse(query);
            setMessages(prev => [...prev, { role: 'assistant', content: botResponse }]);
            setIsTyping(false);
            
            if (isCallModeRef.current) {
                // Set processing false ONLY if we don't have something to speak
                if (!botResponse) isProcessingRef.current = false;
                speakText(botResponse);
            } else {
                isProcessingRef.current = false;
            }
        }, 1200);
    }

    const speakText = (text) => {
        if (!text) {
            isProcessingRef.current = false;
            return;
        }
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            
            // Ref for the utterance to prevent garbage collection in some browsers
            utteranceRef.current = new SpeechSynthesisUtterance(text);
            
            isSpeakingRef.current = true;
            setIsSpeaking(true);
            // BARGE-IN: We DON'T set isListening = false here, we want to keep listening
            // BARGE-IN: We DON'T set isListening = false here, we want to keep listening
            isProcessingRef.current = false;

            utteranceRef.current.onstart = () => {
                isSpeakingRef.current = true;
                setIsSpeaking(true);
                // Ensure listener is running while we speak for barge-in
                if (isCallModeRef.current) startListening();
            };

            utteranceRef.current.onend = () => {
                isSpeakingRef.current = false;
                setIsSpeaking(false);
                utteranceRef.current = null;
                if (isCallModeRef.current) {
                    setTimeout(() => startListening(), 400);
                }
            };

            utteranceRef.current.onerror = (event) => {
                console.error("TTS Error:", event);
                isSpeakingRef.current = false;
                setIsSpeaking(false);
                utteranceRef.current = null;
                if (isCallModeRef.current) startListening();
            };

            setTimeout(() => {
                if (utteranceRef.current) {
                    window.speechSynthesis.speak(utteranceRef.current);
                }
            }, 50);
        }
    };

    const startListening = () => {
        // Guard: Don't start listening if thinking or already listening
        // Note: We ALLOW listening while speaking for Barge-in!
        if (!isCallModeRef.current || isListeningRef.current || isProcessingRef.current) {
            return;
        }

        if (recognition.current) {
            try {
                recognition.current.start();
                setIsListening(true);
                isListeningRef.current = true;
                console.log("Microphone Open.");
            } catch (err) {
                if (err.name !== 'InvalidStateError') {
                    console.error("Speech Recognition Start Error:", err);
                    isListeningRef.current = false;
                    setIsListening(false);
                }
            }
        }
    };

    const toggleCallMode = () => {
        if (!isCallMode) {
            setIsCallMode(true);
            isCallModeRef.current = true;
            isSpeakingRef.current = false;
            isProcessingRef.current = false;
            setIsListening(false);
            isListeningRef.current = false;
            
            // First time greeting - purely data driven
            const intro = (siteKnowledge?.systemPrompt?.split(/Q:/i)[0] || "i am your professional virtual assistant. how can i assist you today?");
            speakText(intro);
        } else {
            setIsCallMode(false);
            isCallModeRef.current = false;
            isSpeakingRef.current = false;
            isProcessingRef.current = false;
            setIsListening(false);
            isListeningRef.current = false;
            setIsSpeaking(false);
            isSpeakingRef.current = false;
            isProcessingRef.current = false;
            window.speechSynthesis.cancel();
            if (recognition.current) {
                try { recognition.current.abort(); } catch(e) {}
            }
        }
    };

    const generateResponse = (query) => {
        if (!siteKnowledge) return "Syncing...";
        
        const q = query.toLowerCase();
        const prompt = siteKnowledge.systemPrompt || "";
        
        // Smarter Persona Extraction: Grab everything BEFORE the first "Q:"
        const persona = prompt.split(/Q:/i)[0] || "";

        // Advanced FAQ Search: Scans the prompt lines for the best question match
        const findAnswerInPrompt = (userInput) => {
            const lines = prompt.split('\n');
            const matchIndex = lines.findIndex(l => {
                const line = l.toLowerCase();
                return line.startsWith('q:') && userInput.split(' ').some(word => word.length > 2 && line.includes(word));
            });
            
            if (matchIndex !== -1 && lines[matchIndex + 1]) {
                return lines[matchIndex + 1].replace(/A:/i, '').trim();
            }
            return null;
        };

        // Voice Exit Commands
        if (isCallMode && (q.includes("stop") || q.includes("end call") || q.includes("goodbye") || q.includes("hang up") || q.includes("exit"))) {
            setTimeout(() => toggleCallMode(), 1500);
            return "Ending call. Goodbye!";
        }

        // 1. Try to find a custom answer in your System Prompt FAQ first
        const promptAnswer = findAnswerInPrompt(q);
        if (promptAnswer) return promptAnswer;

        // 2. Fallbacks for missing FAQ items - using direct fields without repeating intro
        if (q.includes("return") || q.includes("policy")) {
            return siteKnowledge.returnPolicy || persona;
        }
        if (q.includes("who built") || q.includes("developer") || q.includes("wabi") || q.includes("author") || q.includes("created") || q.includes("founder")) {
            return siteKnowledge.developerBio || persona;
        }
        if (q.includes("shipping") || q.includes("delivery") || q.includes("location") || q.includes("ship")) {
            return siteKnowledge.shippingInfo || persona;
        }
        if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
            return persona;
        }
        
        return persona;
    };

    return (
        <div className={classes.chatbotContainer}>
            <button 
                className={classes.chatToggle} 
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle AI Assistant"
            >
                {isOpen ? <FaTimes /> : <FaRobot />}
            </button>

            {isOpen && (
                <div className={classes.chatWindow}>
                    <div className={classes.chatHeader}>
                        <div className={classes.headerTitle}>
                            <FaRobot className={classes.headerIcon} />
                            <div>
                                <h4>{siteKnowledge?.assistantName || "Amazon AI"}</h4>
                                <div className={classes.statusRow}>
                                    <span className={classes.statusDot}></span>
                                    <span>Online & Learning</span>
                                </div>
                            </div>
                        </div>
                        <div className={classes.headerActions}>
                            <button 
                                onClick={toggleCallMode} 
                                className={`${classes.actionBtn} ${isCallMode ? classes.activeCall : ''}`}
                                title="Start Voice Call"
                            >
                                <FaPhone />
                            </button>
                            <button onClick={() => setIsOpen(false)} className={classes.closeBtn}><FaTimes /></button>
                        </div>
                    </div>

                    <div className={classes.messagesList}>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`${classes.messageRow} ${msg.role === 'user' ? classes.userRow : classes.botRow}`}>
                                <div className={classes.avatar}>
                                    {msg.role === 'user' ? <FaUser /> : <FaRobot />}
                                </div>
                                <div className={classes.messageContent}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className={classes.typingIndicator}>
                                <span></span><span></span><span></span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {isCallMode && (
                        <div className={classes.callOverlay}>
                            <div className={classes.callContent}>
                                <div className={`${classes.pulseCircle} ${isListening ? classes.listening : isSpeaking ? classes.activeSpeaking : ''}`}>
                                    <FaRobot />
                                </div>
                                <h3>
                                    {isSpeaking ? "AI is speaking..." : 
                                     isTyping ? "AI is thinking..." : "I'm Listening..."}
                                </h3>
                                <div className={`${classes.visualizer} ${isListening || isSpeaking ? classes.recording : ''}`}>
                                    <span></span><span></span><span></span><span></span><span></span>
                                </div>
                                <button onClick={toggleCallMode} className={classes.endCallBtn}>
                                    <FaPhoneSlash /> End Call
                                </button>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSendMessage} className={classes.inputArea}>
                        <input 
                            type="text" 
                            placeholder="Ask me anything..." 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button type="submit" disabled={!input.trim()}><FaPaperPlane /></button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatBot;
