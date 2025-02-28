// chatbot.js - Place this file in your repository's js folder

// Configuration
const CHATBOT_CONFIG = {
    apiKey: 'sk-2c7e8fda6c254eb0bbf5f4edf1493202', // Replace with your actual API key
    apiEndpoint: 'https://api.deepseeks.com/v1/chat/completions', // Replace with actual endpoint
    excludePages: ['index.html'], // Pages where chatbot should NOT appear
    systemPrompt: "You are a helpful travel assistant for my website. Provide travel recommendations, answer questions about destinations, help with booking queries, suggest itineraries, and offer travel tips. Keep responses concise, friendly, and travel-focused."
};

// DOM Elements and state variables
let chatbotToggle, chatbotWindow, closeButton, messagesContainer, userInput, sendButton, botTyping;
let chatHistory = [];
let chatbotInitialized = false;

// Initialize chatbot on DOM content loaded
document.addEventListener('DOMContentLoaded', initChatbot);

function initChatbot() {
    // Get current page
    const path = window.location.pathname;
    const currentPage = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    
    // Check if we should display the chatbot on this page
    if (CHATBOT_CONFIG.excludePages.includes(currentPage)) {
        return; // Don't initialize chatbot on excluded pages
    }
    
    // Create and inject chatbot HTML if it doesn't exist
    if (!document.querySelector('.chatbot-container')) {
        injectChatbotHTML();
    }
    
    // Initialize DOM references
    chatbotToggle = document.getElementById('chatbot-toggle');
    chatbotWindow = document.getElementById('chatbot-window');
    closeButton = document.getElementById('close-chatbot');
    messagesContainer = document.getElementById('chatbot-messages');
    userInput = document.getElementById('user-input');
    sendButton = document.getElementById('send-message');
    botTyping = document.getElementById('bot-typing');
    
    // Initialize chat history with system prompt
    chatHistory = [
        {
            role: "system",
            content: CHATBOT_CONFIG.systemPrompt
        }
    ];
    
    // Add page-specific welcome message based on current page
    let welcomeMessage = "Hello! I'm your travel assistant. How can I help you today?";
    
    if (currentPage.includes('destination')) {
        welcomeMessage = "Looking for destination recommendations? Feel free to ask about any location!";
    } else if (currentPage.includes('tour')) {
        welcomeMessage = "Exploring our tours? I can help you find the perfect guided experience!";
    } else if (currentPage.includes('hotel') || currentPage.includes('accommodation')) {
        welcomeMessage = "Need accommodation recommendations? Tell me your preferences and I'll help you find the perfect stay!";
    } else if (currentPage.includes('flight') || currentPage.includes('transport')) {
        welcomeMessage = "Looking for flight information or transportation options? I can help with that!";
    }
    
    // Add initial bot message
    addMessage(welcomeMessage, 'bot');
    
    // Set up event listeners
    setupEventListeners();
    
    chatbotInitialized = true;
}

