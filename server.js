const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');



const app = express();
app.use(bodyParser.text({ type: 'text/html' }));

// POST /generate-pdf
app.post('/generate-pdf', async (req, res) => {
  try {
    const htmlContent = req.body;

    const browser = await puppeteer.launch({
    executablePath: puppeteer.executablePath(), // 👈 critical line
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
    ],
    headless: true
    });


    const page = await browser.newPage();

    // Load HTML directly
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true
    });

    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="Acres_of_Mercy_Prospectus.pdf"',
      'Content-Length': pdfBuffer.length
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF generation failed:', err);
    res.status(500).send('Failed to generate PDF');
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`PDF service running on port ${PORT}`);
});
