const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./config/db');

const attachmentsRouter = require('./routes/attachments');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const clientsRouter = require('./routes/clients');
const quotationsRouter = require('./routes/quotations');
const ordersRouter = require('./routes/orders');
const tasksRouter = require('./routes/tasks');
const leadsRouter = require('./routes/leads');
const commentsRouter = require('./routes/comments');
const remindersRouter = require('./routes/reminders');
const notificationsRouter = require('./routes/notifications');
const activityRouter = require('./routes/activity');
const settingsRouter = require('./routes/settings');
const presenceRouter = require('./routes/presence');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/attachments', attachmentsRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/quotations', quotationsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/reminders', remindersRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/activity', activityRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/presence', presenceRouter);

app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
