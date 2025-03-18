CREATE TABLE addresses
(
    id           BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    full_address VARCHAR(255),
    supplier_id  BIGINT,
    site_id      BIGINT,
    customer_id  BIGINT,
    CONSTRAINT pk_addresses PRIMARY KEY (id)
);

CREATE TABLE authorities
(
    authority VARCHAR(255) NOT NULL,
    CONSTRAINT pk_authorities PRIMARY KEY (authority)
);

CREATE TABLE contacts
(
    id          BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    supplier_id BIGINT,
    customer_id BIGINT,
    name        VARCHAR(255)                            NOT NULL,
    phone       VARCHAR(255)                            NOT NULL,
    email       VARCHAR(255),
    CONSTRAINT pk_contacts PRIMARY KEY (id)
);

CREATE TABLE customers
(
    id              BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    name            VARCHAR(255)                            NOT NULL,
    billing_address VARCHAR(255)                            NOT NULL,
    website         VARCHAR(255)                            NOT NULL,
    tin             VARCHAR(255)                            NOT NULL,
    CONSTRAINT pk_customers PRIMARY KEY (id)
);

CREATE TABLE delivery_receipts
(
    id               BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    received_date    TIMESTAMP WITHOUT TIME ZONE,
    received_by      VARCHAR(255),
    payment_due_date TIMESTAMP WITHOUT TIME ZONE,
    cheque_number    VARCHAR(255),
    CONSTRAINT pk_delivery_receipts PRIMARY KEY (id)
);

CREATE TABLE inventories
(
    id         BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    product_id BIGINT,
    site_id    BIGINT,
    quantity   INTEGER                                 NOT NULL,
    CONSTRAINT pk_inventories PRIMARY KEY (id)
);

CREATE TABLE products
(
    id          BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    sku         VARCHAR(255)                            NOT NULL,
    item_code   VARCHAR(255)                            NOT NULL,
    name        VARCHAR(255)                            NOT NULL,
    description VARCHAR(255)                            NOT NULL,
    um          VARCHAR(255)                            NOT NULL,
    CONSTRAINT pk_products PRIMARY KEY (id)
);

CREATE TABLE purchase_orders
(
    id          BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    supplier_id BIGINT,
    prepared_by VARCHAR(255),
    checked_by  VARCHAR(255),
    approved_by VARCHAR(255),
    received_by VARCHAR(255),
    CONSTRAINT pk_purchase_orders PRIMARY KEY (id)
);

CREATE TABLE quotations
(
    id                  BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    delivery_receipt_id BIGINT,
    customer_id         BIGINT,
    payment_terms       VARCHAR(255)                            NOT NULL,
    shipping_address    VARCHAR(255)                            NOT NULL,
    quotation_date      TIMESTAMP WITHOUT TIME ZONE,
    vat_inclusive       BOOLEAN                                 NOT NULL,
    delivery_charge     DOUBLE PRECISION                        NOT NULL,
    CONSTRAINT pk_quotations PRIMARY KEY (id)
);

CREATE TABLE quote_items
(
    id                BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    quotation_id      BIGINT,
    purchase_order_id BIGINT,
    product_id        BIGINT,
    quantity          INTEGER,
    price             DOUBLE PRECISION                        NOT NULL,
    discount_amount   DOUBLE PRECISION                        NOT NULL,
    CONSTRAINT pk_quote_items PRIMARY KEY (id)
);

CREATE TABLE refresh_tokens
(
    id          BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    revoked     BOOLEAN,
    user_id     VARCHAR(255)                            NOT NULL,
    token       VARCHAR(255)                            NOT NULL,
    expiry_date TIMESTAMP WITHOUT TIME ZONE             NOT NULL,
    CONSTRAINT pk_refresh_tokens PRIMARY KEY (id)
);

CREATE TABLE settings
(
    id            BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    name          VARCHAR(255)                            NOT NULL,
    setting_key   VARCHAR(255)                            NOT NULL,
    setting_value VARCHAR(255),
    admin         BOOLEAN                                 NOT NULL,
    CONSTRAINT pk_settings PRIMARY KEY (id)
);

CREATE TABLE sites
(
    id         BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    name       VARCHAR(255),
    address_id BIGINT,
    CONSTRAINT pk_sites PRIMARY KEY (id)
);

CREATE TABLE sites_inventory
(
    site_id      BIGINT NOT NULL,
    inventory_id BIGINT NOT NULL
);

CREATE TABLE suppliers
(
    id   BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    name VARCHAR(255)                            NOT NULL,
    CONSTRAINT pk_suppliers PRIMARY KEY (id)
);

CREATE TABLE user_authorities
(
    authority VARCHAR(255) NOT NULL,
    username  VARCHAR(255) NOT NULL
);

