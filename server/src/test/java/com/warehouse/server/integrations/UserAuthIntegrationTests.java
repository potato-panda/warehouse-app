package com.warehouse.server.integrations;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.warehouse.server.configs.TestConfig;
import com.warehouse.server.dtos.requests.auth.ChangePasswordRequestDTO;
import com.warehouse.server.dtos.requests.auth.LoginRequestDTO;
import com.warehouse.server.dtos.responses.auth.CurrentUserResponseDTO;
import com.warehouse.server.dtos.responses.auth.LoginResponseDTO;
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
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@ActiveProfiles("test")
@Import(TestConfig.class)
@AutoConfigureMockMvc
@Transactional
public class UserAuthIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testLogin() throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        var          loginJson    = objectMapper.writeValueAsString(new LoginRequestDTO("admin", "admin"));

        MvcResult result = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                                                                  .content(loginJson))
                                  .andExpect(MockMvcResultMatchers.status().isOk())
                                  .andReturn();
        var response     = result.getResponse();
        var refreshToken = response.getCookie("refreshToken");

        assertThat(refreshToken).isNotNull();

        LoginResponseDTO parsedResponse = objectMapper.readValue(response.getContentAsString(), LoginResponseDTO.class);

        assertThat(parsedResponse.username()).isEqualTo("admin");
    }

    @Test
    public void testAuthenticatedEndpoint() throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        var          loginJson    = objectMapper.writeValueAsString(new LoginRequestDTO("admin", "admin"));

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                                                                       .content(loginJson))
                                       .andExpect(MockMvcResultMatchers.status().isOk())
                                       .andReturn();

        var loginResultResponse = loginResult.getResponse();
        var refreshToken        = loginResultResponse.getCookie("refreshToken");

        assertThat(refreshToken).isNotNull();

        LoginResponseDTO parsedResponse = objectMapper.readValue(loginResultResponse.getContentAsString(),
                                                                 LoginResponseDTO.class);

        assertThat(parsedResponse.username()).isEqualTo("admin");

        var authHeader = new HttpHeaders();
        authHeader.put("Authorization", List.of("Bearer %s".formatted(parsedResponse.accessToken())));

        MvcResult authenticatedResult =
                mockMvc.perform(get("/api/auth/current-user").contentType(MediaType.APPLICATION_JSON)
                                                             .headers(authHeader))
                       .andExpect(MockMvcResultMatchers.status().isOk())
                       .andReturn();

        var authenticatedResultResponse = authenticatedResult.getResponse();
        CurrentUserResponseDTO currentUserResponseDTO =
                objectMapper.readValue(authenticatedResultResponse.getContentAsString(),
                                       CurrentUserResponseDTO.class);

        assertThat(currentUserResponseDTO.username()).isEqualTo("admin");

    }

    @Test
    public void testAuthenticatedEndpointFailing() throws Exception {
        var authHeader = new HttpHeaders();
        authHeader.put("Authorization", List.of("Bearer ABC"));

        mockMvc.perform(get("/api/auth/current-user").contentType(MediaType.APPLICATION_JSON)
                                                     .headers(authHeader))
               .andExpect(MockMvcResultMatchers.status().is4xxClientError())
               .andReturn();

    }

    @Test
    public void testChangePasswords() throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        var          loginJson    = objectMapper.writeValueAsString(new LoginRequestDTO("admin", "admin"));

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                                                                       .content(loginJson))
                                       .andExpect(MockMvcResultMatchers.status().isOk())
                                       .andReturn();

        var loginResultResponse = loginResult.getResponse();
        var refreshToken        = loginResultResponse.getCookie("refreshToken");

        assertThat(refreshToken).isNotNull();

        LoginResponseDTO parsedResponse = objectMapper.readValue(loginResultResponse.getContentAsString(),
                                                                 LoginResponseDTO.class);

        assertThat(parsedResponse.username()).isEqualTo("admin");

        Thread.sleep(1000);

        var changePasswordJson = objectMapper.writeValueAsString(new ChangePasswordRequestDTO("admin",
                                                                                              "superadmin",
                                                                                              "superadmin"));
        var authHeader = new HttpHeaders();
        authHeader.put("Authorization", List.of("Bearer %s".formatted(parsedResponse.accessToken())));

        MvcResult changePasswordResult = mockMvc.perform(post("/api/auth/change-password")
                                                                 .contentType(MediaType.APPLICATION_JSON)
                                                                 .headers(authHeader)
                                                                 .content(changePasswordJson))
                                                .andExpect(MockMvcResultMatchers.status().isOk())
                                                .andReturn();

        var changePasswordResultResponse = changePasswordResult.getResponse();
        var newRefreshToken              = changePasswordResultResponse.getCookie("refreshToken");

        assertThat(newRefreshToken).isNotNull();
        assertThat(newRefreshToken).isNotEqualTo(refreshToken);
    }
}
