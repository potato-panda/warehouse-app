package com.warehouse.server.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.rest.core.config.Projection;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "contacts")
public class Contact {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    @JsonBackReference
    private Supplier supplier;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    @JsonBackReference
    private Customer customer;

    @NotNull
    private String name;

    @NotNull
    private String phone;

    @Email
    private String email;

    @Projection(name = "basic", types = {Contact.class})
    public interface ContactBasicProjection {
        Long getId();

        String getName();

        String getPhone();

        String getEmail();
    }

    @Projection(name = "detail", types = {Contact.class})
    public interface ContactDetailProjection extends ContactBasicProjection {
        Customer getCustomer();

        Supplier getSupplier();
    }
}
