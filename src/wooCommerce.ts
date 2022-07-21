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

export async function createProduct(categoryID: number, productImage: string, ProductTitle: string) {
  const data = {
    name: ProductTitle,
    type: "simple",
    regular_price: "29.99",
    description: ``,
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
