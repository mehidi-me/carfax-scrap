
import express from 'express';
import fetch from 'node-fetch';
import path from 'path';


const app = express();
const port = 7800;

// Serve static files from the 'public' directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// Route to generate and download the PDF
app.get('/get-report/:vin/:auth', async (req, res) => {
  const vin = req.params.vin;
  const auth = req.params.auth;

  // Construct the URL with the dynamic VIN
  const url = `https://dealers.carfax.com/api/vhr/${vin}`;

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'en-US,en-GB;q=0.9,en;q=0.8',
      authorization: `Bearer ${auth}`,
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
    return res.status(200).send(data);
  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).send(err);
  }
});


// Route to generate and download the PDF
app.get('/download-pdf/:vin/:auth', async (req, res) => {
  const vin = req.params.vin; // Get the dynamic VIN from the URL parameter
  const auth = req.params.auth;
  // Construct the URL with the dynamic VIN
  const url = `https://dealers.carfax.com/api/vhr/${vin}`;

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'en-US,en-GB;q=0.9,en;q=0.8',
      authorization: `Bearer ${auth}`,
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
    const browser = await puppeteer.connect({
      browserWSEndpoint: 'https://production-sfo.browserless.io/?token=QqMbRhFiZOeDGUe6a878a59dcfd621dd6fb473f063',
    });
    const page = await browser.newPage();
    
    // Set the content of the page using the HTML from API response
    await page.setContent(data.vhrHtml, { waitUntil: 'domcontentloaded' });
    // await page.waitForSelector('#top-bar > div > div.right-header-bar-items > div > button > span');
    // await page.click("#top-bar > div > div.right-header-bar-items > div > button > span");

    // await page.waitForSelector(".HistoryBasedValueSection");
    // await page.click(".HistoryBasedValueSection");

   // await page.waitForSelector("div > div.modal_footer > div > div > button:nth-child(1)");
   // await page.click(".modal_footer_actions button:first-child");
   await page.evaluate(() => {
    const element = document.querySelector('.print-only-report-provided-by-snackbar');
    if (element) {
      element.remove();
    }
  });
     await page.emulateMediaType('print');

    // // Simulate window.print()
    await page.evaluate(() => {
      window.print();
    });
    // Define PDF options and output to a buffer
    const pdfBuffer = await page.pdf({
      format: 'A4',              // A4 size
      printBackground: true,     // Include background graphics
      path: `public/${vin}.pdf`,
    });

    // Close Puppeteer
    await browser.close();

    // Set response headers to indicate a file download
    // res.set({
    //   'Content-Type': 'application/pdf',
    //   'Content-Disposition': `attachment; filename="${vin}.pdf"`,
    // });

    // Send the PDF buffer as the response
    // const file = `${vin}.pdf`;
    // res.download(file);
    return res.status(200).send({path: `public/${vin}.pdf`,status:true})
  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).send(err);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});






