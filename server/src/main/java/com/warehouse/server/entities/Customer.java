package com.warehouse.server.entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.rest.core.config.Projection;

import java.util.ArrayList;
import java.util.List;

@Entity(name = "customers")
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
    @JsonManagedReference
    private List<Address> shippingAddresses = new ArrayList<>();

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Contact> contacts = new ArrayList<>();

    @NotNull
    private String website;

    @NotNull
    @Column(unique = true)
    private String tin;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Quotation> quotations = new ArrayList<>();

    public Long getId() {return id;}

    public void setId(Long id) {this.id = id;}

    public String getName() {return name;}

    public void setName(String name) {this.name = name;}

    public String getBillingAddress() {return billingAddress;}

    public void setBillingAddress(String billingAddress) {this.billingAddress = billingAddress;}

    public List<Address> getShippingAddresses() {return shippingAddresses;}

    public void setShippingAddresses(List<Address> shippingAddresses) {this.shippingAddresses = shippingAddresses;}

    public List<Contact> getContacts() {return contacts;}

    public void setContacts(List<Contact> contacts) {this.contacts = contacts;}

    public String getWebsite() {return website;}

    public void setWebsite(String website) {this.website = website;}

    public String getTin() {return tin;}

    public void setTin(String tin) {this.tin = tin;}

    public List<Quotation> getQuotations() {return quotations;}

    public void setQuotations(List<Quotation> quotations) {this.quotations = quotations;}

    @Projection(name = "detail", types = {Customer.class})
    public interface CustomerDetailProjection extends CustomerSummaryProjection {
        List<Address> getShippingAddresses();

        List<Contact> getContacts();
    }

    @Projection(name = "summary", types = {Customer.class})
    public interface CustomerSummaryProjection {
        Long getId();

        String getName();

        String getAddress();

        String getBillingAddress();

        String getWebsite();

        String getTin();
    }

    @Projection(name = "contacts", types = {Customer.class})
    public interface CustomerWithContactsProjection extends CustomerSummaryProjection {
        List<Contact> getContacts();
    }
}
