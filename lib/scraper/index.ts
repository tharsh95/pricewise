"use server"

import axios from "axios"
import * as cheerio from "cheerio"
import { extractPrice } from "../utils"
export async function scrapeAmazonData(url: string) {
    if (!url) return
    // curl --proxy brd.superproxy.io:22225 --proxy-user brd-customer-hl_5f0e3bd8-zone-pricewise:c9or4f6dqm2h -k https://lumtest.com/myip.json
    const username = String(process.env.BRIGHT_DATA_USERNAME)
    const password = String(process.env.BRIGHT_DATA_PASSWORD)
    const port = 22225
    const session_id = (1000000 * Math.random()) | 0
    const options = {
        auth: {

            username: `${username}-session-${session_id}`,
            password
        },
        host: "brd.superproxy.io",
        port,
        rejectUnauthorized: false
    }
    try {
        const response = await axios.get(url, options)
        const $ = cheerio.load(response.data)
        const title = $('#productTitle').text().trim()
        const cost = extractPrice($('div.a-section>span.a-price>span>span.a-price-whole'),$('div.a-spacing-none>span.a-price>span.a-offscreen'))
        const originalcost = extractPrice($('span.a-size-small>span.a-price>span.a-offscreen'))
        const image = $('img#landingImage').attr('data-a-dynamic-image') || '{}'
        const imageurls = Object.keys(JSON.parse(image))
        console.log(cost)
        const outofstock = $('#availability span.a-size-medium').text().trim().toLowerCase() === 'currently unavailable.'
        // console.log({title,cost,originalcost,image,outofstock,imageurls})
    }
    catch (e) {
        console.log("failed")
    }
} 