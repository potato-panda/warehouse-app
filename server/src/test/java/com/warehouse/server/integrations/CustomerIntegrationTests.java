package com.warehouse.server.integrations;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.warehouse.server.configs.TestConfig;
import com.warehouse.server.dtos.requests.address.CreateAddressRequestDTO;
import com.warehouse.server.dtos.requests.address.UpdateAddressRequestDTO;
import com.warehouse.server.dtos.requests.contact.CreateContactRequestDTO;
import com.warehouse.server.dtos.requests.contact.UpdateContactRequestDTO;
import com.warehouse.server.dtos.requests.customer.CreateCustomerRequestDTO;
import com.warehouse.server.dtos.requests.customer.UpdateCustomerRequestDTO;
import com.warehouse.server.entities.Address;
import com.warehouse.server.entities.Contact;
import com.warehouse.server.entities.Customer;
import com.warehouse.server.repositories.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@ActiveProfiles("test")
@Import(TestConfig.class)
@AutoConfigureMockMvc
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Transactional
public class CustomerIntegrationTests {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CustomerRepository customerRepository;

    @BeforeEach
    void setup() {
        customerRepository.deleteAll();
    }

    @Test
    @DisplayName("Should create a new customer successfully")
    void shouldCreateCustomerSuccessfully() throws Exception {
        CreateCustomerRequestDTO requestDTO = new CreateCustomerRequestDTO("Test Customer",
                                                                           "123 Test St, City, Country",
                                                                           "www.test.com",
                                                                           "TIN123456",
                                                                           List.of(new CreateAddressRequestDTO(
                                                                                   "456 Shipping St, City, Country")),
                                                                           List.of(new CreateContactRequestDTO(
                                                                                   "John Doe",
                                                                                   "1234567890",
                                                                                   "john@example.com")));

        mockMvc.perform(post("/api/customers/new").contentType(MediaType.APPLICATION_JSON)
                                                  .content(objectMapper.writeValueAsString(requestDTO)))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.id").isNumber())
               .andExpect(jsonPath("$.name").value("Test Customer"))
               .andExpect(jsonPath("$.billingAddress").value("123 Test St, City, Country"))
               .andExpect(jsonPath("$.website").value("www.test.com"))
               .andExpect(jsonPath("$.tin").value("TIN123456"))
               .andExpect(jsonPath("$.contacts[0].name").value("John Doe"))
               .andExpect(jsonPath("$.contacts[0].phone").value("1234567890"))
               .andExpect(jsonPath("$.contacts[0].email").value("john@example.com"))
               .andExpect(jsonPath("$.shippingAddresses[0].fullAddress").value("456 Shipping St, City, Country"));
    }

