import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import usersRouter from './routes/users';
import notificationRouter from './routes/notification';
import questionRouter from './routes/question';
import answerRouter from './routes/answer';
import statusesRouter from './routes/statuses';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'Hello from Express!' }));
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/questions', questionRouter);
app.use('/api/v1/answers', answerRouter);
app.use('/api/v1/statuses', statusesRouter);

app.listen(5000, () => console.log('Server running on http://localhost:5000'));