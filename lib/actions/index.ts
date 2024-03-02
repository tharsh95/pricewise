import { scrapeAmazonData } from "../scraper"

export async function scrape(url: string) {
    try {
        const scrapedData = await scrapeAmazonData(url)
    }
    catch (error: any) {
        throw new Error("Unable to Track Data")
    }
}