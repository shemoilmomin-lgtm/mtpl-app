const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'ertekaaz',
  host: 'localhost',
  database: 'mtpl_db',
  password: '',
  port: 5432,
});

// Username to user ID map
const userMap = {
  'Qamar': 1,
  'Kamal': 2,
  'Shahjahan': 3,
  'Shameem': 4,
  'Nizam': 5,
  'Shemoil': 6,
};

const readJSON = (filename) => {
  const filePath = path.join(__dirname, 'data', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

// Build address string from parts
const buildAddress = (obj) => {
  const parts = [
    obj.billingAddress,
    obj.billingStreet,
    obj.billingCity,
    obj.billingState,
    obj.billingPinCode ? String(obj.billingPinCode) : ''
  ].filter(p => p && String(p).trim() !== '');
  return parts.join(', ') || null;
};

// Build specifications from order fields
const buildSpecifications = (o) => {
  const parts = [];
  if (o.pages)          parts.push(`Pages: ${o.pages}`);
  if (o.jobSize)        parts.push(`Job Size: ${o.jobSize}`);
  if (o.paper)          parts.push(`Paper: ${o.paper}`);
  if (o.gsm)            parts.push(`GSM: ${o.gsm}${o.gsmCustom ? ' (' + o.gsmCustom + ')' : ''}`);
  if (o.lamination)     parts.push(`Lamination: ${o.lamination}`);
  if (o.specialEffects) parts.push(`Special Effects: ${o.specialEffects}`);
  if (o.uv)             parts.push(`UV: ${o.uv}`);
  return parts.join('\n') || null;
};

// Valid order statuses in new schema
const validOrderStatuses = [
  'negotiation','quotation','proforma','designing','review',
  'corrections','pre-press','printing','tax invoice',
  'invoice pending','ready at office','out for delivery',
  'waiting pickup','completed','long pending'
];

const mapOrderStatus = (s) => validOrderStatuses.includes(s) ? s : 'negotiation';

// Valid task statuses
const mapTaskStatus = (s) => {
  const map = {
    'in queue': 'in_queue',
    'In Queue': 'in_queue',
    'working': 'working',
    'Working': 'working',
    'waiting': 'waiting',
    'Waiting': 'waiting',
    'done': 'done',
    'Done': 'done',
    'completed': 'done',
    'Completed': 'done',
  };
  return map[s] || 'in_queue';
};

async function migrate() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ─── Delete test data inserted during dev ───
    await client.query('DELETE FROM order_assignees');
    await client.query('DELETE FROM task_assignees');
    await client.query('DELETE FROM quotation_items');
    await client.query('DELETE FROM comments');
    await client.query('DELETE FROM activity_logs');
    await client.query('DELETE FROM quotations');
    await client.query('DELETE FROM orders');
    await client.query('DELETE FROM tasks');
    await client.query('DELETE FROM leads');
    await client.query('DELETE FROM clients');
    console.log('Cleared existing test data');

    // ─── CLIENTS ───
    const clientsJSON = readJSON('clients.json');
    const clientIdMap = {}; // old string ID → new integer ID

    for (const [oldId, c] of Object.entries(clientsJSON)) {
      const fullName = [c.firstName, c.lastName, c.clientName]
        .filter(p => p && p.trim()) 
        .join(' ').trim() || c.companyName || 'Unknown';

      const address = buildAddress(c);

      const result = await client.query(
        `INSERT INTO clients (
          client_id, full_name, company_name, gst_number,
          contact_1_no, contact_2_no,
          email, address, is_archived, created_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
        RETURNING id`,
        [
          oldId,
          fullName,
          c.companyName || null,
          c.gstNumber || null,
          c.contactNo1 || null,
          c.contactNo2 || null,
          c.email || null,
          address,
          c.archived || false,
        ]
      );
      clientIdMap[oldId] = result.rows[0].id;
    }
    console.log(`Migrated ${Object.keys(clientsJSON).length} clients`);

    // ─── ORDERS ───
    const ordersJSON = readJSON('orders.json');
    const orderIdMap = {}; // old job_id string → new integer ID

    for (const [jobId, o] of Object.entries(ordersJSON)) {
      const specifications = buildSpecifications(o);
      const newClientId = clientIdMap[o.clientId] || null;
      const preparedById = userMap[o.preparedBy] || null;
      const advance = parseFloat(o.advance) || 0;
      const balance = parseFloat(o.balance) || 0;
      const quotationAmount = parseFloat(o.quotation) || null;

      const result = await client.query(
        `INSERT INTO orders (
          job_id, date, client_id, project_name, job_type,
          quantity, specifications, delivery_expected,
          proforma_invoice_number, invoice_number, job_link,
          quotation_manual_amount, advance, balance,
          notes, prepared_by, status, is_archived, is_deleted
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
        RETURNING id`,
        [
          jobId,
          o.date || null,
          newClientId,
          o.projectName || null,
          o.jobTypeCustom ? `${o.jobType} - ${o.jobTypeCustom}` : (o.jobType || null),
          o.quantity || null,
          specifications,
          o.deliveryExpected || null,
          o.proformaInvoiceNumber || null,
          o.invoiceNumber || null,
          o.jobLink || null,
          quotationAmount,
          advance,
          balance,
          o.remarks || null,
          preparedById,
          mapOrderStatus(o.status),
          o.archived || false,
          o.trashed || false,
        ]
      );

      const newOrderId = result.rows[0].id;
      orderIdMap[jobId] = newOrderId;

      // Migrate order comments
      if (o.comments && o.comments.length > 0) {
        for (const comment of o.comments) {
          const commentText = comment.text || '';
          const commentUser = comment.user || comment.by || null;
          const commentUserId = userMap[commentUser] || null;
          const commentTime = comment.timestamp || comment.at || null;

          if (!commentText.trim()) continue;

          await client.query(
            `INSERT INTO comments (entity_type, entity_id, user_id, message, created_at)
            VALUES ('order', $1, $2, $3, $4)`,
            [newOrderId, commentUserId, commentText, commentTime]
          );
        }
      }
    }
    console.log(`Migrated ${Object.keys(ordersJSON).length} orders`);

    // ─── QUOTATIONS ───
    const quotationsJSON = readJSON('quotations.json');

    for (const [qId, q] of Object.entries(quotationsJSON)) {
      const newClientId = clientIdMap[q.clientId] || null;

      const result = await client.query(
        `INSERT INTO quotations (
          quotation_id, date, client_id, subject, notes,
          tax_mode, show_tax_details, created_at
        ) VALUES ($1,$2,$3,$4,$5,'exclusive',true,$6)
        RETURNING id`,
        [
          qId,
          q.date || null,
          newClientId,
          q.subject || null,
          q.notes || null,
          q.date ? new Date(q.date) : new Date(),
        ]
      );

      const newQuotationId = result.rows[0].id;

      // Migrate line items
      if (q.items && q.items.length > 0) {
        for (let i = 0; i < q.items.length; i++) {
          const item = q.items[i];
          await client.query(
            `INSERT INTO quotation_items (quotation_id, item_name, description, quantity, rate, amount, sort_order)
            VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [
              newQuotationId,
              item.name || null,
              item.description || null,
              parseFloat(item.qty) || 0,
              parseFloat(item.rate) || 0,
              parseFloat(item.amount) || 0,
              i,
            ]
          );
        }
      }
    }
    console.log(`Migrated ${Object.keys(quotationsJSON).length} quotations`);

    // ─── TASKS ───
    const tasksJSON = readJSON('tasks.json');

    for (const [taskId, t] of Object.entries(tasksJSON)) {
      const createdById = userMap[t.createdBy] || null;
      const assignedToId = userMap[t.assignedTo] || null;

      const result = await client.query(
        `INSERT INTO tasks (
          title, description, created_by, status,
          due_date, is_important, sort_order, created_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING id`,
        [
          t.title || 'Untitled',
          t.description || null,
          createdById,
          mapTaskStatus(t.status),
          t.dueDate || null,
          t.important || false,
          t.sortOrder || 0,
          t.createdAt || null,
        ]
      );

      const newTaskId = result.rows[0].id;

      // Assign user
      if (assignedToId) {
        await client.query(
          `INSERT INTO task_assignees (task_id, user_id) VALUES ($1,$2)
          ON CONFLICT DO NOTHING`,
          [newTaskId, assignedToId]
        );
      }

      // Migrate task comments
      if (t.comments && t.comments.length > 0) {
        for (const comment of t.comments) {
          const commentUserId = userMap[comment.by] || null;
          if (!comment.text || !comment.text.trim()) continue;

          const parentResult = await client.query(
            `INSERT INTO comments (entity_type, entity_id, user_id, message, created_at)
            VALUES ('task', $1, $2, $3, $4)
            RETURNING id`,
            [newTaskId, commentUserId, comment.text, comment.at || null]
          );

          // Migrate replies
          if (comment.replies && comment.replies.length > 0) {
            for (const reply of comment.replies) {
              const replyUserId = userMap[reply.by] || null;
              if (!reply.text || !reply.text.trim()) continue;
              await client.query(
                `INSERT INTO comments (entity_type, entity_id, user_id, message, parent_id, created_at)
                VALUES ('task', $1, $2, $3, $4, $5)`,
                [newTaskId, replyUserId, reply.text, parentResult.rows[0].id, reply.at || null]
              );
            }
          }
        }
      }
    }
    console.log(`Migrated ${Object.keys(tasksJSON).length} tasks`);

    // ─── LEADS ───
    const leadsJSON = readJSON('leads.json');

    for (const [leadId, l] of Object.entries(leadsJSON)) {
      const enteredById = userMap[l.createdBy] || null;
      const linkedClientId = l.linkedClientId ? clientIdMap[l.linkedClientId] || null : null;

      const result = await client.query(
        `INSERT INTO leads (
          lead_id, client_id, client_manual_name, client_manual_contact,
          job_type, specifications, entered_by, status, created_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING id`,
        [
          leadId,
          linkedClientId,
          l.contactName || null,
          l.phone || null,
          l.productInterest || null,
          l.notes || null,
          enteredById,
          l.status || 'New',
          l.createdAt || null,
        ]
      );

      const newLeadId = result.rows[0].id;

      // Migrate lead comments
      if (l.comments && l.comments.length > 0) {
        for (const comment of l.comments) {
          const commentUserId = userMap[comment.by] || null;
          if (!comment.text || !comment.text.trim()) continue;

          const parentResult = await client.query(
            `INSERT INTO comments (entity_type, entity_id, user_id, message, created_at)
            VALUES ('lead', $1, $2, $3, $4)
            RETURNING id`,
            [newLeadId, commentUserId, comment.text, comment.at || null]
          );

          if (comment.replies && comment.replies.length > 0) {
            for (const reply of comment.replies) {
              const replyUserId = userMap[reply.by] || null;
              if (!reply.text || !reply.text.trim()) continue;
              await client.query(
                `INSERT INTO comments (entity_type, entity_id, user_id, message, parent_id, created_at)
                VALUES ('lead', $1, $2, $3, $4, $5)`,
                [newLeadId, replyUserId, reply.text, parentResult.rows[0].id, reply.at || null]
              );
            }
          }
        }
      }
    }
    console.log(`Migrated ${Object.keys(leadsJSON).length} leads`);

    // ─── CLIENT ACTIVITY LOGS ───
    const clientActivities = readJSON('client_activities.json');
    for (const [oldClientId, entries] of Object.entries(clientActivities)) {
      if (!oldClientId) continue;
      const newClientId = clientIdMap[oldClientId] || null;
      if (!newClientId) continue;
      for (const entry of entries) {
        const userId = userMap[entry.user] || null;
        const message = `${entry.action}: ${entry.details || ''}`.trim();
        await client.query(
          `INSERT INTO activity_logs (entity_type, entity_id, user_id, message, created_at)
          VALUES ('client', $1, $2, $3, $4)`,
          [newClientId, userId, message, entry.timestamp || null]
        );
      }
    }
    console.log('Migrated client activity logs');

    // ─── LEAD ACTIVITY LOGS ───
    const leadActivities = readJSON('lead_activities.json');
    const leadsResult = await client.query('SELECT id, lead_id FROM leads');
    const leadIdMap = {};
    leadsResult.rows.forEach(r => { leadIdMap[r.lead_id] = r.id; });

    for (const [oldLeadId, entries] of Object.entries(leadActivities)) {
      const newLeadId = leadIdMap[oldLeadId] || null;
      if (!newLeadId) continue;
      for (const entry of entries) {
        const userId = userMap[entry.user] || null;
        const message = `${entry.action}: ${entry.details || ''}`.trim();
        await client.query(
          `INSERT INTO activity_logs (entity_type, entity_id, user_id, message, created_at)
          VALUES ('lead', $1, $2, $3, $4)`,
          [newLeadId, userId, message, entry.timestamp || null]
        );
      }
    }
    console.log('Migrated lead activity logs');

    // ─── SETTINGS ───
    const settingsJSON = readJSON('settings.json');
    for (const [key, value] of Object.entries(settingsJSON)) {
      await client.query(
        `INSERT INTO settings (key, value) VALUES ($1, $2)
        ON CONFLICT (key) DO UPDATE SET value=$2`,
        [key, String(value)]
      );
    }
    console.log('Migrated settings');

    await client.query('COMMIT');
    console.log('\n✅ Migration complete.');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err.message);
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
