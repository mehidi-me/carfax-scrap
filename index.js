
import express from 'express';
import puppeteer from 'puppeteer';
import fetch from 'node-fetch';


const app = express();
const port = 7800;
const AUTH = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1EUkNRMEZETnpReVFrVXlNVE01TkVNME5URkNOREU1TWpGQ01EaEVOalZHUWtJNU16Z3pNdyJ9.eyJodHRwczovL2NhcmZheC5jb20vaWRlbnRpZmllcnMiOnsiY29tcGFueV9jb2RlIjoiV0JMV0tXSEdLWSIsInN1YnNjcmliZXJfaWQiOiJXQkxXS1dIR0tZIiwib25lX2FjY291bnRfaWQiOjc2MzUwODcxMywiZGVhbGVyX3VzZXJfaWQiOjM2MjQ3NDUsImFjY291bnRfbnVtYmVyIjoxNzk4ODEsImxvY2F0aW9uX2lkIjo1NzgyNDksInNhbGVzZm9yY2VfaWQiOiIwMDExTDAwMDAyQjA4TEFRQVoifSwiaHR0cHM6Ly9jYXJmYXguY29tL3Jlc291cmNlc093bmVkIjp7InN1YnNjcmliZXJfaWQiOlsiV0JMV0tXSEdLWSJdLCJ1c2VyX2lkIjpbMzYyNDc0NV0sImxvY2F0aW9uX2lkIjpbNTc4MjQ5XX0sImh0dHBzOi8vY2FyZmF4LmNvbS9hY2NvdW50VHlwZSI6IkRFQUxFUiIsImh0dHBzOi8vY2FyZmF4LmNvbS9kZWFsZXJzIjp7ImVtYWlsIjoiU0JQUkVNSVVNTExDQEdNQUlMLkNPTSJ9LCJodHRwczovL2NhcmZheC5jb20vYXV0aG9yaXRpZXMiOlsiVkhSIiwiRFJJUyIsIkhFTFAiLCJBQ0NPVU5UIl0sImlzcyI6Imh0dHBzOi8vYXV0aC5jYXJmYXguY29tLyIsInN1YiI6ImF1dGgwfDc2MzUwODcxMyIsImF1ZCI6WyJodHRwczovL2RlYWxlcnMuY2FyZmF4LmNvbS9hcGkvIiwiaHR0cHM6Ly9hY2NvdW50cy5jYXJmYXguYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTcyNjI0ODQ2NywiZXhwIjoxNzI2MzM0ODY3LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIG9mZmxpbmVfYWNjZXNzIiwiYXpwIjoidTBFUlpsZzNnbmcwOXRtY2Z4bXozWWVzeUZXV21sb00ifQ.LkDwCjPZkd5MtVv1iCzIyvG49ZrrKt6WmW0KSx2HisP5pcWShQ1RiZS-maVtlaAxin19NUD0J-fBlXqiIn4vqqWa7THpuUAVCKX2_WUWN92l2XQwWfm19mAy46fXOmuWfAauQCHEFiXG88YbhV0c4l6G0HYEqC7Na0PSkD3HNCHtB33lyMoO079r_mpuHCS3gzDKzMYi5cP6oas9iHIpIGeDBQvFRViaQsNBmK3PJEmgvbYlzp9gRnB8j50R-mOYVuWkmZq4cN7WbWM-dxcCwlzw2GvMjSTsW9od4zTaI1uF_tczNQE1QlWL03kGvmIfsJkabuMDJKRLGVe9JShadw";

// Route to generate and download the PDF
app.get('/download-pdf/:vin', async (req, res) => {
  const vin = req.params.vin; // Get the dynamic VIN from the URL parameter

  // Construct the URL with the dynamic VIN
  const url = `https://dealers.carfax.com/api/vhr/${vin}`;

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'en-US,en-GB;q=0.9,en;q=0.8',
      authorization: `Bearer ${AUTH}`,
      priority: 'u=1, i',
      'sec-ch-ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'cross-site',
      Referer: 'https://www.carfaxonline.com/',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    }
  };

  try {
    // Fetch data from the API with dynamic VIN
    const response = await fetch(url, options);
    const data = await response.json();

    if (!data || !data.vhrHtml) {
      return res.status(400).send('No HTML content found');
    }
console.log(data.vhrHtml);
    // Launch Puppeteer with necessary flags
    const browser = await puppeteer.launch({headless:false});
    const page = await browser.newPage();
    
    // Set the content of the page using the HTML from API response
    await page.setContent(data.vhrHtml, { waitUntil: 'domcontentloaded' });
    // await page.waitForSelector('#top-bar > div > div.right-header-bar-items > div > button > span');
    // await page.click("#top-bar > div > div.right-header-bar-items > div > button > span");

    // await page.waitForSelector(".HistoryBasedValueSection");
    // await page.click(".HistoryBasedValueSection");

   // await page.waitForSelector("div > div.modal_footer > div > div > button:nth-child(1)");
   // await page.click(".modal_footer_actions button:first-child");
     await page.emulateMediaType('print');

    // // Simulate window.print()
    await page.evaluate(() => {
      window.print();
    });
    // Define PDF options and output to a buffer
    const pdfBuffer = await page.pdf({
      format: 'A4',              // A4 size
      printBackground: true,     // Include background graphics
      path: `${vin}.pdf`,
    });

    // Close Puppeteer
    await browser.close();

    // Set response headers to indicate a file download
    // res.set({
    //   'Content-Type': 'application/pdf',
    //   'Content-Disposition': `attachment; filename="${vin}.pdf"`,
    // });

    // Send the PDF buffer as the response
    const file = `${vin}.pdf`;
    res.download(file);
  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).send('Error generating PDF');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
