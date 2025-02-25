package com.warehouse.server.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.rest.core.config.Projection;

import java.sql.Timestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "receipts")
public class Receipt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(cascade = {CascadeType.DETACH, CascadeType.MERGE, CascadeType.REFRESH, CascadeType.PERSIST})
    @JoinColumn(name = "quotation_id")
    private Quotation quotation;

    @Column(name = "received_date")
    @NotNull
    private Timestamp receivedDate;

    @Column(name = "received_by")
    @NotNull
    private String receivedBy;

    @Projection(name = "withQuotation", types = {Receipt.class})
    public interface ReceiptWithQuotationProjection {
        Long getId();

        Quotation.QuotationInReceiptProjection getQuotation();

        Timestamp getReceivedDate();

        String getReceivedBy();
    }
}
