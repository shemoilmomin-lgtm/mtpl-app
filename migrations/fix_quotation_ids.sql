-- Rename legacy q_<timestamp> quotation_ids (id <= 41) to QT-XXXX format
UPDATE quotations
SET quotation_id = 'QT-' || LPAD(id::text, 4, '0')
WHERE id <= 41;
