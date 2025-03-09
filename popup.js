document.addEventListener("DOMContentLoaded", function () {
    chrome.storage.local.get(["triggerData"], (result) => {
        let triggerData = result.triggerData || {};
        generateGraph(triggerData);
    });
});

function generateGraph(data) {
    const graph = document.getElementById("commit-graph");
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];

        const dayData = data[dateKey] || { totalConfidence: 0, count: 0 };
        const avgConfidence = dayData.count > 0 ? (dayData.totalConfidence / dayData.count) : 0;
        const color = getCommitColor(avgConfidence);

        const day = document.createElement("div");
        day.classList.add("day");
        day.style.backgroundColor = color;
        day.title = `${dateKey}: Avg Confidence Level: ${avgConfidence.toFixed(1)}`;

        graph.appendChild(day);
    }
}

function getCommitColor(avgConfidence) {
    if (avgConfidence >= 10) return "#196127"; // Dark green (confident)
    if (avgConfidence >= 7) return "#239a3b"; // Medium green
    if (avgConfidence >= 4) return "#7bc96f"; // Light green
    if (avgConfidence >= 1) return "#c6e48b"; // Yellow (moderate impostor syndrome)
    return "#ebedf0"; // Grey (no triggers)
}
