package com.warehouse.server.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.util.Collection;

@Entity(name = "companies")
public class Company {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private String name;

    @NotNull
    private String address;

    @Column(name = "billing_address")
    @NotNull
    private String billingAddress;

    @OneToMany(mappedBy = "company")
    @NotNull
    private Collection<Contact> contact;

    @NotNull
    private String website;

    @NotNull
    private String tin;

    @OneToMany(mappedBy = "company")
    private Collection<Quotation> quotation;

    @OneToMany(mappedBy = "supplier")
    private Collection<PurchaseOrder> purchaseOrders;

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

    public Collection<Contact> getContact() {
        return contact;
    }

    public void setContact(Collection<Contact> contact) {
        this.contact = contact;
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

    public Collection<Quotation> getQuotation() {
        return quotation;
    }

    public void setQuotation(Collection<Quotation> quotation) {
        this.quotation = quotation;
    }

    public Collection<PurchaseOrder> getPurchaseOrders() {
        return purchaseOrders;
    }

    public void setPurchaseOrders(Collection<PurchaseOrder> purchaseOrders) {
        this.purchaseOrders = purchaseOrders;
    }
}
