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
    popup.style.right = "50px"; // Move to the left side
    popup.style.width = "300px";
    popup.style.height = "200px"; // Adjust height as needed
    popup.style.backgroundColor = "white";
    popup.style.border = "2px solid black";
    popup.style.borderRadius = "10px";
    popup.style.boxShadow = "2px 2px 10px rgba(0, 0, 0, 0.2)";
    popup.style.padding = "10px";
    popup.style.fontFamily = "Arial, sans-serif";
    popup.style.zIndex = "10000";

    // Apply the background image
    popup.style.backgroundImage = `url(${chrome.runtime.getURL("popup_bg.png")})`;
    popup.style.backgroundSize = "cover";
    popup.style.backgroundPosition = "center";
    popup.style.backgroundRepeat = "no-repeat";

    // X's supportive response
    const xContainer = document.createElement("div");
    xContainer.style.display = "flex";
    xContainer.style.alignItems = "center";
    xContainer.style.marginBottom = "10px";

    const xImg = document.createElement("img");
    xImg.src = chrome.runtime.getURL("x_character.png");
    xImg.style.width = "50px";
    xImg.style.height = "50px";
    xImg.style.marginRight = "10px";

    const xText = document.createElement("p");
    xText.innerText = responseX;

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

    yContainer.appendChild(yImg);
    yContainer.appendChild(yText);

    // Append everything to popup
    popup.appendChild(xContainer);
    popup.appendChild(yContainer);
    document.body.appendChild(popup);

    // Remove popup after 10 seconds
    setTimeout(() => {
        popup.remove();
    }, 10000);
}


