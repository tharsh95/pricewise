"use server"
import { revalidatePath } from "next/cache"
import Product from "../models/product"
import { connectToDB } from "../mongoose"
import { scrapeAmazonData } from "../scraper"
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils"
import { generateEmailBody, sendEmail } from "../nodemailer"
import { User } from "../types"

export async function scrape(url: string) {
  if (!url) return;

  try {
    connectToDB();

    const scrapedProduct = await scrapeAmazonData(url);

    if (!scrapedProduct) return;

    let product = scrapedProduct;

    const existingProduct = await Product.findOne({ url: scrapedProduct.url });

    if (existingProduct) {
      const updatedPriceHistory: any = [
        ...existingProduct.priceHistory,
        { price: scrapedProduct.currentPrice }
      ]

      product = {
        ...scrapedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      }
    }

    const newProduct = await Product.findOneAndUpdate(
      { url: scrapedProduct.url },
      product,
      { upsert: true, new: true }
    );
    revalidatePath(`/products/${newProduct._id}`);
  } catch (error: any) {
    throw new Error(`Failed to create/update product: ${error.message}`)
  }
}

export async function getProductById(id: string) {
  try {
    connectToDB()
    const product = await Product.findOne({ _id: id })

    if (!product) return
    return product
  }
  catch (e) {
    console.log(e)
  }

}
export async function getAllProducts() {
  try {
    connectToDB()
    const products = await Product.find()
    return products
  }
  catch (e) {
    console.log(e)
  }
}
export async function getSimilarProducts(id: string) {
  try {
    connectToDB()
    const currentProduct = await Product.findById(id)
    if (!currentProduct) return
    const similarProducts = await Product.find({
      _id: { $ne: id  }
    }).limit(3)
    return similarProducts
  }
  catch (e) {
    console.log(e)
  }
}
export async function addUserEmailToProduct(productId: string, userEmail: string) {
  try {
    const product = await Product.findById(productId);

    if(!product) return;

    const userExists = product.users.some((user: User) => user.email === userEmail);

    if(!userExists) {
      product.users.push({ email: userEmail });

      await product.save();

      const emailContent = await generateEmailBody(product, "WELCOME");

      await sendEmail(emailContent, [userEmail]);
    }
  } catch (error) {
    console.log(error);
  }
}