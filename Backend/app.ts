import "dotenv/config";
//dotenv.config(); 

//dotenv.config({ path: "./.env" });

//console.log("JWT_SECRET:", process.env.JWT_SECRET);

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { connectDB } from './config/db.ts';
import authRoutes from './routes/auth.routes.ts';
import subscriptionRoutes from './routes/subscription.routes.ts';
import webhookRoutes from './routes/webhook.routes.ts';
import interviewRoutes from './routes/interview.routes.ts';
import adminRoutes from "./routes/admin.routes.ts";


async function startServer() {
  const app = express();

const PORT = process.env.PORT || 5001; 

  // Trust proxy for cookies in iframe
  app.set('trust proxy', 1);

  // Connect to MongoDB (non-blocking)
   await connectDB();

  // Middlewares
  
app.use(cors({
  origin: "http://localhost:5173",
  credentials:true
}));

  app.use(express.json());
  app.use(cookieParser());

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/subscriptions', subscriptionRoutes);
  app.use('/api/webhooks', webhookRoutes);
  app.use('/api/interviews', interviewRoutes);

  app.use("/api/admin", adminRoutes);


  // API 404 Handler
  app.use('/api/*', (req, res) => {
    res.status(404).json({ message: `API route not found: ${req.originalUrl}` });
  });

  
  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
      message: 'Something went wrong!',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  });

  app.listen(PORT,  () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server error:', err);
});
