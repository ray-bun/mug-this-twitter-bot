import { TwitterApi } from "twitter-api-v2";
import "./lib/env";
import http from "http"; // or 'https' for https:// URLs
import fs from "fs";
import path from "path";

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

export async function postToTwitter(twitterThreadID: string, twitterUserName: String, bannerBearGeneratedImages: any, cookingTweetID: any) {
  //delete cooking tweet
  const randomQuotes = ["Free shipping world wide!", "#Bitcoin ⚡️ accepted", `Generate your own mugs by tagging @${process.env.TWITTER_USER_ID}`, "Print & Ship from Australia"];
  console.log("Deleting old tweet ID: ", cookingTweetID);
  await client.v2.deleteTweet(cookingTweetID);

  const randomImage = bannerBearGeneratedImages[Math.floor(Math.random() * bannerBearGeneratedImages.length)];
  const filename = randomImage.substring(randomImage.lastIndexOf("/") + 1);
  const dir = path.resolve(path.join(__dirname, "downloaded_images"));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  const file = fs.createWriteStream(`./downloaded_images/${filename}`);
  const filePath = `./downloaded_images/${filename}`;
  const request = http.get(randomImage, function (response) {
    response.pipe(file);

    // after download completed close filestream
    file.on("finish", async () => {
      file.close();
      console.log("Download Completed, uploading it to twitter");
      const mediaId = await client.v1.uploadMedia(filePath);
      if (mediaId !== "") {
        // response to tweet
        const twitterReply = await client.v2.reply(
          `@${twitterUserName} your mugs is now cooked🍴 View or order your mugs at
          https://mug-this.com/?product_cat=${twitterUserName}
          ${randomQuotes[Math.floor(Math.random() * randomQuotes.length)]}
        `,
          twitterThreadID,
          {
            media: { media_ids: [mediaId] },
          }
        );
        console.log("twitterReply", twitterReply);
        console.log("mediaId", mediaId);
        fs.unlink(filePath, function (err) {
          if (err) {
            console.error(err);
          } else {
            console.log("File removed:", filePath);
          }
        });
        console.log("deleted");
      }
    });
  });
}

export function requestReceivedTweet(twitterThreadID: string, twitterUserName: String) {
  return new Promise(async (resolve, reject) => {
    try {
      const twitterReply = await client.v2.reply(`@${twitterUserName} we're cooking🍳 your mugs! Please wait for 1 minute.`, twitterThreadID);
      console.log("twitterReply.data.id", twitterReply.data.id);
      resolve(twitterReply.data.id);
    } catch (err) {
      reject(err);
    }
  });
}
