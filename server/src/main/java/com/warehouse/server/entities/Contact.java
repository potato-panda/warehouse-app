package com.warehouse.server.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.rest.core.config.Projection;

@Entity(name = "contacts")
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

    public Long getId() {return id;}

    public void setId(Long id) {this.id = id;}

    public Supplier getSupplier() {return supplier;}

    public void setSupplier(Supplier supplier) {this.supplier = supplier;}

    public Customer getCustomer() {return customer;}

    public void setCustomer(Customer customer) {this.customer = customer;}

    public String getName() {return name;}

    public void setName(String name) {this.name = name;}

    public String getPhone() {return phone;}

    public void setPhone(String phone) {this.phone = phone;}

    public String getEmail() {return email;}

    public void setEmail(String email) {this.email = email;}

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
