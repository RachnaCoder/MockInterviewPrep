 //import mongoose from 'mongoose';
// export const connectDB = async () => {

// const MONGODB_URI = process.env.MONGODB_URI;

// if (!MONGODB_URI) {
//   console.warn('WARNING: MONGODB_URI is not set. The application will attempt to connect to a local MongoDB instance, which may not exist in this environment.');
// }

// const DB_URI = MONGODB_URI || 'mongodb://localhost:27017/interviewpro';

//   try {
//     await mongoose.connect(DB_URI);
//     console.log('MongoDB connected successfully');
//     console.log("MONGODB_URI:", process.env.MONGODB_URI);
//   } catch (error) {
//     console.error('MongoDB connection error:', error);
//     // Do not exit process, let the server start and serve frontend
//   }
// };


import mongoose from 'mongoose';

export const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;
  const DB_URI = MONGODB_URI || 'mongodb://localhost:27017/interviewpro';

  try {
    // ❗ Disable buffering (fail fast instead of waiting 10s)
    mongoose.set('bufferCommands', false);

    await mongoose.connect(DB_URI, {
      serverSelectionTimeoutMS: 30000, // wait max 30s before failing
    });

    console.log('✅ MongoDB connected successfully');

    // 🔍 Connection event listeners (VERY IMPORTANT)
    mongoose.connection.on('connected', () => {
      console.log('🟢 Mongoose connected');
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🟠 Mongoose disconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('🔴 Mongoose error:', err);
    });

  } catch (error) {
    console.error('❌ MongoDB connection error:', error);

    // 🔥 CRITICAL: stop server if DB not connected
    process.exit(1);
  }
};