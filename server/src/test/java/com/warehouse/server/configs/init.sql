INSERT INTO authorities(authority)
VALUES ('ROLE_ADMIN');
INSERT INTO authorities(authority)
VALUES ('ROLE_USER');

INSERT INTO users(username, password, is_enabled)
VALUES ('admin', '$2a$08$LWyDYhgr3x/YHqHFC2z/NOKjgarC/YEEt79OCQxt8gbLz8Z6GY5a.', true);

INSERT INTO users(username, password, is_enabled)
VALUES ('user', '$2a$08$Xaidj5Ix4OomxBYiG5rVHOkOxsXkBr7xX5tXuTaC8kIZe6hf6Pcje', true);

INSERT INTO user_authorities(authority, username)
VALUES ('ROLE_ADMIN', 'admin');
INSERT INTO user_authorities(authority, username)
VALUES ('ROLE_USER', 'user');