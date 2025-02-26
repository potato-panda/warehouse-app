package com.warehouse.server.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.rest.core.config.Projection;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "purchase_orders")
public class PurchaseOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @OneToOne
    @JoinColumn(name = "delivery_receipt_id")
    private DeliveryReceipt deliveryReceipt;

    @Column(name = "prepared_by")
    private String preparedBy;

    @Column(name = "checked_by")
    private String checkedBy;

    @Column(name = "approved_by")
    private String approvedBy;

    @Column(name = "received_by")
    private String receivedBy;

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuoteItem> quoteItems;

    @Transient
    private Double totalAmount;

    @PostLoad
    public void calculateTotalAmount() {
        this.totalAmount = getQuoteItems().stream().mapToDouble(QuoteItem::getTotalAmount).sum();
    }

    @Projection(name = "detail", types = {PurchaseOrder.class})
    public interface PurchaseOrderDetailProjection extends PurchaseOrderTableProjection {
        List<QuoteItem> getQuoteItems();

        DeliveryReceipt getDeliveryReceipt();
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
