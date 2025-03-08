package com.warehouse.server.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.rest.core.config.Projection;

import java.sql.Timestamp;
import java.util.ArrayList;
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
    @Builder.Default
    private Collection<QuoteItem> quoteItems = new ArrayList<>();

    @OneToOne
    @JoinColumn(name = "delivery_receipt_id")
    private DeliveryReceipt deliveryReceipt;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    //    users will manually input
    @Column(name = "payment_terms")
    @NotNull
    private String paymentTerms;

    @NotNull
    private String shippingAddress;

    @Column(name = "quotation_date")
    @Builder.Default
    private Timestamp quotationDate = new Timestamp(System.currentTimeMillis());

    @Column(name = "vat_inclusive")
    @NotNull
    @Builder.Default
    private Boolean vatInclusive = true;

    @Column(name = "delivery_charge")
    @NotNull
    @Builder.Default
    private Double deliveryCharge = 0.0;

    @Transient
    @Builder.Default
    private Double deliverySubtotal = 0.0;

    @Transient
    @Builder.Default
    private Double discountSubtotal = 0.0;

    @Transient
    @Builder.Default
    private Double subtotal = 0.0;

    @Transient
    @Builder.Default
    private Double totalAmount = 0.0;

    @PrePersist
    public void prePersist() {
        // Update quotation modified date
        quotationDate = new Timestamp(System.currentTimeMillis());
    }

    @PostLoad
    public void postLoad() {
        this.deliverySubtotal = getDeliveryCharge();
        this.subtotal         = getQuoteItems().stream().mapToDouble(QuoteItem::getSubtotal).sum();
        this.discountSubtotal = getQuoteItems().stream()
                                               .mapToDouble(item -> item.getSubtotal() * item.getDiscountAmount() / 100.0)
                                               .sum();
        this.totalAmount      = subtotal - discountSubtotal + deliverySubtotal;
    }

    @Projection(name = "detail", types = {Quotation.class})
    public interface QuotationDetailProjection extends QuotationTableReceiptProjection {
        DeliveryReceipt getDeliveryReceipt();

        Boolean getVatInclusive();

        Double getDeliveryCharge();

        Double getDeliverySubtotal();

        Double getDiscountSubtotal();

        Double getSubtotal();
    }

    @Projection(name = "table", types = {Quotation.class})
    public interface QuotationTableReceiptProjection {
        Long getId();

        Customer.CustomerSummaryProjection getCustomer();

        String getPaymentTerms();

        String getShippingAddress();

        Timestamp getQuotationDate();

        Double getTotalAmount();
    }
}
