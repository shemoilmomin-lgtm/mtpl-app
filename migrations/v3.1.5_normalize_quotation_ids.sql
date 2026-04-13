-- Normalize all quotation IDs to MTPLQ-xxxx format
-- Records created before the MTPLQ naming convention have q_<timestamp> or QT-xxxx IDs
-- This migration converts them using the record's id for the number part

UPDATE quotations
SET quotation_id = 'MTPLQ-' || LPAD(id::text, 4, '0')
WHERE quotation_id NOT LIKE 'MTPLQ-%';
