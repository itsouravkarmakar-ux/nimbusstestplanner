import app from '../backend/src/index.js';

// Vercel expects a default export for the serverless function
export default (req: any, res: any) => {
  return app(req, res);
};
