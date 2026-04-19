import mongoose from 'mongoose';
export const connectDB = async () => {

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn('WARNING: MONGODB_URI is not set. The application will attempt to connect to a local MongoDB instance, which may not exist in this environment.');
}

const DB_URI = MONGODB_URI || 'mongodb://localhost:27017/interviewpro';

  try {
    await mongoose.connect(DB_URI);
    console.log('MongoDB connected successfully');
    console.log("MONGODB_URI:", process.env.MONGODB_URI);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Do not exit process, let the server start and serve frontend
  }
};
