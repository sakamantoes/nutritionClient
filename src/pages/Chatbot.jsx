// src/pages/Chatbot.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  Mic, 
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  Brain,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useChatbot } from '../hooks/useChatbot';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import MessageBubble from '../components/chatbot/MessageBubble';
import QuickQuestions from '../components/chatbot/QuickQuestions';

const Chatbot = () => {
  const { user } = useAuth();
  const {
    messages,
    input,
    setInput,
    isTyping,
    sendMessage,
    handleQuickQuestion,
    quickQuestions,
    messagesEndRef,
    isLoading,
  } = useChatbot(user?.id);

  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const chatContainerRef = useRef(null);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.start();
      setIsListening(true);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        // Auto-send after voice input
        setTimeout(() => {
          sendMessage(transcript);
        }, 500);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } else {
      alert('Speech recognition is not supported in this browser. Try using Chrome, Edge, or Safari.');
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="h-[calc(100vh-8rem)] flex flex-col"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              AI Nutrition Assistant
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Get personalized nutrition advice powered by machine learning
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 rounded-full">
              <Sparkles className="h-4 w-4 mr-1.5 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                AI Powered
              </span>
            </div>
            <div className="flex items-center px-3 py-1.5 bg-secondary-50 dark:bg-secondary-900/30 rounded-full">
              <Brain className="h-4 w-4 mr-1.5 text-secondary-600 dark:text-secondary-400" />
              <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                ML Enhanced
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Chat Container */}
        <div className="lg:col-span-2 h-full">
          <Card className="h-full flex flex-col p-0 overflow-hidden">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg">
                    <Bot className="h-6 w-6 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      NutriAI Assistant
                    </h3>
                    <div className="flex items-center mt-0.5">
                      <span className="relative flex h-2.5 w-2.5 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
                      </span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {isTyping ? 'Typing...' : 'Online • Ready to help'}
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQuickQuestions(!showQuickQuestions)}
                  className="hidden md:flex items-center"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {showQuickQuestions ? 'Hide' : 'Show'} Quick Questions
                  {showQuickQuestions ? (
                    <ChevronUp className="h-4 w-4 ml-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-2" />
                  )}
                </Button>
              </div>
            </div>

            {/* Messages Container */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
            >
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </AnimatePresence>
              
              {/* Typing Indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center space-x-2"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center shadow-sm">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 rounded-tl-none shadow-sm">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions - Mobile Toggle */}
            <button
              onClick={() => setShowQuickQuestions(!showQuickQuestions)}
              className="lg:hidden flex items-center justify-center space-x-2 py-2 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              <span>{showQuickQuestions ? 'Hide' : 'Show'} Quick Questions</span>
              {showQuickQuestions ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {/* Quick Questions Panel */}
            <AnimatePresence>
              {showQuickQuestions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <QuickQuestions 
                    questions={quickQuestions} 
                    onSelect={handleQuickQuestion} 
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about nutrition, exercise, or health..."
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none min-h-[60px] max-h-[120px] transition-all duration-200"
                    rows="1"
                    disabled={isTyping}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleVoiceInput}
                    disabled={isTyping || isListening}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                      isListening
                        ? 'bg-danger text-white animate-pulse'
                        : 'text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-white dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                    }`}
                    title={isListening ? 'Listening...' : 'Voice input'}
                  >
                    <Mic className="h-5 w-5" />
                  </button>
                  <button
                    className="p-3 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-white dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl transition-colors"
                    title="Upload food image"
                    disabled={isTyping}
                  >
                    <ImageIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || isTyping || isLoading}
                    className="p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                    title="Send message"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Press Enter to send • Shift+Enter for new line • Voice input supported
              </p>
            </div>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6 overflow-y-auto">
          {/* Capabilities Card */}
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Zap className="h-5 w-5 text-primary-500" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  What I Can Do
                </h3>
              </div>
              <div className="space-y-4">
                {[
                  { icon: '🍎', title: 'Nutrition Analysis', desc: 'Analyze food nutrients and health impact' },
                  { icon: '📋', title: 'Meal Planning', desc: 'Create personalized meal plans' },
                  { icon: '💪', title: 'Exercise Advice', desc: 'Recommend workouts based on goals' },
                  { icon: '🎯', title: 'Goal Setting', desc: 'Help set and track health goals' },
                  { icon: '📊', title: 'Progress Tracking', desc: 'Monitor your health journey' },
                  { icon: '🧠', title: 'Nutrition Education', desc: 'Explain nutrition concepts clearly' },
                ].map((capability, index) => (
                  <div key={index} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <span className="text-2xl">{capability.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {capability.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {capability.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Pro Tips Card */}
          <motion.div variants={itemVariants}>
            <Card className="p-6 bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
              <div className="flex items-center space-x-2 mb-6">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <h3 className="text-xl font-bold text-black">Pro Tips</h3>
              </div>
              <div className="space-y-4">
                {[
                  'Ask specific questions for better answers',
                  'Share your health goals for personalized advice',
                  'Upload food photos for instant analysis',
                  'Ask about meal timing and portion sizes',
                  'Get supplement and vitamin recommendations',
                ].map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="h-2 w-2 rounded-full bg-indigo-500 mt-2"></div>
                    <p className="text-sm opacity-90 leading-relaxed text-indigo-500">{tip}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Popular Topics */}
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Brain className="h-5 w-5 text-primary-500" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Popular Topics
                </h3>
              </div>
              <div className="space-y-2">
                {[
                  'High protein diet for muscle gain',
                  'Intermittent fasting benefits',
                  'Low carb vs low fat',
                  'Pre and post workout nutrition',
                  'Healthy eating on a budget',
                  'Meal prep strategies',
                  'Hydration during exercise',
                ].map((topic, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(`Tell me about ${topic.toLowerCase()}`)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <p className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                      {topic}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Click to start conversation
                    </p>
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Chatbot;