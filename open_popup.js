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
