package com.warehouse.server.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.sql.Timestamp;
import java.util.Collection;

@Entity(name = "quotations")
public class Quotation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToMany(mappedBy = "quotation",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private Collection<QuoteItem> quoteItems;

    @ManyToOne
    @JoinColumn(name = "company_id", referencedColumnName = "id")
    private Company company;

    //    users will manually input
    @Column(name = "payment_terms")
    @NotNull
    private String paymentTerms;

    //    users will manually input
    @Column(name = "shipping_address")
    @NotNull
    private String shippingAddress;

    @Column(name = "quotation_date")
    @NotNull
    private Timestamp quotationDate;

    @OneToOne(mappedBy = "quotation")
    @JoinColumn(name = "quotation_id", referencedColumnName = "id")
    private Receipt receipt;

    @Column(name = "total_amount")
    private Double totalAmount;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Collection<QuoteItem> getQuoteItems() {
        return quoteItems;
    }

    public void setQuoteItems(Collection<QuoteItem> quoteItems) {
        this.quoteItems = quoteItems;
    }

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public String getPaymentTerms() {
        return paymentTerms;
    }

    public void setPaymentTerms(String paymentTerms) {
        this.paymentTerms = paymentTerms;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public Timestamp getQuotationDate() {
        return quotationDate;
    }

    public void setQuotationDate(Timestamp quotationDate) {
        this.quotationDate = quotationDate;
    }

    public Receipt getReceipt() {
        return receipt;
    }

    public void setReceipt(Receipt receipt) {
        this.receipt = receipt;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }
}
