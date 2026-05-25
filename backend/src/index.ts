import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import profileRouter from './routes/users.js';
import notificationRouter from './routes/notification';
import questionRouter from './routes/question';
import answerRouter from './routes/answer';
import tagsRouter from './routes/tags';
import aiRouter from './routes/ai';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'Hello from Express!' }));
app.use('/profile', profileRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/questions', questionRouter);
app.use('/api/v1/answers', answerRouter);
app.use('/api/v1/tags', tagsRouter);
app.use('/api/v1/ai', aiRouter);

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));