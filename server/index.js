const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./config/db');

const { pushToUser } = require('./config/sseClients');

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
const taskReminderSendsRouter = require('./routes/taskReminderSends');
const searchRouter = require('./routes/search');
const feedbacksRouter = require('./routes/feedbacks');

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
app.use('/api/task-reminder-sends', taskReminderSendsRouter);
app.use('/api/search', searchRouter);
app.use('/api/feedbacks', feedbacksRouter);

app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Reminder scheduler — runs every 60 seconds
setInterval(async () => {
  try {
    const due = await pool.query(
      `SELECT r.*, t.title AS task_title
       FROM reminders r
       JOIN tasks t ON t.id = r.task_id
       WHERE r.remind_at <= NOW() AND r.is_dismissed = false`
    );
    for (const reminder of due.rows) {
      // Insert into notifications table
      const message = `Reminder for task: ${reminder.task_title}`;

      const notifResult = await pool.query(
        `INSERT INTO notifications (user_id, message, entity_type, entity_id, notification_type)
         VALUES ($1, $2, 'task', $3, 'reminder') RETURNING *`,
        [reminder.user_id, message, reminder.task_id]
      );
      const notif = notifResult.rows[0];

      // Push live SSE notification
      pushToUser(reminder.user_id, 'notification', {
        id: notif.id,
        type: 'reminder',
        task_id: reminder.task_id,
        task_title: reminder.task_title,
        message,
      });

      // Log to activity
      await pool.query(
        `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, entity_label, message)
         VALUES ($1, 'reminder fired', 'task', $2, $3, $4)`,
        [reminder.user_id, reminder.task_id, reminder.task_title, `Reminder fired for task: ${reminder.task_title}`]
      );

      // Mark reminder as dismissed so it doesn't fire again
      await pool.query(
        'UPDATE reminders SET is_dismissed = true WHERE id = $1',
        [reminder.id]
      );
    }
  } catch (err) {
    console.error('Reminder scheduler error:', err);
  }
}, 60 * 1000);
