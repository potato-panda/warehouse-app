package com.warehouse.server.entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.rest.core.config.Projection;

import java.util.ArrayList;
import java.util.List;

@Entity(name = "supplier")
public class Supplier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private String name;

    @OneToMany(mappedBy = "supplier", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Address> addresses = new ArrayList<>();

    @OneToMany(mappedBy = "supplier", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Contact> contacts = new ArrayList<>();

    @OneToMany(mappedBy = "supplier", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurchaseOrder> purchaseOrders = new ArrayList<>();

    public Long getId() {return id;}

    public void setId(Long id) {this.id = id;}

    public String getName() {return name;}

    public void setName(String name) {this.name = name;}

    public List<Address> getAddresses() {return addresses;}

    public void setAddresses(List<Address> addresses) {this.addresses = addresses;}

    public List<Contact> getContacts() {return contacts;}

    public void setContacts(List<Contact> contact) {this.contacts = contact;}

    public List<PurchaseOrder> getPurchaseOrders() {return purchaseOrders;}

    public void setPurchaseOrders(List<PurchaseOrder> purchaseOrders) {this.purchaseOrders = purchaseOrders;}

    @Projection(name = "detail", types = {Supplier.class})
    public interface SupplierDetailProjection {
        Long getId();

        String getName();

        List<Address> getAddresses();

        List<Contact> getContacts();
    }
}
