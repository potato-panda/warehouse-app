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
    @Builder.Default
    private Double discountSubtotal = 0.0;

    @Transient
    @Builder.Default
    private Double subtotal = 0.0;

    @Transient
    @Builder.Default
    private Double totalAmount = 0.0;

    @PostLoad
    public void postLoad() {
        this.subtotal         = getQuoteItems().stream().mapToDouble(QuoteItem::getSubtotal).sum();
        this.discountSubtotal = getQuoteItems().stream()
                                               .mapToDouble(item -> item.getSubtotal() * item.getDiscountAmount() / 100.0)
                                               .sum();
        this.totalAmount      = subtotal - discountSubtotal;
    }

    @Projection(name = "detail", types = {PurchaseOrder.class})
    public interface PurchaseOrderDetailProjection extends PurchaseOrderTableProjection {
        List<QuoteItem> getQuoteItems();
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
