package com.warehouse.server.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.rest.core.config.Projection;

import java.sql.Timestamp;
import java.util.Collection;

@Entity(name = "quotations")
public class Quotation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToMany(mappedBy = "quotation", cascade = CascadeType.ALL, orphanRemoval = true)
    private Collection<QuoteItem> quoteItems;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    //    users will manually input
    @Column(name = "payment_terms")
    @NotNull
    private String paymentTerms;

    //    users will manually input
    @OneToOne
    @JoinColumn(name = "shipping_address")
    @NotNull
    private Address shippingAddress;

    @Column(name = "quotation_date")
    @NotNull
    private Timestamp quotationDate;

    @OneToOne(mappedBy = "quotation")
    private Receipt receipt;

    @Transient
    private Double totalAmount;

    @PrePersist
    public void addQuotationDate() {
        quotationDate = new Timestamp(System.currentTimeMillis());
    }

    @PostLoad
    public void calculateTotalAmount() {
        this.totalAmount = getQuoteItems().stream().mapToDouble(QuoteItem::getTotalAmount).sum();
    }

    public Long getId() {return id;}

    public void setId(Long id) {this.id = id;}

    public Collection<QuoteItem> getQuoteItems() {return quoteItems;}

    public void setQuoteItems(Collection<QuoteItem> quoteItems) {this.quoteItems = quoteItems;}

    public Customer getCustomer() {return customer;}

    public void setCustomer(Customer customer) {this.customer = customer;}

    public String getPaymentTerms() {return paymentTerms;}

    public void setPaymentTerms(String paymentTerms) {this.paymentTerms = paymentTerms;}

    public Address getShippingAddress() {return shippingAddress;}

    public void setShippingAddress(Address shippingAddress) {this.shippingAddress = shippingAddress;}

    public Timestamp getQuotationDate() {return quotationDate;}

    public void setQuotationDate(Timestamp quotationDate) {this.quotationDate = quotationDate;}

    public Receipt getReceipt() {return receipt;}

    public void setReceipt(Receipt receipt) {this.receipt = receipt;}

    public Double getTotalAmount() {return totalAmount;}

    public void setTotalAmount(Double totalAmount) {this.totalAmount = totalAmount;}

    @Projection(name = "inReceipt", types = {Quotation.class})
    public interface QuotationInReceiptProjection {
        Long getId();

        Customer.CustomerSummaryProjection getCustomer();

        String getPaymentTerms();

        Address getShippingAddress();

        Timestamp getQuotationDate();

        Double getTotalAmount();
    }

    @Projection(name = "table", types = {Quotation.class})
    public interface QuotationTableReceiptProjection extends QuotationInReceiptProjection {
        Receipt getReceipt();
    }
}
