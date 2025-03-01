package com.warehouse.server.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.rest.core.config.Projection;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "addresses")
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_address")
    String fullAddress;

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    @JsonBackReference("supplier_id")
    private Supplier supplier;

    @OneToOne
    @JoinColumn(name = "site_id")
    private Site site;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    @JsonBackReference("customer_id")
    private Customer customer;

    @Projection(name = "basic", types = {Address.class})
    public interface AddressBasicProjection {
        Long getId();

        String getFullAddress();
    }

    @Projection(name = "detail", types = {Address.class})
    public interface AddressDetailProjection extends AddressBasicProjection {
        Customer getCustomer();

        Supplier getSupplier();
    }
}
