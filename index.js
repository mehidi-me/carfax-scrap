
import express from 'express';
import fetch from 'node-fetch';


const app = express();
const port = 7800;

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

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});