console.log("Hello from your Chrome extensions!, content.js");

document.addEventListener("DOMContentLoaded", async function () {
  const targetNode = document.body;
  let tweetTextDivsSet = new Set();
  // Create a new observer
  const observer = new MutationObserver(function (mutationsList, observer) {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        const tweetTextDivs = document.querySelectorAll('div[data-testid="tweetText"]');
        const newTweetTextDivs = new Set([...tweetTextDivs].filter((x) => !tweetTextDivsSet.has(x)));
        if (newTweetTextDivs.size > 0) {
          tweetTextDivsSet = new Set([...tweetTextDivs]);
          for (const tweetTextDiv of newTweetTextDivs) {
            const tweetText = tweetTextDiv.innerText;
            chrome.runtime.sendMessage({ action: "predict", tweetText }, function (response) {
              if (response.prediction === "spam") {
                console.log("Spam tweet detected");
                const parentDiv = tweetTextDiv.parentElement.parentElement.parentElement;
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
