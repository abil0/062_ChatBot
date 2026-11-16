const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const chatbox = document.getElementById("chat-box");

const messages=[];

function appendMessage(sender, text) {
    const messageElement = document.createElement("div");
    message.classlist.add("message", sender);
    const content = document.createElement("div");
    content.classList.add("message-content");
    content.textContent = text;
    messageElement.appendChild(content);
    chatbox.appendChild(message);
    chatbox.scrollTop = chatbox.scrollHeight;
    return content;
}

chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const userMessage = userInput.value.trim();
    if (!userMessage) 
        return;
}

addMessage("user", userMessage);
messages.push({ role: "user", content: userMessage });

userInput.value = "";
userInput.disabled = true;
const button = chatForm.querySelector("button");
button.disabled = true;
button.textContent = "Loading...";

const botcontent = addMessage("bot", "");
try {
    const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error
    }