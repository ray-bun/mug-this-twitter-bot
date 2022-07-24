import { listenToTwit } from "./listenToTweet";
console.log("START NOW");
try {
  listenToTwit();
} catch {
  console.log("Failed, re trying");
  listenToTwit();
}
