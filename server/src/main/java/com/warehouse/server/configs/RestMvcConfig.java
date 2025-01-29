package com.warehouse.server.configs;

import jakarta.persistence.EntityManager;
import jakarta.persistence.metamodel.Type;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurer;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

@Component
public class RestMvcConfig implements RepositoryRestConfigurer {

    private final EntityManager entityManager;

    public RestMvcConfig(EntityManager entityManager) {this.entityManager = entityManager;}

    @Override
    public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config, CorsRegistry cors) {
        // expose ids
        Class<?>[] classes = entityManager.getMetamodel()
                                          .getEntities().stream().map(Type::getJavaType).toArray(Class[]::new);
        config.exposeIdsFor(classes);

        // set Rest endpoints with base url of /api
        config.setBasePath("/api");
    }
}