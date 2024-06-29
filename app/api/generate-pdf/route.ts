// pages/api/generate-pdf.ts
import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';

// Configure the body parser
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Adjust as necessary
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { html } = req.body;

    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({ format: 'A4' });
      await browser.close();

      res.setHeader('Content-Type', 'application/pdf');
      res.status(200).send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