function injectChatbotHTML() {
    // Create chatbot container
    const chatbotContainer = document.createElement('div');
    chatbotContainer.className = 'chatbot-container';
    chatbotContainer.innerHTML = `
        <div class="chatbot-button" id="chatbot-toggle">
            <i class="fas fa-comments chatbot-icon"></i>
        </div>
        <div class="chatbot-window" id="chatbot-window">
            <div class="chatbot-header">
                <div class="chatbot-title">
                    <i class="fas fa-robot"></i>
                    <h3>Travel Assistant</h3>
                </div>
                <button class="close-chatbot" id="close-chatbot">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="chatbot-messages" id="chatbot-messages">
                <div class="bot-typing" id="bot-typing">
                    <i class="fas fa-ellipsis-h"></i> Typing...
                </div>
            </div>
            <div class="chatbot-input">
                <input type="text" id="user-input" placeholder="Type your message here..." autofocus>
                <button class="send-button" id="send-message">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    `;
    
    // Add chatbot CSS
    if (!document.getElementById('chatbot-styles')) {
        const chatbotStyles = document.createElement('style');
        chatbotStyles.id = 'chatbot-styles';
        chatbotStyles.innerHTML = `
            /* Chatbot Styles */
            .chatbot-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 1000;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            
            .chatbot-button {
                background-color: #3498db;
                color: white;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
            }
            
            .chatbot-button:hover {
                background-color: #2980b9;
                transform: scale(1.05);
            }
            
            .chatbot-icon {
                font-size: 24px;
            }
            
            .chatbot-window {
                position: absolute;
                bottom: 80px;
                right: 0;
                width: 350px;
                height: 500px;
                background-color: white;
                border-radius: 10px;
                box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
                display: none;
                overflow: hidden;
                transition: all 0.3s ease;
            }
            
            .chatbot-header {
                background-color: #3498db;
                color: white;
                padding: 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .chatbot-title {
                display: flex;
                align-items: center;
            }
            
            .chatbot-title i {
                margin-right: 10px;
                font-size: 20px;
            }
            
            .close-chatbot {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
            }
            
            .chatbot-messages {
                height: 375px;
                padding: 15px;
                overflow-y: auto;
            }
            
            .message {
                margin-bottom: 15px;
                max-width: 80%;
            }
            
            .bot-message {
                background-color: #f0f0f0;
                padding: 10px 15px;
                border-radius: 18px 18px 18px 0;
                align-self: flex-start;
                color: #333;
            }
            
            .user-message {
                background-color: #3498db;
                padding: 10px 15px;
                border-radius: 18px 18px 0 18px;
                margin-left: auto;
                color: white;
            }
            
            .message-time {
                font-size: 0.7rem;
                color: #999;
                margin-top: 5px;
                text-align: right;
            }
            
            .bot-typing {
                display: none;
                background-color: #f0f0f0;
                padding: 10px 15px;
                border-radius: 18px 18px 18px 0;
                max-width: 80%;
                margin-bottom: 15px;
                font-size: 14px;
                color: #666;
            }
            
            .chatbot-input {
                display: flex;
                padding: 10px 15px;
                border-top: 1px solid #eee;
            }
            
            .chatbot-input input {
                flex: 1;
                padding: 10px 15px;
                border: 1px solid #ddd;
                border-radius: 30px;
                outline: none;
                font-size: 14px;
            }
            
            .send-button {
                background-color: #3498db;
                color: white;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: none;
                margin-left: 10px;
                cursor: pointer;
                font-size: 16px;
                display: flex;
                justify-content: center;
                align-items: center;
                transition: all 0.3s ease;
            }
            
            .send-button:hover {
                background-color: #2980b9;
            }
            
            @media screen and (max-width: 768px) {
                .chatbot-window {
                    width: 90%;
                    right: 5%;
                }
            }
        `;
        document.head.appendChild(chatbotStyles);
    }
    
    // Add Font Awesome if not already included
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const fontAwesome = document.createElement('link');
        fontAwesome.rel = 'stylesheet';
        fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css';
        document.head.appendChild(fontAwesome);
    }
    
    // Append chatbot to body
    document.body.appendChild(chatbotContainer);
}

