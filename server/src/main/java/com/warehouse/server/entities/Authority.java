package com.warehouse.server.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.validator.constraints.Length;
import org.springframework.security.core.GrantedAuthority;

@Entity
@Table(name = "authorities")
public class Authority implements GrantedAuthority {
    @Id
    @Column(unique = true, nullable = false)
    @Length(min = 3, max = 60, message = "Role name must be between 3 and 60 characters long.")
    private String authority;

    public Authority(String authority) {
        this.authority = authority;
    }

    protected Authority() {}

    @Override
    public String getAuthority() {
        return authority;
    }

    public void setAuthority(String authority) {
        this.authority = authority;
    }
}
