const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const chatbox = document.getElementById("chat-box");

const messages = [];

function appendMessage(sender, text) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", sender);

    const content = document.createElement("div");
    content.classList.add("message-content");
    content.textContent = text;

    messageElement.appendChild(content);
    chatbox.appendChild(messageElement);
    chatbox.scrollTop = chatbox.scrollHeight;

    return content;
}

chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    appendMessage("user", userMessage);
    messages.push({ role: "user", content: userMessage });

    userInput.value = "";
    userInput.disabled = true;

    const button = chatForm.querySelector("button");
    button.disabled = true;
    button.textContent = "Loading...";

    const botContent = appendMessage("bot", "");
    let botResponse = "";

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ messages })
        });

      if (!response.ok) {
    let message = "Terjadi kesalahan";
    try {
        const errorData = await response.json();
        message = errorData?.error || errorData?.message || message;
    } catch {}
    throw new Error(message);
}

        if (!response.body) {
            throw new Error("Response body tidak tersedia");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine || !trimmedLine.startsWith("data: ")) continue;

                const data = trimmedLine.slice(5).trim();
                if (data === "[DONE]") continue;

                try {
                    const payload = JSON.parse(data);
                    const token = payload.choices?.[0]?.delta?.content ?? payload.choices?.[0]?.message?.content ?? "";
                    if (!token) continue;

                    botResponse += token;
                    botContent.textContent = botResponse;
                    chatbox.scrollTop = chatbox.scrollHeight;
                } catch (error) {
                    console.error("Error parsing token:", error);
                }
            }
        }

        messages.push({ role: "assistant", content: botResponse });
    } catch (error) {
        console.error("Error:", error);
        botContent.textContent = "Terjadi kesalahan. Silakan coba lagi.";
    } finally {
        userInput.disabled = false;
        button.disabled = false;
        button.textContent = "Kirim";
        userInput.focus();
    }
});