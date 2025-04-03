ALTER TABLE delivery_receipts
    ADD site_id BIGINT;

ALTER TABLE delivery_receipts
    ADD CONSTRAINT FK_DELIVERY_RECEIPTS_ON_SITE FOREIGN KEY (site_id) REFERENCES sites (id);