chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "callGeminiAPI") {
        const GEMINI_API_KEY = "AIzaSyBxK9FYVMlwcPw85FNeBYszBHvGyprv_y8";
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

        fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Analyze the following email draft for signs of impostor syndrome. 
                                       If found, respond with {"impostor_detected": true, "confidence_level": 3, 
                                       "response_x": "Supportive response here", "response_y": "Sassy response here"}. 
                                       If no impostor syndrome is found, respond with {"impostor_detected": false, "confidence_level": 10}.
                                       Email draft: "${request.text}"`
                    }]
                }]
            }),
        })
            .then(response => response.json())
            .then(data => {
                console.log("🔍 Gemini Raw Response:", data);

                if (!data || !data.candidates || data.candidates.length === 0) {
                    sendResponse({ error: "No valid response from Gemini", raw: data });
                    return;
                }

                try {
                    const message = data.candidates[0].content.parts[0].text;
                    console.log("📩 Gemini Response Text:", message);
                    const parsedResult = JSON.parse(message);

                    if (parsedResult.impostor_detected) {
                        updateTriggerCount(parsedResult.confidence_level);
                    } else { 
                        updateTriggerCount(10); 
                    }

                    sendResponse(parsedResult);
                } catch (parseError) {
                    sendResponse({ error: "Error parsing Gemini response", raw: data });
                }
            })
            .catch(error => sendResponse({ error: error.message }));

        return true; // Required for asynchronous sendResponse
    }
});

function updateTriggerCount(confidenceLevel) {
    const today = new Date().toISOString().split('T')[0]; 

    chrome.storage.local.get(["triggerData"], (result) => {
        let triggerData = result.triggerData || {}; 

        if (!triggerData[today]) {
            triggerData[today] = { totalConfidence: 0, count: 0, averageConfidence: 0 }; 
        }

        triggerData[today].totalConfidence += confidenceLevel;
        triggerData[today].count += 1;
        triggerData[today].averageConfidence = triggerData[today].totalConfidence / triggerData[today].count;

        chrome.storage.local.set({ triggerData }, () => {
            console.log("📊 Updated trigger data:", triggerData);
        });
    });
}

// Open popup.html in a larger window
chrome.action.onClicked.addListener(() => {
    chrome.windows.create({
        url: chrome.runtime.getURL("popup.html"),
        type: "popup",
        width: 450,
        height: 700,
        left: 200,
        top: 100
    });
});
