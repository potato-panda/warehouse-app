package com.warehouse.server.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;
import org.springframework.security.core.GrantedAuthority;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "authorities")
public class Authority implements GrantedAuthority {
    @Id
    @Column(unique = true, nullable = false)
    @Length(min = 3, max = 60, message = "Role name must be between 3 and 60 characters long.")
    private String authority;

    @Override
    public String getAuthority() {
        return authority;
    }

}
