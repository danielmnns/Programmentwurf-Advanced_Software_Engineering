import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import routes from './routes';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', routes);

mongoose
  .connect(process.env.MONGO_URI!, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });
