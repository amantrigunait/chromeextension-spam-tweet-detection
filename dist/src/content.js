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
          for (const tweetTextDiv of newTweetTextDivs) {
            // Get the tweet text
            const tweetText = tweetTextDiv.innerText;
            // Send a message to the background script
            chrome.runtime.sendMessage({ action: "predict", tweetText }, function (response) {
              // Check if the prediction is "spam"
              if (response.prediction === "spam") {
                // change tweet color text to red
                console.log("Spam tweet detected");
                tweetTextDiv.style.color = "yellow";
              } else {
                // collapse the parent div
                const parentDiv = tweetTextDiv.parentElement.parentElement.parentElement;
                //  hide the parent div and display a message "This tweet has been hidden by AI No Spam" and give it a button to unhide the tweet
                parentDiv.style.display = "none";
                const newDiv = document.createElement("div");
                newDiv.innerHTML = `<div style="color: red">[SPAM] This tweet has been hidden by AI</div><button style="padding: 5px 10px; border: none; background-color: #2a3136; color: white; cursor: pointer;">Show Tweet</button>`;
                parentDiv.parentElement.insertBefore(newDiv, parentDiv);
                newDiv.querySelector("button").addEventListener("click", () => {
                  newDiv.style.display = "none";
                  parentDiv.style.display = "block";
                });
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
