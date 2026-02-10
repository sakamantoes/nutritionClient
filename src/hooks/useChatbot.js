import { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation } from 'react-query';
import { chatbotApi, mlApi } from '../utils/api';

export const useChatbot = (userId) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI nutrition assistant. I can help you with:\n\n• Nutrition advice\n• Meal planning\n• Food analysis\n• Exercise recommendations\n• Health goals\n\nWhat would you like to know today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Send message mutation
  const sendMessageMutation = useMutation(chatbotApi.sendMessage, {
    onSuccess: (data) => {
      addMessage({
        text: data.response,
        sender: 'bot',
      });
      setIsTyping(false);
    },
    onError: () => {
      // Fallback to local responses if API fails
      const fallbackResponse = getFallbackResponse(input);
      addMessage({
        text: fallbackResponse,
        sender: 'bot',
      });
      setIsTyping(false);
    },
  });

  // Python chatbot mutation (more advanced)
  const pythonChatbotMutation = useMutation(mlApi.chatbotResponse, {
    onSuccess: (data) => {
      addMessage({
        text: data.response,
        sender: 'bot',
      });
      setIsTyping(false);
    },
    onError: () => {
      // Fall back to basic chatbot
      sendMessageMutation.mutate({ message: input, userId });
    },
  });

  const addMessage = useCallback((message) => {
    const newMessage = {
      id: messages.length + 1,
      ...message,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  }, [messages.length]);

  const sendMessage = useCallback(async (text = input) => {
    if (!text.trim()) return;

    // Add user message
    addMessage({
      text: text.trim(),
      sender: 'user',
    });

    setInput('');
    setIsTyping(true);

    try {
      // Try Python AI chatbot first
      await pythonChatbotMutation.mutateAsync({ message: text });
    } catch (error) {
      console.error('Chatbot error:', error);
      setIsTyping(false);
    }
  }, [input, addMessage, pythonChatbotMutation]);

  const getFallbackResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    const responses = {
      greeting: ["Hello! How can I help with your nutrition today?", "Hi there! Ready to optimize your health?"],
      calorie: ["Calories measure energy. Average needs: 2000-2500/day. Want personalized advice?"],
      protein: ["Protein builds muscle. Aim for 0.8-1.2g per kg of body weight daily."],
      workout: ["For weight loss: 150+ min cardio/week. For muscle gain: strength training 3-4x/week."],
      meal: ["Try balanced meals: protein + veggies + whole grains. Need specific meal ideas?"],
      weight: ["Healthy weight loss: 1-2 lbs/week. Focus on calorie deficit and regular exercise."],
      water: ["Drink 2-3 liters daily. More if you exercise or live in hot climate."],
      default: ["I can help with nutrition advice. Could you be more specific about your question?"]
    };

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
    }
    if (lowerMessage.includes('calor')) {
      return responses.calorie[0];
    }
    if (lowerMessage.includes('protein')) {
      return responses.protein[0];
    }
    if (lowerMessage.includes('workout') || lowerMessage.includes('exercise')) {
      return responses.workout[0];
    }
    if (lowerMessage.includes('meal') || lowerMessage.includes('food') || lowerMessage.includes('eat')) {
      return responses.meal[0];
    }
    if (lowerMessage.includes('weight')) {
      return responses.weight[0];
    }
    if (lowerMessage.includes('water') || lowerMessage.includes('hydrat')) {
      return responses.water[0];
    }
    
    return responses.default[0];
  };

  const quickQuestions = [
    "What's a healthy breakfast?",
    "How much protein do I need?",
    "Best foods for weight loss?",
    "How to read nutrition labels?",
    "Healthy snack ideas?",
    "How much water should I drink?",
    "Best time to exercise?",
    "How to boost metabolism?",
    "Low-calorie dinner ideas?",
    "How much sleep for weight loss?",
  ];

  const handleQuickQuestion = useCallback((question) => {
    sendMessage(question);
  }, [sendMessage]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return {
    messages,
    input,
    setInput,
    isTyping,
    sendMessage,
    handleQuickQuestion,
    quickQuestions,
    messagesEndRef,
    isLoading: sendMessageMutation.isLoading || pythonChatbotMutation.isLoading,
  };
};