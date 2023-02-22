// TODO : Change tensorflow model to path trained on tweets spam dataset
console.log("Hello from your Chrome extension!, service_worker.js");
import * as tf from "@tensorflow/tfjs";
let model, vocab, labels;

MODEL_URL = "https://ai-nospam.s3.ap-south-1.amazonaws.com/model.json";
VOCAB_URL = "https://ai-nospam.s3.ap-south-1.amazonaws.com/vocab";
LABELS_URL = "https://ai-nospam.s3.ap-south-1.amazonaws.com/labels.txt";

//  fetch "model.json" and store it in the global variable "model". use tf.loadLayersModel
async function modelInit() {
  // YOUR CODE HERE
  console.log("Loading model...");
  model = await tf.loadLayersModel(MODEL_URL);
  vocab = await fetch(VOCAB_URL).then((response) => response.text());
  labels = await fetch(LABELS_URL).then((response) => response.text());
  return { model };
}
function preprocess(text) {
  // perform any text preprocessing here
  return text;
}

function convertToTensor(text, vocab) {
  const words = text.split(" ");
  const sequence = words.map((word) => {
    const index = vocab.indexOf(word);
    return index !== -1 ? index : 0;
  });
  const maxLength = 20;
  const paddedSequence = Array(maxLength).fill(0);
  sequence.slice(0, maxLength).forEach((value, i) => {
    paddedSequence[i] = value;
  });
  const input = tf.tensor2d([paddedSequence], [1, maxLength]);
  return input;
}

function predict(inputTensor) {
  const prediction = model.predict(inputTensor);
  const predictionValue = prediction.dataSync()[0];
  return predictionValue > 0.5 ? "not spam" : "spam";
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // check if the message is "predict"
  if (request.action === "predict") {
    // get the tweet text from the message
    const tweetText = request.tweetText;

    // preprocess the tweet text
    const processedText = preprocess(tweetText);

    // convert the processed text to a tensor
    const inputTensor = convertToTensor(processedText, vocab);

    // make the prediction
    const prediction = predict(inputTensor);

    console.log("Prediction:", prediction);
    // send the prediction back to content.js
    sendResponse({ prediction: prediction });
  }
});

modelInit();
