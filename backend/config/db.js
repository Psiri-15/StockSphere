import mongoose from 'mongoose';

let memoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stocksphere';

  try {
    // Attempt connecting to the configured URI (local or Atlas) with a short timeout
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.warn(`[MongoDB] Direct connection to ${uri} failed: ${err.message}`);
    console.log('[MongoDB] Launching zero-config in-memory MongoDB fallback for instant local execution...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const memUri = memoryServer.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`[MongoDB] Connected to in-memory instance at: ${memUri}`);
      return conn;
    } catch (memErr) {
      console.error(`[MongoDB] Fatal: Could not initialize fallback MongoDB: ${memErr.message}`);
      throw memErr;
    }
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};
