package com.warehouse.server.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.rest.core.config.Projection;

import java.sql.Timestamp;
import java.util.Collection;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "quotations")
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
    }
}