CREATE TABLE users
(
    username   VARCHAR(255) NOT NULL,
    password   VARCHAR(255) NOT NULL,
    is_enabled BOOLEAN,
    CONSTRAINT pk_users PRIMARY KEY (username)
);

ALTER TABLE addresses
    ADD CONSTRAINT uc_addresses_site UNIQUE (site_id);

ALTER TABLE customers
    ADD CONSTRAINT uc_customers_tin UNIQUE (tin);

ALTER TABLE products
    ADD CONSTRAINT uc_products_item_code UNIQUE (item_code);

ALTER TABLE quotations
    ADD CONSTRAINT uc_quotations_delivery_receipt UNIQUE (delivery_receipt_id);

ALTER TABLE refresh_tokens
    ADD CONSTRAINT uc_refresh_tokens_token UNIQUE (token);

ALTER TABLE settings
    ADD CONSTRAINT uc_settings_name UNIQUE (name);

ALTER TABLE settings
    ADD CONSTRAINT uc_settings_setting_key UNIQUE (setting_key);

ALTER TABLE sites
    ADD CONSTRAINT uc_sites_address UNIQUE (address_id);

ALTER TABLE sites_inventory
    ADD CONSTRAINT uc_sites_inventory_inventory UNIQUE (inventory_id);

ALTER TABLE addresses
    ADD CONSTRAINT FK_ADDRESSES_ON_CUSTOMER FOREIGN KEY (customer_id) REFERENCES customers (id);

ALTER TABLE addresses
    ADD CONSTRAINT FK_ADDRESSES_ON_SITE FOREIGN KEY (site_id) REFERENCES sites (id);

ALTER TABLE addresses
    ADD CONSTRAINT FK_ADDRESSES_ON_SUPPLIER FOREIGN KEY (supplier_id) REFERENCES suppliers (id);

ALTER TABLE contacts
    ADD CONSTRAINT FK_CONTACTS_ON_CUSTOMER FOREIGN KEY (customer_id) REFERENCES customers (id);

ALTER TABLE contacts
    ADD CONSTRAINT FK_CONTACTS_ON_SUPPLIER FOREIGN KEY (supplier_id) REFERENCES suppliers (id);

ALTER TABLE inventories
    ADD CONSTRAINT FK_INVENTORIES_ON_PRODUCT FOREIGN KEY (product_id) REFERENCES products (id);

ALTER TABLE inventories
    ADD CONSTRAINT FK_INVENTORIES_ON_SITE FOREIGN KEY (site_id) REFERENCES sites (id);

ALTER TABLE purchase_orders
    ADD CONSTRAINT FK_PURCHASE_ORDERS_ON_SUPPLIER FOREIGN KEY (supplier_id) REFERENCES suppliers (id);

ALTER TABLE quotations
    ADD CONSTRAINT FK_QUOTATIONS_ON_CUSTOMER FOREIGN KEY (customer_id) REFERENCES customers (id);

ALTER TABLE quotations
    ADD CONSTRAINT FK_QUOTATIONS_ON_DELIVERY_RECEIPT FOREIGN KEY (delivery_receipt_id) REFERENCES delivery_receipts (id);

ALTER TABLE quote_items
    ADD CONSTRAINT FK_QUOTE_ITEMS_ON_PRODUCT FOREIGN KEY (product_id) REFERENCES products (id);

ALTER TABLE quote_items
    ADD CONSTRAINT FK_QUOTE_ITEMS_ON_PURCHASE_ORDER FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders (id);

ALTER TABLE quote_items
    ADD CONSTRAINT FK_QUOTE_ITEMS_ON_QUOTATION FOREIGN KEY (quotation_id) REFERENCES quotations (id);

ALTER TABLE refresh_tokens
    ADD CONSTRAINT FK_REFRESH_TOKENS_ON_USER FOREIGN KEY (user_id) REFERENCES users (username);

ALTER TABLE sites
    ADD CONSTRAINT FK_SITES_ON_ADDRESS FOREIGN KEY (address_id) REFERENCES addresses (id);

ALTER TABLE sites_inventory
    ADD CONSTRAINT fk_sitinv_on_inventory FOREIGN KEY (inventory_id) REFERENCES inventories (id);

ALTER TABLE sites_inventory
    ADD CONSTRAINT fk_sitinv_on_site FOREIGN KEY (site_id) REFERENCES sites (id);

ALTER TABLE user_authorities
    ADD CONSTRAINT fk_useaut_on_authority FOREIGN KEY (authority) REFERENCES authorities (authority);

ALTER TABLE user_authorities
    ADD CONSTRAINT fk_useaut_on_user FOREIGN KEY (username) REFERENCES users (username);

ALTER TABLE delivery_receipts
    ALTER COLUMN received_by DROP NOT NULL;

ALTER TABLE delivery_receipts
    ALTER COLUMN received_date DROP NOT NULL;