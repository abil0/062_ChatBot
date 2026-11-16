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
      throw new Error(
      errorData.error ||"Terjadi kesalahan"
      );
    }

const reader = response.body.getReader();
const decoder = new TextDecoder();
let buffer = "";

while (true) {
    const { done, value } = await reader.read();
    if (done) {
        break;
    }

    buffer += decoder.decode(value, {
         stream: true });

         const lines = buffer.split("\n");
            buffer = lines.pop();
            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine) {continue;}
                if (!trimmedLine.startsWith("data: ")) {continue;}
                constdata = trimmedLine.slice(5).trim();
                if (data === "[DONE]") {continue;}
                try{
                    const token = JSON.parse(data);
                    botResponse += token;
                    botcontent.textContent = botResponse;
                    chatBox.scrollTop = chatBox.scrollHeight; 
                } catch (error) {
                    console.error("Error parsing token:", error);
                }
            }
        }

    } messages.push({ role: "assistant", content: botResponse });
    cacth (error) {
        console.error("Error:", error);
        botcontent.textContent = "Terjadi kesalahan. Silakan coba lagi.";
    } finally {
        userInput.disabled = false;
        button.disabled = false;
        button.textContent = "Kirim";
        userInput.focus();
    }
});