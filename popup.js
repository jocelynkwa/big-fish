document.addEventListener("DOMContentLoaded", function () {
    chrome.storage.local.get(["triggerData"], (result) => {
        let triggerData = result.triggerData || {};
        generateGraph(triggerData);
    });
});

function generateGraph(data) {
    const graph = document.getElementById("commit-graph");
    const today = new Date();
    
    // Set up a 7-column, 5-row grid (last 35 days)
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 7; col++) {
            const date = new Date(today);
            date.setDate(today.getDate() - ((row * 7) + col)); // Move back in time
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
}

function getCommitColor(avgConfidence) {
    if (avgConfidence >= 10) return "#196127"; // Dark Green (Confident)
    if (avgConfidence >= 9) return "#1f7a38";  // Slightly lighter green
    if (avgConfidence >= 8) return "#2da84a";  // Medium green
    if (avgConfidence >= 7) return "#57c46a";  // Light green
    if (avgConfidence >= 6) return "#8ddf8d";  // Yellow-green
    if (avgConfidence >= 5) return "#ffd700";  // Yellow (Balanced)
    if (avgConfidence >= 4) return "#ffa500";  // Darker orange
    if (avgConfidence >= 3) return "#ff8c00";  // Orange (Moderate impostor syndrome)
    if (avgConfidence >= 2) return "#ff6347";  // Red-orange
    if (avgConfidence >= 1) return "#d73a49";  // Red (Severe impostor syndrome)
    return "#ebedf0"; // Grey (No data)
}
