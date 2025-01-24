insert into users (username, password, is_enabled) VALUES ('admin', '$2a$12$dRntbLn0U0bM7vFtcsIxb.eBJrGp7htbFJ.pkmRnWkqUwxK1LjW8y', true);

delete from users where username like 'admin';