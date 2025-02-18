package com.warehouse.server.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.rest.core.config.Projection;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Entity(name = "quote_item")
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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Quotation getQuotation() {
        return quotation;
    }

    public void setQuotation(Quotation quotation) {
        this.quotation = quotation;
    }

    public PurchaseOrder getPurchaseOrder() {
        return purchaseOrder;
    }

    public void setPurchaseOrder(PurchaseOrder purchaseOrder) {
        this.purchaseOrder = purchaseOrder;
    }

    public Product getQuotedProduct() {
        return quotedProduct;
    }

    public void setQuotedProduct(Product quotedProduct) {
        this.quotedProduct = quotedProduct;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Double getPrice() {return price;}

    public void setPrice(Double price) {this.price = price;}

    public Double getDiscountAmount() {return discountAmount;}

    public void setDiscountAmount(Double discountAmount) {this.discountAmount = discountAmount;}

    public Double getTotalAmount() {return totalAmount;}

    public void setTotalAmount(Double totalAmount) {this.totalAmount = totalAmount;}

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
