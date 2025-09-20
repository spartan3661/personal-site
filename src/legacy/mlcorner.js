export function initMLCorner() {
  // /scripts/mlcorner.js

  const mlFeed = document.getElementById("ml-feed");

  const mlLogs = [
    "[RAG-BOT] Initialized on Azure with PyTorch backend.",
    "[QDRANT] Vector DB activated. 128-dim embeddings ready.",
    "[Pipeline] Retrieval-Augmented-Generation active ✅",
    "[LLM] Chat integration with custom NLP preprocessing.",
    "[Benchmarks] Retrieval Accuracy: 94.3%",
    "[Project] Deployed via CI/CD on Azure Functions.",
    "[You] Trained on real user data and internal documents.",
    "[Model] fine-tuned LLaMA2 for concise answer generation."
  ];

  let logIndex = 0;

  function displayNextLog() {
    if (!mlFeed) return;

    const logLine = document.createElement("p");
    logLine.className = "ml-line";
    logLine.textContent = mlLogs[logIndex % mlLogs.length];
    mlFeed.appendChild(logLine);

    if (mlFeed.childNodes.length > 6) {
      mlFeed.removeChild(mlFeed.firstChild);
    }

    logIndex++;
  }

  setInterval(displayNextLog, 2200);
}