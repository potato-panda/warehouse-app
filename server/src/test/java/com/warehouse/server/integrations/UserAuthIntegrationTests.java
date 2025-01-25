package com.warehouse.server.integrations;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.warehouse.server.configs.TestConfig;
import com.warehouse.server.dtos.requests.LoginRequest;
import com.warehouse.server.dtos.responses.CurrentUserResponse;
import com.warehouse.server.dtos.responses.LoginResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@ActiveProfiles("test")
@Import(TestConfig.class)
@AutoConfigureMockMvc
public class UserAuthIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @BeforeEach
    public void setUp() {
    }

    @Test
    public void testLogin() throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        var          loginJson    = objectMapper.writeValueAsString(new LoginRequest("admin", "admin"));

        MvcResult result = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                                                                  .content(loginJson))
                                  .andExpect(MockMvcResultMatchers.status().isOk())
                                  .andReturn();
        var response     = result.getResponse();
        var refreshToken = response.getCookie("refreshToken");
        assert (refreshToken != null);
        LoginResponse parsedResponse = objectMapper.readValue(response.getContentAsString(), LoginResponse.class);
        assert (parsedResponse.username().equals("admin"));
    }

    @Test
    public void testAuthenticatedEndpoint() throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        var          loginJson    = objectMapper.writeValueAsString(new LoginRequest("admin", "admin"));

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                                                                       .content(loginJson))
                                       .andExpect(MockMvcResultMatchers.status().isOk())
                                       .andReturn();

        var loginResultResponse = loginResult.getResponse();
        var refreshToken        = loginResultResponse.getCookie("refreshToken");
        assert (refreshToken != null);
        LoginResponse parsedResponse = objectMapper.readValue(loginResultResponse.getContentAsString(),
                                                              LoginResponse.class);
        assert (parsedResponse.username().equals("admin"));

        var authHeader = new HttpHeaders();
        authHeader.put("Authorization", List.of("Bearer %s".formatted(parsedResponse.accessToken())));

        MvcResult authenticatedResult =
                mockMvc.perform(get("/api/auth/current-user").contentType(MediaType.APPLICATION_JSON)
                                                                                     .headers(authHeader))
                                               .andExpect(MockMvcResultMatchers.status().isOk())
                                               .andReturn();

        var authenticatedResultResponse = authenticatedResult.getResponse();
        CurrentUserResponse currentUserResponse = objectMapper.readValue(authenticatedResultResponse.getContentAsString(), CurrentUserResponse.class);
        assert (currentUserResponse.username().equals("admin"));

    }
}
