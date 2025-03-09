console.log("🚀 Impostor Syndrome Detector running...");

// Wait until Gmail loads
const waitForGmail = setInterval(() => {
    const composeBox = document.querySelector('[role="textbox"]');
    if (composeBox) {
        clearInterval(waitForGmail);
        monitorDraft(composeBox);
    }
}, 2000);

function monitorDraft(composeBox) {
    let lastText = "";

    setInterval(() => {
        const currentText = composeBox.innerText.trim();
        if (currentText !== lastText) {
            lastText = currentText;
            checkForImpostorPhrases(currentText);
        }
    }, 3000); // Runs every 3 seconds
}

// Sends a message to the background script to call the Gemini API
async function checkForImpostorPhrases(text) {
    console.log("📩 Checking text:", text);

    chrome.runtime.sendMessage(
        { action: "callGeminiAPI", text: text },
        (response) => {
            if (response.error) {
                console.error("❌ Error calling Gemini API:", response.error);
                console.log("🔍 Full Gemini Raw Response:", response.raw);
                return;
            }

            console.log("🔹 Gemini API Response:", response);

            if (response.impostor_detected) {
                console.log(`⚠️ Impostor syndrome detected! Confidence level: ${response.confidence_level}`);
                showPopup(response.response_x, response.response_y);
            } else {
                console.log("✅ No impostor syndrome detected.");
            }
        }
    );
}

// Function to display X & Y character popups
function showPopup(responseX, responseY) {
    // Remove existing popups if any
    const existingPopup = document.getElementById("impostor-popup");
    if (existingPopup) {
        existingPopup.remove();
    }

    // Create the popup container
    const popup = document.createElement("div");
    popup.id = "impostor-popup";
    popup.style.position = "fixed";
    popup.style.bottom = "50px";
    popup.style.right = "50px";
    popup.style.width = "250px";  
    popup.style.height = "350px"; 
    popup.style.backgroundColor = "white";
    popup.style.border = "none"; 
    popup.style.borderRadius = "20px"; 
    popup.style.boxShadow = "4px 4px 12px rgba(0, 0, 0, 0.1)"; 
    popup.style.padding = "20px";
    popup.style.fontFamily = "'Hubballi', cursive";  // Changed font to Hubballi
    popup.style.zIndex = "10000";

    // Apply the background image
    popup.style.backgroundImage = `url(${chrome.runtime.getURL("popup_bg.png")})`;
    popup.style.backgroundSize = "cover"; 
    popup.style.backgroundPosition = "center";
    popup.style.backgroundRepeat = "no-repeat";
    popup.style.display = "flex";
    popup.style.flexDirection = "column";
    popup.style.justifyContent = "center";
    popup.style.alignItems = "center";
    popup.style.textAlign = "center";

    // Container for text and images
    const contentContainer = document.createElement("div");
    contentContainer.style.width = "90%";
    contentContainer.style.display = "flex";
    contentContainer.style.flexDirection = "column";
    contentContainer.style.alignItems = "center";

    // X's supportive response
    const xContainer = document.createElement("div");
    xContainer.style.display = "flex";
    xContainer.style.alignItems = "center";
    xContainer.style.marginBottom = "15px";

    const xImg = document.createElement("img");
    xImg.src = chrome.runtime.getURL("x_character.png");
    xImg.style.width = "50px";
    xImg.style.height = "50px";
    xImg.style.marginRight = "10px";

    const xText = document.createElement("p");
    xText.innerText = responseX;
    xText.style.color = "#0077cc";
    xText.style.fontWeight = "bold";
    xText.style.fontSize = "16px"; 
    xText.style.margin = "0";

    xContainer.appendChild(xImg);
    xContainer.appendChild(xText);

    // Y's sassy response
    const yContainer = document.createElement("div");
    yContainer.style.display = "flex";
    yContainer.style.alignItems = "center";

    const yImg = document.createElement("img");
    yImg.src = chrome.runtime.getURL("y_character.png");
    yImg.style.width = "50px";
    yImg.style.height = "50px";
    yImg.style.marginRight = "10px";

    const yText = document.createElement("p");
    yText.innerText = responseY;
    yText.style.color = "#cc3366";
    yText.style.fontWeight = "bold";
    yText.style.fontSize = "16px"; 
    yText.style.margin = "0";

    yContainer.appendChild(yImg);
    yContainer.appendChild(yText);

    // Append everything
    contentContainer.appendChild(xContainer);
    contentContainer.appendChild(yContainer);
    popup.appendChild(contentContainer);
    document.body.appendChild(popup);

    // Remove popup after 10 seconds
    setTimeout(() => {
        popup.remove();
    }, 10000);
}