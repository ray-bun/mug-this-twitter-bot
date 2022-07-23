import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import type { TweetedRequest, BannerBear, Cloudinary, WooCommerce } from "@prisma/client";

export async function createNewTweetRequest(processedTweet: any, requestedUserTwitterID: string, requestedUser: any) {
  return prisma.tweetedRequest.create({
    data: {
      requestedUserTwitterID,
      requestedUserProfileImage: requestedUser.profile_image_url_https,
      requestedUserScreenName: requestedUser.screen_name,
      tweetID: processedTweet.tweetID,
      tweetTextWithoutURL: processedTweet.tweetTextWithoutURL,
      tweetAuthorId: processedTweet.tweetAuthorId,
      tweetUserName: processedTweet.tweetUserName,
      tweetVerified: processedTweet.tweetVerified,
      tweetProfileImageUrl: processedTweet.tweetProfileImageUrl,
      tweetMediaFile: processedTweet.tweetMediaFile,
      tweetUserId: processedTweet.tweetUserId,
      statusURL: processedTweet.statusURL,
    },
    select: {
      id: true,
    },
  });
}
export function checkNumberOfRequests(requestedUserTwitterID: TweetedRequest["requestedUserTwitterID"]) {
  let lastDay = Date.now() - 24 * 60 * 60 * 1000;

  return prisma.tweetedRequest.findMany({
    where: {
      requestedUserTwitterID,
      createdAt: {
        gte: new Date(lastDay),
      },
    },
    select: { requestedUserTwitterID: true, tweetID: true },
    take: 10,
  });
}

export function getRequestedUserWooCommerceCategoryID(requestedUserTwitterID: WooCommerce["requestedUserTwitterID"]) {
  return prisma.wooCommerce.findFirst({
    where: { requestedUserTwitterID },
    select: {
      wooCommerceCategoryID: true,
      wooCommerceCategoryName: true,
    },
  });
}

export async function updateBannerGeneratedStatus(id: TweetedRequest["id"], mugsGenerated: TweetedRequest["mugsGenerated"]) {
  return prisma.tweetedRequest.update({
    where: {
      id: id,
    },
    data: {
      mugsGenerated,
    },
  });
}

export async function insertBannerBear(
  requestedUserTwitterID: BannerBear["requestedUserTwitterID"],
  generatedBannerUID: BannerBear["generatedBannerUID"],
  templateId: BannerBear["templateId"],
  status: BannerBear["status"],
  image_url_png: BannerBear["image_url_png"],
  image_url_jpg: BannerBear["image_url_jpg"],
  tweetedRequestId: BannerBear["tweetedRequestId"]
) {
  return prisma.bannerBear.create({
    data: {
      requestedUserTwitterID,
      generatedBannerUID,
      templateId,
      status,
      image_url_png,
      image_url_jpg,
      tweetedRequestId,
    },
    select: {
      id: true,
    },
  });
}

export async function insertCloudinary(
  publicID: Cloudinary["publicID"],
  uploadedBBURL: Cloudinary["uploadedBBURL"],
  bannerBearId: Cloudinary["bannerBearId"],
  imageURLFinal: Cloudinary["imageURLFinal"]
) {
  return prisma.cloudinary.create({
    data: {
      publicID,
      uploadedBBURL,
      bannerBearId,
      imageURLFinal,
    },
    select: {
      imageURLFinal: true,
    },
  });
}

export async function insertWooCommerce(
  requestedUserTwitterID: WooCommerce["requestedUserTwitterID"],
  wooCommerceCategoryID: WooCommerce["wooCommerceCategoryID"],
  wooCommerceCategoryName: WooCommerce["wooCommerceCategoryName"]
) {
  return prisma.wooCommerce.create({
    data: {
      requestedUserTwitterID,
      wooCommerceCategoryID,
      wooCommerceCategoryName,
    },
    select: {
      wooCommerceCategoryID: true,
      wooCommerceCategoryName: true,
    },
  });
}
