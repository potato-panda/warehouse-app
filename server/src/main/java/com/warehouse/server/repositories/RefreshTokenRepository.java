package com.warehouse.server.repositories;

import com.warehouse.server.entities.RefreshToken;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    List<RefreshToken> findRefreshTokenByToken(@NotNull String token);

    @Modifying
    @Query("update RefreshToken t set t.revoked = true where t.user.username = :username")
    void invalidateRefreshTokensByUser(@Param("username") String username);
}
