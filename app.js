// Selecting necessary HTML elements
let prompt = document.querySelector("#prompt");
let chatContainer = document.querySelector(".chat-container");
const api_url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_API_KEY}`;
let imgbtn = document.querySelector("#img");
let imginput = document.querySelector("#imginput");
let img = document.querySelector("#img img");

// User object to store user input and file data (if any)
let user = {
  message: null,
  file: {
    mime_type: null,
    data: null,
  },
};

// Function to generate AI response based on user input
async function generateResponse(aiChatBox) {
  let text = aiChatBox.querySelector(".ai-chat-area");

  // Request payload with POST method
  let requestOption = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: user.message },
            (user.file.data ? [{ inline_data: user.file }] : []), // If file exists, add it to the request
          ],
        },
      ],
    }),
  };

  try {
    // Sending the request to the API
    let response = await fetch(api_url, requestOption);
    let data = await response.json();

    // Formatting AI response (removing markdown ** and replacing newlines with <br>)
    let airesponse = data.candidates[0].content.parts[0].text
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove markdown bold formatting (**bold** → bold)
      .replace(/\n/g, "<br>") // Convert newlines to <br> for HTML rendering
      .trim();

    console.log(airesponse); // Log AI response to console
    text.innerHTML = airesponse;

    //  Clear previous image data after response
    user.file = {
      mime_type: null,
      data: null,
    };
    img.src = `/image.svg`; // Reset image to default after response
    img.classList.remove("choose-btn-img");
  } catch (error) {
    console.log(error); // Log errors to console if any
  } finally {
    // Auto-scroll to the bottom of chat after response
    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: "smooth",
    });
  }
}

// Function to create a new chat box div for both user and AI
createChatBox = (html, classes) => {
  let div = document.createElement("div");
  div.innerHTML = html;
  div.classList.add(classes);
  return div;
};

// Function to handle user input and display AI response
handleChatResponse = (message) => {
  user.message = message;

  // Create user chat box with message and attached image (if any)
  let html = `
    <img src="/img/user3.png" alt="user-img" id="user-img" width="10%" />
    <div class="user-chat-area">
      ${user.message}
      ${
        user.file.data
          ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg"/>`
          : ""
      }
    </div>`;

  // Append user chat box to the chat container
  let userChatBox = createChatBox(html, "user-chat-box");
  chatContainer.appendChild(userChatBox);

  // Auto-scroll to bottom after user message
  chatContainer.scrollTo({
    top: chatContainer.scrollHeight,
    behavior: "smooth",
  });

  // Clear input field after user sends message
  prompt.value = null;

  // Create AI loading response box
  setTimeout(() => {
    let html = `
      <img src="/img/ai2.png" alt="ai-img" id="ai-img" width="8%" />
      <div class="ai-chat-area">
        <img src="/img/loading.gif" alt="img" class="load">
      </div>`;
    let aiChatBox = createChatBox(html, "ai-chat-box");
    chatContainer.appendChild(aiChatBox);

    // Generate AI response
    generateResponse(aiChatBox);
  }, 1000); // 1 second delay before AI response
};

// Handle user input when "Enter" key is pressed
prompt.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && prompt.value.trim() !== "") {
    handleChatResponse(prompt.value); // Pass user input to handleChatResponse()
  }
});

// Handle image selection and store as base64 in user object
imginput.addEventListener("change", () => {
  const file = imginput.files[0];
  if (!file) return; // Exit if no file is selected

  let reader = new FileReader();
  reader.onload = (e) => {
    let base64string = e.target.result.split(",")[1];
    user.file = {
      mime_type: file.type, // Store file type (e.g., image/png)
      data: base64string, // Store file data in base64 format
    };
    img.src = `data:${user.file.mime_type};base64,${user.file.data}`;
    img.classList.add("choose-btn-img"); // Apply styling for selected image
  };
  reader.readAsDataURL(file); // Convert file to base64
});

// Trigger file input when user clicks on image button
imgbtn.addEventListener("click", () => {
  imginput.click();
});
