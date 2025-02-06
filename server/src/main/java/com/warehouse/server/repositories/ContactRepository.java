package com.warehouse.server.repositories;

import com.warehouse.server.entities.Contact;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;

@RepositoryRestResource(collectionResourceRel = "contacts", path = "contacts")
public interface ContactRepository extends JpaRepository<Contact, Long> {
    @RestResource(path = "byName", rel = "byName")
    Page<Contact> findContactsByNameContainingIgnoreCase(@NotNull String name, Pageable pageable);
}
