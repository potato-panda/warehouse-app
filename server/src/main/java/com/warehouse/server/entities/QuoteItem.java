package com.warehouse.server.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.rest.core.config.Projection;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "quote_items")
public class QuoteItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quotation_id")
    private Quotation quotation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id")
    private PurchaseOrder purchaseOrder;

    @ManyToOne(cascade = {CascadeType.MERGE, CascadeType.REFRESH, CascadeType.DETACH,
            CascadeType.PERSIST})
    @JoinColumn(name = "product_id")
    private Product quotedProduct;

    private Integer quantity;

    @NotNull
    private Double price;

    @Column(name = "discount_amount")
    @NotNull
    private Double discountAmount;

    @Transient
    private Double totalAmount;

    @PostLoad
    public void calculateTotalAmount() {
        this.totalAmount = (getQuantity() * getPrice()) - getDiscountAmount();
    }

    @PreUpdate
    public void blockIfReceiptExists() {
        if (getQuotation() != null && getQuotation().getReceipt() != null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                                              "You can't update this quote item. It is already paid.");
        }
    }

    @Projection(name = "product", types = {QuoteItem.class})
    public interface QuoteItemProductProjection {
        Long getId();

        Product getQuotedProduct();

        Integer getQuantity();

        Double getPrice();

        Double getDiscountAmount();

        Double getTotalAmount();
    }
}
