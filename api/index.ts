import app from '../backend/src/index.js';

// Vercel Entry Point - Last Updated: 2026-04-21T14:40:00Z
export default (req: any, res: any) => {
  return app(req, res);
};
