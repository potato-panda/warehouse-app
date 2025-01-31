package com.warehouse.server.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.sql.Timestamp;

@Entity(name = "receipts")
public class Receipt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "quotation_id")
    private Quotation quotation;

    @Column(name = "received_date")
    @NotNull
    private Timestamp receivedDate;

    @Column(name = "received_by")
    @NotNull
    private Timestamp receivedBy;

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

    public Timestamp getReceivedBy() {
        return receivedBy;
    }

    public void setReceivedBy(Timestamp receivedBy) {
        this.receivedBy = receivedBy;
    }
}
