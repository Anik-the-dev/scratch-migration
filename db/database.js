import mongoose from "mongoose";
import {configDotenv} from "dotenv";

configDotenv();

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(`${process.env.DATABASE_URL}`);
    console.log(`MongoDB connected`);
  } catch (error) {
    console.error(error.message);
  }
};

export const disconnectMongoDB = async () => {
  try {
    await mongoose.connection.close();
    console.log(`MongoDB disconnected`);
  } catch (error) {
    console.error(error.message);
  }
};

export const isConnected = () => mongoose.connection.readyState === 1;
