import { Router, Request, Response } from 'express';
import { generatePdf, closeBrowser } from '../services/pdfGenerator';

const router = Router();

interface PdfRequestBody {
  html: string;
  options?: {
    format?: 'A4' | 'Letter';
    margin?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
    };
    printBackground?: boolean;
  };
}

router.post('/pdf/generate', async (req: Request, res: Response) => {
  try {
    const { html, options } = req.body as PdfRequestBody;

    if (!html || typeof html !== 'string') {
      return res.status(400).json({ error: 'html field is required and must be a string' });
    }

    const pdfBuffer = await generatePdf(html, options);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation failed:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await closeBrowser();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await closeBrowser();
  process.exit(0);
});

export default router;
