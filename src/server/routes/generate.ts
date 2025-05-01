import { Request, Response, Router } from 'express';

const router = Router();

// Type definitions
interface GenerateRequest {
  prompt: string;
  theme?: 'light' | 'dark';
}

interface GenerateResponse {
  html: string;
  css: string;
}

// Mock generator function
const mockGenerator = (prompt: string, theme: 'light' | 'dark' = 'light'): GenerateResponse => {
  return {
    html: `
      <div class="container ${theme}">
        <h1>${prompt || 'Generated Website'}</h1>
        <p>This is a mock response. Real generation will come later.</p>
      </div>
    `,
    css: `
      body { 
        background: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'};
        color: ${theme === 'dark' ? 'white' : 'black'};
      }
    `
  };
};

// POST endpoint
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
router.post('/', (req: Request<{}, {}, GenerateRequest>, res: Response<GenerateResponse>) => {
  const { prompt, theme = 'light' } = req.body;
  const response = mockGenerator(prompt, theme);
  res.json(response);
});

export default router;