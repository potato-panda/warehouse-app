package com.warehouse.server.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import org.springframework.data.rest.core.config.Projection;

@Entity
@Table(name = "addresses")
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "full_address")
    String fullAddress;

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    @JsonBackReference
    Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    @JsonBackReference
    Customer customer;

    public Long getId() {return id;}

    public void setId(Long id) {this.id = id;}

    public String getFullAddress() {return fullAddress;}

    public void setFullAddress(String fullAddress) {this.fullAddress = fullAddress;}

    public Supplier getSupplier() {return supplier;}

    public void setSupplier(Supplier supplier) {this.supplier = supplier;}

    public Customer getCustomer() {return customer;}

    public void setCustomer(Customer customer) {this.customer = customer;}

    @Projection(name = "basic", types = {Address.class})
    public interface AddressBasicProjection {
        Long getId();

        String getFullAddress();
    }

    @Projection(name = "detail", types = {Address.class})
    public interface AddressDetailProjection extends AddressBasicProjection {
        Customer getCustomer();

        Supplier getSupplier();
    }
}
