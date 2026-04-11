const pool = require('../config/db');

/**
 * Log a user action to activity_logs.
 * @param {object} opts
 * @param {number} opts.userId      - ID of the user performing the action
 * @param {string} opts.action      - e.g. 'created', 'edited', 'deleted', 'archived', 'restored', 'trashed', 'duplicated', 'commented', 'converted'
 * @param {string} opts.entityType  - 'order' | 'client' | 'quotation' | 'task' | 'lead'
 * @param {number} [opts.entityId]  - DB id of the record
 * @param {string} [opts.entityLabel] - Human-readable identifier, e.g. "20240101-001", "CLT-0001"
 * @param {string} [opts.message]   - Optional extra detail
 */
async function logActivity({ userId, action, entityType, entityId, entityLabel, message }) {
  try {
    const label = entityLabel || '';
    const msg = message || `${action} ${entityType}${label ? ' ' + label : ''}`;
    await pool.query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, entity_label, message)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, action, entityType, entityId || null, label, msg]
    );
  } catch (err) {
    // Never let logging failures break the main request
    console.error('logActivity error:', err.message);
  }
}

/**
 * Compare old DB record against new values and return a human-readable diff string.
 * @param {object} oldRecord - Row from the database before the update
 * @param {object} newValues - Key-value pairs of the incoming new values
 * @param {Array<{key: string, label: string, type?: string}>} fields - Fields to compare
 * @returns {string|null} Diff string like "Status: draft → confirmed; Notes: ... → ..." or null if nothing changed
 */
function buildDiff(oldRecord, newValues, fields) {
  const changes = [];
  for (const { key, label, type } of fields) {
    let oldVal = oldRecord[key];
    let newVal = newValues[key];

    if (type === 'date') {
      oldVal = oldVal ? String(oldVal).slice(0, 10) : '';
      newVal = newVal ? String(newVal).slice(0, 10) : '';
    } else if (type === 'number') {
      const oldNum = parseFloat(oldVal);
      const newNum = parseFloat(newVal);
      if ((isNaN(oldNum) ? 0 : oldNum) === (isNaN(newNum) ? 0 : newNum)) continue;
      oldVal = isNaN(oldNum) ? '0' : String(oldNum);
      newVal = isNaN(newNum) ? '0' : String(newNum);
    } else {
      oldVal = oldVal != null ? String(oldVal).trim() : '';
      newVal = newVal != null ? String(newVal).trim() : '';
    }

    if (oldVal !== newVal) {
      changes.push(`${label}: ${oldVal || '(empty)'} → ${newVal || '(empty)'}`);
    }
  }
  return changes.length > 0 ? changes.join('; ') : null;
}

module.exports = logActivity;
module.exports.buildDiff = buildDiff;
