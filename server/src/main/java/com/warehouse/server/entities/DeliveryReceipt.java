package com.warehouse.server.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.rest.core.config.Projection;
import org.springframework.lang.Nullable;

import java.sql.Timestamp;
import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "delivery_receipts")
public class DeliveryReceipt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(mappedBy = "deliveryReceipt", cascade = {CascadeType.DETACH, CascadeType.MERGE, CascadeType.REFRESH,
            CascadeType.PERSIST})
    private Quotation quotation;

    @Column(name = "received_date")
    @Nullable
    private Timestamp receivedDate;

    @Column(name = "received_by")
    @Nullable
    private String receivedBy;

    @Column(name = "payment_due_date")
    @Nullable
    private ZonedDateTime paymentDueDate;

    @Column(name = "cheque_number")
    @Nullable
    private String chequeNumber;

    @Column(name = "po")
    @Nullable
    private String po;

    @Projection(name = "brief", types = {DeliveryReceipt.class})
    public interface BriefProjection {
        Long getId();

        String getPo();

        Timestamp getReceivedDate();

        String getReceivedBy();

    }

    @Projection(name = "payment", types = {DeliveryReceipt.class})
    public interface PaymentProjection extends BriefProjection {
        ZonedDateTime getPaymentDueDate();

        String getChequeNumber();
    }

    @Projection(name = "withQuotation", types = {DeliveryReceipt.class})
    public interface WithQuotationProjection extends BriefProjection {
        Quotation.QuotationTableReceiptProjection getQuotation();
    }
}
