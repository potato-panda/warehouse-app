package com.warehouse.server.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.rest.core.config.Projection;

import java.util.ArrayList;
import java.util.Collection;

@Entity(name = "companies")
public class Company {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long                id;

    @NotNull
    private String              name;

    @NotNull
    private String              address;

    @Column(name = "billing_address")
    @NotNull
    private String              billingAddress;

    @OneToMany(mappedBy = "company", cascade = {CascadeType.DETACH, CascadeType.MERGE, CascadeType.PERSIST,
            CascadeType.REFRESH})
    @NotNull
    private Collection<Contact> contacts = new ArrayList<>();

    @NotNull
    private String website;

    @NotNull
    private String tin;

    @OneToMany(mappedBy = "company")
    private Collection<Quotation>     quotations     = new ArrayList<>();

    @OneToMany(mappedBy = "supplier")
    private Collection<PurchaseOrder> purchaseOrders = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getBillingAddress() {
        return billingAddress;
    }

    public void setBillingAddress(String billingAddress) {
        this.billingAddress = billingAddress;
    }

    public Collection<Contact> getContacts() {
        return contacts;
    }

    public void setContacts(Collection<Contact> contact) {
        this.contacts = contact;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getTin() {
        return tin;
    }

    public void setTin(String tin) {
        this.tin = tin;
    }

    public Collection<Quotation> getQuotations() {
        return quotations;
    }

    public void setQuotations(Collection<Quotation> quotation) {
        this.quotations = quotation;
    }

    public Collection<PurchaseOrder> getPurchaseOrders() {
        return purchaseOrders;
    }

    public void setPurchaseOrders(Collection<PurchaseOrder> purchaseOrders) {
        this.purchaseOrders = purchaseOrders;
    }

    @Projection(name = "summary", types = Company.class)
    public interface Summary {
        Long getId();

        String getName();

        String getAddress();

        String getBillingAddress();

        String getWebsite();

        String getTin();
    }

    @Projection(name = "contacts", types = Company.class)
    public interface WithContacts {
        Long getId();

        String getName();

        String getAddress();

        String getBillingAddress();

        Collection<Contact> getContacts();

        String getWebsite();

        String getTin();
    }
}
