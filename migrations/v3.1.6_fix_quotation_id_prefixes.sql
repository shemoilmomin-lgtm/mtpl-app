-- Fix quotation ID prefixes: two-prefix convention
-- id <= 41 → QT-xxxx (legacy records created before MTPLQ convention)
-- id >  41 → MTPLQ-xxxx (records created after MTPLQ convention was adopted)
-- This corrects the over-broad migration in v3.1.5 which set all records to MTPLQ-

UPDATE quotations
SET quotation_id = 'QT-' || LPAD(id::text, 4, '0')
WHERE id <= 41;

UPDATE quotations
SET quotation_id = 'MTPLQ-' || LPAD(id::text, 4, '0')
WHERE id > 41;
