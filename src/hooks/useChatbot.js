// src/hooks/useChatbot.js
import { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation } from 'react-query';
import { chatbotApi, mlApi } from '../utils/api';

export const useChatbot = (userId) => {
  const [messages, setMessages] = useState([
    {
      id: 'initial-1',
      text: "Hello! I'm your AI nutrition assistant. I can help you with:\n\n• Nutrition advice\n• Meal planning\n• Food analysis\n• Exercise recommendations\n• Health goals\n\nWhat would you like to know today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const messageIdCounter = useRef(2); // Start after initial message

  // Generate unique IDs for messages
  const generateMessageId = () => {
    const id = `msg-${Date.now()}-${messageIdCounter.current}`;
    messageIdCounter.current += 1;
    return id;
  };

  const addMessage = useCallback((message) => {
    const newMessage = {
      id: generateMessageId(),
      ...message,
      timestamp: new Date(),
    };
    
    setMessages(prevMessages => {
      // Check if message already exists to prevent duplicates
      const exists = prevMessages.some(m => m.id === newMessage.id);
      if (exists) return prevMessages;
      return [...prevMessages, newMessage];
    });
  }, []);

  // Send message mutation
  const sendMessageMutation = useMutation(
    (data) => chatbotApi.sendMessage(data),
    {
      onSuccess: (response) => {
        console.log('Chatbot API response:', response.data);
        
        // Extract the response text from the API response
        let botResponse = '';
        
        if (response.data && response.data.response) {
          botResponse = response.data.response;
        } else if (response.data && typeof response.data === 'string') {
          botResponse = response.data;
        } else {
          botResponse = "I'm here to help with nutrition questions. Could you be more specific?";
        }
        
        addMessage({
          text: botResponse,
          sender: 'bot',
        });
        setIsTyping(false);
      },
      onError: (error) => {
        console.error('Chatbot API error:', error);
        // Fallback to local responses if API fails
        const fallbackResponse = getFallbackResponse(input);
        addMessage({
          text: fallbackResponse,
          sender: 'bot',
        });
        setIsTyping(false);
      },
    }
  );

  // Python chatbot mutation (more advanced)
  const pythonChatbotMutation = useMutation(
    (data) => mlApi.chatbotResponse(data),
    {
      onSuccess: (response) => {
        console.log('Python chatbot response:', response.data);
        
        // Extract the response text from the Python API response
        let botResponse = '';
        
        if (response.data && response.data.response) {
          botResponse = response.data.response;
          console.log('Bot response extracted:', botResponse);
        } else if (response.data && typeof response.data === 'string') {
          botResponse = response.data;
        } else {
          botResponse = "I'm here to help with nutrition questions. Could you be more specific?";
        }
        
        // Add bot message to chat
        addMessage({
          text: botResponse,
          sender: 'bot',
        });
        setIsTyping(false);
      },
      onError: (error) => {
        console.error('Python chatbot error:', error);
        // Fall back to basic chatbot
        if (input.trim()) {
          sendMessageMutation.mutate({ message: input, userId });
        } else {
          setIsTyping(false);
        }
      },
    }
  );

  const sendMessage = useCallback(async (text = input) => {
    const messageText = text.trim();
    if (!messageText) return;

    // Add user message
    addMessage({
      text: messageText,
      sender: 'user',
    });

    // Clear input
    setInput('');
    
    // Show typing indicator
    setIsTyping(true);

    try {
      // Try Python AI chatbot first
      await pythonChatbotMutation.mutateAsync({ message: messageText });
    } catch (error) {
      console.error('Failed to get response:', error);
      setIsTyping(false);
    }
  }, [input, addMessage, pythonChatbotMutation, sendMessageMutation]);

  const getFallbackResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! How can I help with your nutrition today?";
    }
    if (lowerMessage.includes('calor')) {
      return "Calories measure energy. The average adult needs 2000-2500 calories daily. Would you like me to calculate your specific needs?";
    }
    if (lowerMessage.includes('protein')) {
      return "Protein is essential for muscle repair and growth. Aim for 0.8-1.2g per kg of body weight daily. Good sources: lean meat, fish, eggs, legumes.";
    }
    if (lowerMessage.includes('workout') || lowerMessage.includes('exercise')) {
      return "For weight loss: aim for 150+ minutes of cardio weekly. For muscle gain: focus on strength training 3-4 times per week. Remember to rest between sessions!";
    }
    if (lowerMessage.includes('meal') || lowerMessage.includes('food') || lowerMessage.includes('eat')) {
      return "A balanced meal should include: lean protein, complex carbohydrates, healthy fats, and vegetables. Need specific meal ideas?";
    }
    if (lowerMessage.includes('weight')) {
      return "Healthy weight loss: 1-2 pounds per week. Create a moderate calorie deficit (300-500 calories) and combine with regular exercise.";
    }
    if (lowerMessage.includes('water') || lowerMessage.includes('hydrat')) {
      return "Stay hydrated! Aim for 2-3 liters (8-12 cups) of water daily. More if you exercise or live in hot climate.";
    }
    if (lowerMessage.includes('thank')) {
      return "You're welcome! Feel free to ask if you have more questions about nutrition or health.";
    }
    
    return "I'm here to help with nutrition and health questions. Could you be more specific about what you'd like to know?";
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
  ];

  const handleQuickQuestion = useCallback((question) => {
    sendMessage(question);
  }, [sendMessage]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }
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