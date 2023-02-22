console.log("Hello from your Chrome extensions!, content.js");

document.addEventListener("DOMContentLoaded", async function () {
  const targetNode = document.body;
  let tweetTextDivsSet = new Set();
  // Create a new observer
  const observer = new MutationObserver(function (mutationsList, observer) {
    // Loop through each mutation that occurred
    for (const mutation of mutationsList) {
      // Check if the mutation added a div element with data-testid="tweetText"
      if (mutation.type === "childList") {
        const tweetTextDivs = document.querySelectorAll('div[data-testid="tweetText"]');
        const newTweetTextDivs = new Set([...tweetTextDivs].filter((x) => !tweetTextDivsSet.has(x)));
        if (newTweetTextDivs.size > 0) {
          // Update the tweetTextDivsSet with the new tweetTextDivs
          tweetTextDivsSet = new Set([...tweetTextDivs]);
          console.log("Tweet length", tweetTextDivsSet.size);
          for (const tweetTextDiv of newTweetTextDivs) {
            // Get the tweet text
            const tweetText = tweetTextDiv.innerText;
            // Send a message to the background script
            chrome.runtime.sendMessage({ action: "predict", tweetText }, function (response) {
              console.log("Response from background script:", tweetText);
              tweetTextDiv.style.color = "yellow";
              // Check if the prediction is "spam"
              if (response.prediction === "spam") {
                // change tweet color text to red
                console.log("Spam tweet detected");
                tweetTextDiv.style.color = "red";
              }
            });
          }
        }
      }
    }
  });

  // Start watching for changes to the DOM
  observer.observe(targetNode, { childList: true, subtree: true });
});
