import { TwitterApi } from "twitter-api-v2";
import "./lib/env";
import http from "http"; // or 'https' for https:// URLs
import fs from "fs";

export async function postToTwitter(twitterThreadID: string, twitterUserName: String, bannerBearGeneratedImages: any) {
  //
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
  });
  console.log("bannerBearGeneratedImages", bannerBearGeneratedImages);
  const randomImage = bannerBearGeneratedImages[Math.floor(Math.random() * bannerBearGeneratedImages.length)];
  const filename = randomImage.substring(randomImage.lastIndexOf("/") + 1);

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
        const twitterReply = await client.v2.reply(`@${twitterUserName} mugs generated! View or order your mugs at https://mug-this.com/?product_cat=${twitterUserName}`, twitterThreadID, {
          media: { media_ids: [mediaId] },
        });
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

  //   const mediaId = await client.v1.uploadMedia("./downloaded_images/1.png");
  //   console.log("Media ID: ", mediaId);
}
