import 'dotenv/config';
import { app } from './app.js';
import connectDB from './db/index.js';

connectDB()
  .then(() => {
    app.on('error', (error) => {
      console.error('Express server error:', error);
      throw error;
    });

    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port ${process.env.PORT || 8000}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to the database:', error);
  });

// import express from 'express';
// const app = express();

// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     app.on('error', (error) => {
//       console.error('Express server error:', error);
//       throw error;
//     });

//     app.listen(process.env.PORT, () => {
//       console.log(`Server is running on port ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.error('Database connection failed:', error);
//     throw error;
//   }
// })();
