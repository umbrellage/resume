import { Router, Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { sendEmail } from '../services/email';
import { generatePdf } from '../services/pdfGenerator';

const router = Router();

router.use(authMiddleware);

// POST /api/email/send-resume
router.post('/send-resume', async (req: AuthRequest, res: Response) => {
  try {
    const { to, subject, html } = req.body;

    if (!to || !html) {
      return res.status(400).json({ error: 'to and html are required' });
    }

    // Generate PDF from HTML
    const pdfBuffer = await generatePdf(html, {
      format: 'A4',
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      printBackground: true,
    });

    // Send email with PDF attachment
    await sendEmail({
      to,
      subject: subject || '我的简历',
      text: '请查看附件中的简历PDF',
      attachments: [
        {
          filename: 'resume.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Send resume email error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

export default router;
