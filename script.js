let faqData = {};
fetch("faq.json").then(res => res.json()).then(data => faqData = data).catch(() => console.log("FAQ file not found."));

function displayMessage(text, sender) {
    const chatBox = document.getElementById("chat-box");
    const msg = document.createElement("div");
    msg.classList.add("message", sender);
    msg.innerText = text;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
    return msg;
}

async function getAIResponse(question) {
    // Confirmed as connected in your console
    const apiKey = typeof CONFIG !== 'undefined' ? CONFIG.API_KEY : null;

    if (!apiKey) {
        return "System: API Key is missing. Check your config.js file.";
    }

    // Updated URL to use the latest stable model path
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `You are an expert assistant for NSUK. ${question}` }]
                }]
            })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0]) {
            return data.candidates[0].content.parts[0].text;
        } else if (data.error) {
            // This captures the 404 and other errors seen in your console
            console.error("API Error Detail:", data.error.message);
            return `Error: ${data.error.message}`;
        } else {
            return "The AI stayed silent. Please try refreshing the page.";
        }
    } catch (error) {
        return "Connection Error: Please check your internet connection.";
    }
}

async function sendMessage() {
    const input = document.getElementById("user-input");
    const message = input.value.trim();
    if (!message) return;

    displayMessage(message, "user");
    input.value = "";

    // FAQ Check
    let found = false;
    for (let key in faqData) {
        if (message.toLowerCase().includes(key.toLowerCase())) {
            displayMessage(faqData[key], "bot");
            found = true;
            break;
        }
    }

    if (!found) {
        const thinking = displayMessage("NSUK Bot is thinking...", "bot");
        const aiResponse = await getAIResponse(message);
        thinking.innerText = aiResponse;
    }
}

function quickAsk(text) {
    document.getElementById("user-input").value = text;
    sendMessage();
}