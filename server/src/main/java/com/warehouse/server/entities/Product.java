package com.warehouse.server.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collection;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "products")
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

    //    unit of measure (kg, pc, pcs)
    @NotNull
    private String um;

    @OneToMany(mappedBy = "quotedProduct")
    private Collection<QuoteItem> quoteItems;

}
