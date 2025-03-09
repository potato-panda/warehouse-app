package com.warehouse.server.configs;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.test.context.jdbc.Sql;

import static org.springframework.test.context.jdbc.Sql.ExecutionPhase.BEFORE_TEST_METHOD;

@TestConfiguration
@Sql(scripts = {"init.sql"}, executionPhase = BEFORE_TEST_METHOD)
public class TestConfig {

}
