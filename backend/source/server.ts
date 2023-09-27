import express, { Application } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes'
import eventRoutes from './routes/eventRoutes'
import userRoutes from './routes/userRoutes'


const app: Application = express();
const PORT: number | String = process.env.PORT || 8080;

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// Use routes
app.use(authRoutes);
app.use(eventRoutes);
app.use(userRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
