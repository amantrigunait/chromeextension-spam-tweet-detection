console.log("Hello from your Chrome extensions!, content.js");

document.addEventListener("DOMContentLoaded", async function () {
  const targetNode = document.body;

  // Create a new observer
  const observer = new MutationObserver(function (mutationsList, observer) {
    // Loop through each mutation that occurred
    for (const mutation of mutationsList) {
      // Check if the mutation added a div element with data-testid="tweetText"
      if (mutation.type === "childList") {
        const tweetTextDivs = document.querySelectorAll('div[data-testid="tweetText"]');
        if (tweetTextDivs.length > 0) {
          // Do something with the tweetTextDivs here
          tweetTextDivs.forEach(function (tweetTextDiv) {
            const tweetText = tweetTextDiv.innerText;
            console.log("Tweet text:", tweetText);
            chrome.runtime.sendMessage({ action: "predict", tweetText: tweetText }, function (response) {
              const predictedLabel = response.prediction;
              console.log("Predicted label:", predictedLabel);
              if (predictedLabel === "not spam") {
                tweetTextDiv.style.color = "red";
              }
            });
          });
        }
      }
    }
  });

  // Start watching for changes to the DOM
  observer.observe(targetNode, { childList: true, subtree: true });
});