function setupEventListeners() {
    // Toggle chatbot visibility
    chatbotToggle.addEventListener('click', () => {
        chatbotWindow.style.display = 'block';
    });

    closeButton.addEventListener('click', () => {
        chatbotWindow.style.display = 'none';
    });

    // Send message when button is clicked
    sendButton.addEventListener('click', sendMessage);

    // Send message when Enter key is pressed
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// Function to send message to API
async function sendMessage() {
    const message = userInput.value.trim();
    if (message.length === 0) return;

    // Add user message to chat
    addMessage(message, 'user');
    userInput.value = '';

    // Show typing indicator
    botTyping.style.display = 'block';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Add user message to history
    chatHistory.push({
        role: "user",
        content: message
    });

    try {
        // Call Deep Seeks API
        const response = await fetchBotResponse(message);
        
        // Add bot response to chat
        setTimeout(() => {
            botTyping.style.display = 'none';
            addMessage(response, 'bot');
            
            // Add response to history
            chatHistory.push({
                role: "assistant",
                content: response
            });
            
            // Maintain context window (optional)
            if (chatHistory.length > 10) {
                // Keep system message and last 9 exchanges
                chatHistory = [
                    chatHistory[0],
                    ...chatHistory.slice(chatHistory.length - 9)
                ];
            }
        }, 500 + Math.random() * 1000); // Random delay for realistic typing effect
    } catch (error) {
        console.error('Error:', error);
        setTimeout(() => {
            botTyping.style.display = 'none';
            addMessage("I'm sorry, I'm having trouble connecting right now. Please try again later.", 'bot');
        }, 1000);
    }
}

// Function to fetch response from Deep Seeks API
async function fetchBotResponse(message) {
    try {
        // For demonstration purposes, we'll show both simulation and actual API call options
        
        // OPTION 1: Use the actual API (uncomment in production)
        /*
        const response = await fetch(CHATBOT_CONFIG.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': Bearer ${CHATBOT_CONFIG.apiKey}
            },
            body: JSON.stringify({
                model: "deepseeks-chat",
                messages: chatHistory,
                max_tokens: 300
            })
        });
        
        const data = await response.json();
        return data.choices[0].message.content;
        */
        
        // OPTION 2: Simulated responses (for testing or development)
        const travelResponses = {
            default: "I'd be happy to help you create a personalized travel plan based on your interests, budget, and travel dates!",
            destinations: {
                bali: "Bali is a fantastic choice! The best time to visit is during the dry season (April to October). Don't miss the Ubud Monkey Forest, Uluwatu Temple, and Tegallalang Rice Terraces.",
                paris: "Paris is magical year-round, but spring (April to June) offers pleasant weather and fewer crowds. The Eiffel Tower, Louvre Museum, and Notre-Dame Cathedral are must-see attractions.",
                japan: "Japan is fascinating! Tokyo offers modern attractions, while Kyoto has traditional temples and gardens. Cherry blossom season (late March to early April) is particularly beautiful.",
                greece: "Santorini in Greece offers stunning sunsets, white-washed buildings with blue domes, and beautiful beaches - perfect for a romantic getaway!"
            },
            tips: {
                budget: "For budget travel tips, consider visiting destinations during shoulder season, use public transportation, stay in hostels or vacation rentals, and eat where locals eat.",
                family: "For a family-friendly vacation, consider destinations like Orlando (theme parks), Costa Rica (adventure and wildlife), or Hawaii (beaches and nature).",
                safety: "Remember to check visa requirements, travel advisories, and COVID-19 restrictions before booking your international trip."
            }
        };
        
        // Simple logic to determine response based on user message
        const userMessageLower = message.toLowerCase();
        
        // Check for destination matches
        for (const [destination, response] of Object.entries(travelResponses.destinations)) {
            if (userMessageLower.includes(destination)) {
                return response;
            }
        }
        
        // Check for tip matches
        if (userMessageLower.includes("budget") || userMessageLower.includes("cheap") || userMessageLower.includes("save money")) {
            return travelResponses.tips.budget;
        } else if (userMessageLower.includes("family") || userMessageLower.includes("kids") || userMessageLower.includes("children")) {
            return travelResponses.tips.family;
        } else if (userMessageLower.includes("safe") || userMessageLower.includes("visa") || userMessageLower.includes("covid")) {
            return travelResponses.tips.safety;
        }
        
        // Default response
        return travelResponses.default;
    } catch (error) {
        console.error('Error fetching bot response:', error);
        return "I'm sorry, I encountered an error. Please try again later.";
    }
}

// Function to add message to chat
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(sender + '-message');
    
    const now = new Date();
    const timeString = now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
    
    messageDiv.innerHTML = text + '<div class="message-time">' + timeString + '</div>';
    messagesContainer.appendChild(messageDiv);
    
    // Auto scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
