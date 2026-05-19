import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import profileRouter from './routes/profile.js';
import notificationRouter from './routes/notification';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'Hello from Express!' }));
app.use('/profile', profileRouter);
app.use('/api/v1/notifications', notificationRouter);

app.listen(5000, () => console.log('Server running on http://localhost:5000'));