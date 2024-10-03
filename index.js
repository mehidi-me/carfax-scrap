import express from "express";
import fetch from "node-fetch";
import path from "path";
import puppeteer from "puppeteer";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = 7800;

// Serve files from /tmp directory
app.use("/files", express.static("/tmp"));

app.get("/download-pdf/:vin/:auth", async (req, res) => {
  const vin = req.params.vin;
  const auth = req.params.auth;
  const fullUrl = req.protocol + "://" + req.get("host");
  console.log(fullUrl);

  const url = `https://dealers.carfax.com/api/vhr/${vin}`;

  const options = {
    method: "GET",
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "en-US,en-GB;q=0.9,en;q=0.8",
      authorization: `Bearer ${auth}`,
      priority: "u=1, i",
      "sec-ch-ua":
        '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site",
      Referer: "https://www.carfaxonline.com/",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!data || !data.vhrHtml) {
      return res.status(400).send("No HTML content found");
    }

    // Use /tmp directory for storing the HTML file
    const filePath = path.join("/tmp", `${vin}.html`);
    fs.writeFile(filePath, data.vhrHtml, (err) => {
      if (err) {
        console.error("Error writing file", err);
        return res.status(500).send("Internal Server Error");
      }
      console.log("HTML file created successfully!");
    });

    const browser = await puppeteer.launch({
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });

    const page = await browser.newPage();
    await page.goto(`${fullUrl}/files/${vin}.html`, {
      waitUntil: "domcontentloaded",
    });

    await page.evaluate(() => {
      const element = document.querySelector(".advantage-dealer-badge-info");
      if (element) {
        element.remove();
      }
    });

    await page.evaluate(() => {
      const element = document.querySelector(
        ".print-only-report-provided-by-snackbar"
      );
      if (element) {
        element.remove();
      }
    });

    await page.emulateMediaType("print");

    const pdfPath = path.join("/tmp", `${vin}.pdf`);
    await page.pdf({
      format: "A4",
      printBackground: true,
      path: pdfPath,
    });

    await browser.close();

    return res
      .status(200)
      .send({ file_path: `${fullUrl}/files/${vin}.pdf`, status: true });
  } catch (err) {
    console.error("Error generating PDF:", err);
    res.status(500).send(err);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
