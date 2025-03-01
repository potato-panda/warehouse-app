package com.warehouse.server.repositories;

import com.warehouse.server.entities.Site;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;

@RepositoryRestResource(collectionResourceRel = "sites", path = "sites")
public interface SiteRepository extends JpaRepository<Site, Long> {

    @RestResource(path = "byName", rel = "byName")
    Page<Site> findSitesByName(String name, Pageable pageable);
}
