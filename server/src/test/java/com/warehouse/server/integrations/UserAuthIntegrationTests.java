package com.warehouse.server.integrations;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.warehouse.server.configs.TestConfig;
import com.warehouse.server.dtos.requests.LoginRequest;
import com.warehouse.server.dtos.responses.LoginResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@ActiveProfiles("test")
@Import(TestConfig.class)
@AutoConfigureMockMvc
public class UserAuthIntegrationTests {
    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testLogin() throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        var          loginJson    = objectMapper.writeValueAsString(new LoginRequest("admin", "admin"));

        MvcResult result = mockMvc.perform(
                                          post("/api/auth/login")
                                                  .contentType(MediaType.APPLICATION_JSON)
                                                  .content(loginJson)
                                          )
                                  .andExpect(MockMvcResultMatchers.status().isOk())
                                  .andReturn();
        var response     = result.getResponse();
        var refreshToken = response.getCookie("refreshToken");
        assert (refreshToken != null);
        LoginResponse parsedResponse = objectMapper.readValue(response.getContentAsString(), LoginResponse.class);
        assert (parsedResponse.username().equals("admin"));
    }
}
