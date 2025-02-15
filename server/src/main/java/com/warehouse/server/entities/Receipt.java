package com.warehouse.server.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.rest.core.config.Projection;

import java.sql.Timestamp;

@Entity(name = "receipts")
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

    public Timestamp getReceivedDate() {
        return receivedDate;
    }

    public void setReceivedDate(Timestamp receivedDate) {
        this.receivedDate = receivedDate;
    }

    public String getReceivedBy() {
        return receivedBy;
    }

    public void setReceivedBy(String receivedBy) {
        this.receivedBy = receivedBy;
    }

    @Projection(name = "withQuotation", types = {Receipt.class})
    public interface ReceiptWithQuotationProjection {
        Long getId();

        Quotation.QuotationInReceiptProjection getQuotation();

        Timestamp getReceivedDate();

        String getReceivedBy();
    }
}