    @Test
    @DisplayName("Should update an existing customer successfully")
    void shouldUpdateCustomerSuccessfully() throws Exception {
        // Create and save a customer with contacts and addresses
        Customer customer = new Customer();
        customer.setName("Old Name");
        customer.setBillingAddress("Old Billing Address");
        customer.setWebsite("www.oldwebsite.com");
        customer.setTin("OLDTIN123");

        // Create and associate a contact
        Contact contact = new Contact();
        contact.setName("Old Contact Name");
        contact.setPhone("1234567890");
        contact.setEmail("old@example.com");
        contact.setCustomer(customer);

        // Create and associate an address
        Address address = new Address();
        address.setFullAddress("Old Shipping Address");
        address.setCustomer(customer);

        // Set contacts and addresses
        customer.setContacts(new ArrayList<>(List.of(contact)));
        customer.setShippingAddresses(new ArrayList<>(List.of(address)));

        // Save the customer (contacts and addresses will be cascaded if configured correctly)
        customer = customerRepository.save(customer);

        // Retrieve the IDs of the saved contact and address
        Long contactId = customer.getContacts().get(0).getId();
        Long addressId = customer.getShippingAddresses().get(0).getId();

        // Prepare update request
        UpdateCustomerRequestDTO requestDTO = new UpdateCustomerRequestDTO(
                customer.getId(),
                "Updated Customer",
                "Updated Billing Address",
                "www.updated.com",
                "NEW_TIN_456",
                List.of(new UpdateAddressRequestDTO(addressId, "789 Updated Shipping St, City, Country")),
                List.of(new UpdateContactRequestDTO(contactId, "Jane Doe", "0987654321", "jane@example.com"))
        );

        // Perform the update request
        mockMvc.perform(put("/api/customers/update")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(requestDTO)))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.id").value(customer.getId()))
               .andExpect(jsonPath("$.name").value("Updated Customer"))
               .andExpect(jsonPath("$.billingAddress").value("Updated Billing Address"))
               .andExpect(jsonPath("$.website").value("www.updated.com"))
               .andExpect(jsonPath("$.tin").value("NEW_TIN_456"))
               .andExpect(jsonPath("$.contacts[0].id").value(contactId)) // Use the actual contact ID
               .andExpect(jsonPath("$.contacts[0].name").value("Jane Doe"))
               .andExpect(jsonPath("$.contacts[0].phone").value("0987654321"))
               .andExpect(jsonPath("$.contacts[0].email").value("jane@example.com"))
               .andExpect(jsonPath("$.shippingAddresses[0].id").value(addressId)) // Use the actual address ID
               .andExpect(jsonPath("$.shippingAddresses[0].fullAddress").value("789 Updated Shipping St, City, " +
                                                                               "Country"));
    }

    @Test
    @DisplayName("Should update a customer with new contacts and addresses if they do not exist")
    void shouldUpdateCustomerWithNewContactsAndAddresses() throws Exception {
        // Create and save a customer without contacts or addresses
        Customer customer = new Customer();
        customer.setName("Old Name");
        customer.setBillingAddress("Old Billing Address");
        customer.setWebsite("www.oldwebsite.com");
        customer.setTin("OLDTIN123");
        customer = customerRepository.save(customer);

        // Prepare update request with new contacts and addresses
        UpdateCustomerRequestDTO requestDTO = new UpdateCustomerRequestDTO(
                customer.getId(),
                "Updated Customer",
                "Updated Billing Address",
                "www.updated.com",
                "NEW_TIN_456",
                List.of(new UpdateAddressRequestDTO(null, "789 Updated Shipping St, City, Country")), // New address
                List.of(new UpdateContactRequestDTO(null, "Jane Doe", "0987654321", "jane@example.com")) // New contact
        );

        // Perform the update request
        mockMvc.perform(put("/api/customers/update")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(requestDTO)))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.id").value(customer.getId()))
               .andExpect(jsonPath("$.name").value("Updated Customer"))
               .andExpect(jsonPath("$.billingAddress").value("Updated Billing Address"))
               .andExpect(jsonPath("$.website").value("www.updated.com"))
               .andExpect(jsonPath("$.tin").value("NEW_TIN_456"))
               .andExpect(jsonPath("$.contacts[0].id").isNumber()) // New contact ID should be generated
               .andExpect(jsonPath("$.contacts[0].name").value("Jane Doe"))
               .andExpect(jsonPath("$.contacts[0].phone").value("0987654321"))
               .andExpect(jsonPath("$.contacts[0].email").value("jane@example.com"))
               .andExpect(jsonPath("$.shippingAddresses[0].id").isNumber()) // New address ID should be generated
               .andExpect(jsonPath("$.shippingAddresses[0].fullAddress").value("789 Updated Shipping St, City, " +
                                                                               "Country"));
    }

    @Test
    @DisplayName("Should return 400 Bad Request for invalid customer creation")
    void shouldReturnBadRequestForInvalidCustomerCreation() throws Exception {
        CreateCustomerRequestDTO requestDTO = new CreateCustomerRequestDTO("",
                                                                           // Invalid name (empty)
                                                                           "123 Test St, City, Country",
                                                                           "www.test.com",
                                                                           "TIN123456",
                                                                           List.of(new CreateAddressRequestDTO("")),
                                                                           // Invalid address
                                                                           List.of(new CreateContactRequestDTO("",
                                                                                                               "1234567890",
                                                                                                               "invalid-email"))
                                                                           // Invalid contact
        );

        mockMvc.perform(post("/api/customers/new").contentType(MediaType.APPLICATION_JSON)
                                                  .content(objectMapper.writeValueAsString(requestDTO)))
               .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should return 404 Not Found for updating a non-existing customer")
    void shouldReturnNotFoundForUpdatingNonExistingCustomer() throws Exception {
        // Use a non-existent customer ID
        long nonExistentCustomerId = 9999L;

        // Prepare update request with a non-existent customer ID
        UpdateCustomerRequestDTO requestDTO = new UpdateCustomerRequestDTO(
                nonExistentCustomerId, // Non-existent ID
                "Updated Customer",
                "Updated Billing Address",
                "www.updated.com",
                "NEW_TIN_456",
                Collections.emptyList(), // No addresses needed for this test
                Collections.emptyList()  // No contacts needed for this test
        );

        // Perform the update request
        mockMvc.perform(put("/api/customers/update")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(requestDTO)))
               .andExpect(status().isNotFound());
    }
}