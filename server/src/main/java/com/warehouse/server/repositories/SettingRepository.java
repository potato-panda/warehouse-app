package com.warehouse.server.repositories;

import com.warehouse.server.entities.Setting;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SettingRepository extends JpaRepository<Setting, Long> {
    List<Setting> findAllByAdmin(Boolean admin);

    boolean existsSettingByKey(String key);

    Setting getSettingById(Long id);

    Setting getSettingByKey(String key);

    @Query("SELECT s FROM Setting s WHERE s.id = :id OR s.key = :key")
    Optional<Setting> findByIdOrKey(@NotNull Long id, String key);

    List<Setting> findAllByAdminFalse();
}
