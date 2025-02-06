package com.warehouse.server.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.util.Collection;

@Entity(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToMany(mappedBy = "product")
    private Collection<Inventory> inventory;

    @NotNull
    private String sku;

    @Column(name = "item_code", unique = true)
    @NotNull
    private String itemCode;

    @NotNull
    private String name;

    @NotNull
    private String description;

    @NotNull
    private Double price;

    //    unit of measure (kg, pc, pcs)
    @NotNull
    private String um;

    @Column(name = "um_amount")
    @NotNull
    private Double umAmount;

    @OneToMany(mappedBy = "quotedProduct")
    private Collection<QuoteItem> quoteItems;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Collection<Inventory> getInventory() {
        return inventory;
    }

    public void setInventory(Collection<Inventory> inventory) {
        this.inventory = inventory;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getItemCode() {
        return itemCode;
    }

    public void setItemCode(String itemCode) {
        this.itemCode = itemCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getUm() {
        return um;
    }

    public void setUm(String um) {
        this.um = um;
    }

    public Double getUmAmount() {
        return umAmount;
    }

    public void setUmAmount(Double umAmount) {
        this.umAmount = umAmount;
    }

    public Collection<QuoteItem> getQuoteItems() {
        return quoteItems;
    }

    public void setQuoteItems(Collection<QuoteItem> quotation) {
        this.quoteItems = quotation;
    }
}
