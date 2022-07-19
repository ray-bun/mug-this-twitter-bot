import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import type { TweetedRequest, BannerBear } from "@prisma/client";

export async function createNewTweetRequest(
  requestedUserTwitterID: TweetedRequest["requestedUserTwitterID"],
  tweetID: TweetedRequest["tweetID"],
  tweetTextWithoutURL: TweetedRequest["tweetTextWithoutURL"],
  tweetAuthorId: TweetedRequest["tweetAuthorId"],
  tweetUserName: TweetedRequest["tweetUserName"],
  tweetVerified: TweetedRequest["tweetVerified"],
  tweetProfileImageUrl: TweetedRequest["tweetProfileImageUrl"],
  tweetMediaFile: TweetedRequest["tweetMediaFile"],
  tweetUserId: TweetedRequest["tweetUserId"],
  statusURL: TweetedRequest["statusURL"]
) {
  return prisma.tweetedRequest.create({
    data: {
      requestedUserTwitterID,
      tweetID,
      tweetTextWithoutURL,
      tweetAuthorId,
      tweetUserName,
      tweetVerified,
      tweetProfileImageUrl,
      tweetMediaFile,
      tweetUserId,
      statusURL,
    },
  });
}

export async function insertBannerBear(
  requestedUserTwitterID: BannerBear["requestedUserTwitterID"],
  generatedBannerUID: BannerBear["generatedBannerUID"],
  templateId: BannerBear["templateId"],
  status: BannerBear["status"],
  image_url_png: BannerBear["image_url_png"],
  image_url_jpg: BannerBear["image_url_jpg"]
) {
  return prisma.bannerBear.create({
    data: {
      requestedUserTwitterID,
      generatedBannerUID,
      templateId,
      status,
      image_url_png,
      image_url_jpg,
    },
  });
}
