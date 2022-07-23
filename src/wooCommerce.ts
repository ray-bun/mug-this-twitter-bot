import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import "./lib/env";

const api = new WooCommerceRestApi({
  url: process.env.WOOCOMMERCE_WEBSITE,
  consumerKey: process.env.WOOCOMMERC_CONSUMER_KEY,
  consumerSecret: process.env.WOOCOMMERC_CONSUMER_SECRET,
  version: "wc/v3",
});

export async function createCategory(categoryName: string, categoryImageURL: string) {
  const data = {
    name: categoryName,
    image: {
      src: categoryImageURL,
    },
  };

  const categoryPosted = await api
    .post("products/categories", data)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log("Error at woocommerce createCategory: ", error.response.data);
    });
  return categoryPosted;
}
//Category URL https://mug-this.com/?product_cat=someusertest
export async function createProduct(categoryID: number, productImage: string, ProductTitle: string) {
  const stripEmojis = (str: string) =>
    str
      .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, "")
      .replace(/\s+/g, " ")
      .trim();
  const data = {
    name: ProductTitle,
    type: "simple",
    regular_price: "30",

    short_description: `<img class="alignnone size-full wp-image-375" src="https://mug-this.com/wp-content/uploads/2022/07/free-delivery.png" alt="FREE SHIPPING WORLD WIDE!" height="50" />`,
    description: ` <strong>FREE SHIPPING WORLD WIDE!</strong><br />
    <strong>Features</strong>
    <ul>
    <li>Scan the QR code to access the live tweet at any time!</li>
    <li>Coffee, tea, or art? Have it all with this eye-opening ceramic mug</li>
    <li>Holds 11 oz. (325 ml)</li>
    <li>Mug diameter is 3.2" (8.2 cm), not including handle</li>
    <li>Dishwasher-safe ceramic</li>
    <li>Wraparound design printed for you when you order</li>
    </ul>

    `,
    slug: stripEmojis(ProductTitle),
    categories: [
      {
        id: categoryID,
      },
    ],
    images: [
      {
        src: productImage,
      },
    ],
  };

  const productPosted = await api
    .post("products", data)
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.log(error.response.data);
    });
  productPosted;
}
