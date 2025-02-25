package com.warehouse.server.entities;

import jakarta.persistence.*;
import org.springframework.data.rest.core.config.Projection;

import java.util.Collection;

@Entity(name = "purchase_orders")
public class PurchaseOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(name = "prepared_by")
    private String preparedBy;

    @Column(name = "checked_by")
    private String checkedBy;

    @Column(name = "approved_by")
    private String approvedBy;

    @Column(name = "received_by")
    private String receivedBy;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "purchaseOrder", orphanRemoval = true)
    private Collection<QuoteItem> quoteItems;

    @Transient
    private Double totalAmount;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Supplier getSupplier() {
        return supplier;
    }

    public void setSupplier(Supplier supplier) {
        this.supplier = supplier;
    }

    public String getPreparedBy() {
        return preparedBy;
    }

    public void setPreparedBy(String preparedBy) {
        this.preparedBy = preparedBy;
    }

    public String getCheckedBy() {
        return checkedBy;
    }

    public void setCheckedBy(String checkedBy) {
        this.checkedBy = checkedBy;
    }

    public String getApprovedBy() {
        return approvedBy;
    }

    public void setApprovedBy(String approvedBy) {
        this.approvedBy = approvedBy;
    }

    public String getReceivedBy() {
        return receivedBy;
    }

    public void setReceivedBy(String receivedBy) {
        this.receivedBy = receivedBy;
    }

    public Collection<QuoteItem> getQuoteItems() {
        return quoteItems;
    }

    public void setQuoteItems(Collection<QuoteItem> quoteItems) {
        this.quoteItems = quoteItems;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    @PostLoad
    public void calculateTotalAmount() {
        this.totalAmount = getQuoteItems().stream().mapToDouble(QuoteItem::getTotalAmount).sum();
    }

    @Projection(name = "detail", types = {PurchaseOrder.class})
    public interface PurchaseOrderDetailProjection extends PurchaseOrderTableProjection {
        Collection<QuoteItem> getQuoteItems();
    }

    @Projection(name = "table", types = {PurchaseOrder.class})
    public interface PurchaseOrderTableProjection {
        Long getId();

        Supplier getSupplier();

        String getPreparedBy();

        String getCheckedBy();

        String getApprovedBy();

        String getReceivedBy();

        Double getTotalAmount();
    }
}
