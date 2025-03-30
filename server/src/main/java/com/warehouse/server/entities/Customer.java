package com.warehouse.server.entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.rest.core.config.Projection;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "customers")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private String name;

    @Column(name = "billing_address")
    @NotNull
    private String billingAddress;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @JsonManagedReference
    private List<Address> shippingAddresses = new ArrayList<>();

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @JsonManagedReference
    private List<Contact> contacts = new ArrayList<>();

    @NotNull
    private String website;

    @NotNull
    private String tin;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Quotation> quotations = new ArrayList<>();

    @Projection(name = "detail", types = {Customer.class})
    public interface CustomerDetailProjection extends CustomerSummaryProjection {
        List<Address> getShippingAddresses();

        List<Contact> getContacts();
    }

    @Projection(name = "summary", types = {Customer.class})
    public interface CustomerSummaryProjection {
        Long getId();

        String getName();

        String getBillingAddress();

        String getWebsite();

        String getTin();
    }

    @Projection(name = "contacts", types = {Customer.class})
    public interface CustomerWithContactsProjection extends CustomerSummaryProjection {
        List<Contact> getContacts();
    }
}
