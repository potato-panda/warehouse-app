package com.warehouse.server.services.impl;

import com.warehouse.server.dtos.requests.setting.UpdateSettingRequestDTO;
import com.warehouse.server.dtos.responses.setting.GetSettingsResponseDTO;
import com.warehouse.server.dtos.responses.setting.UpdateSettingResponseDTO;
import com.warehouse.server.entities.Setting;
import com.warehouse.server.repositories.SettingRepository;
import com.warehouse.server.services.SettingService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SettingServiceImpl implements SettingService {

    private final SettingRepository settingRepository;

    @PostConstruct
    public void initDefaultSettings() {
        setDefaultIfNotExists("App Name", "Warehouse App", true);
        setDefaultIfNotExists("default", "default", false);
    }

    private void setDefaultIfNotExists(String key, String defaultValue, Boolean admin) {
        if (!settingRepository.existsSettingByKey(key)) {
            settingRepository.save(new Setting(null, key, defaultValue, admin));
        }
    }

    @Autowired
    public SettingServiceImpl(SettingRepository settingRepository) {this.settingRepository = settingRepository;}

    @Override
    public ResponseEntity<GetSettingsResponseDTO> getSettings() {
        var settings = settingRepository.findAll();

        List<GetSettingsResponseDTO.Setting> settingList = settings.stream()
                                                                   .map(setting -> new GetSettingsResponseDTO.Setting(
                                                                           setting.getId(),
                                                                           setting.getKey(),
                                                                           setting.getValue()))
                                                                   .toList();

        return ResponseEntity.ok(new GetSettingsResponseDTO(settingList));
    }

    @Override
    public ResponseEntity<UpdateSettingResponseDTO> updateSetting(UpdateSettingRequestDTO requestDTO) {
        var setting = settingRepository.findByIdOrKey(requestDTO.id(), requestDTO.key()).orElse(null);

        if (setting == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                 .build();
        }

//        var isAdmin = isAdmin();

//        if (isAdmin || Boolean.FALSE.equals(setting.getAdmin())) {
        setting.setValue(requestDTO.value());
        var saved = settingRepository.save(setting);
        return ResponseEntity.ok(new UpdateSettingResponseDTO(saved.getId(), saved.getKey(), saved.getValue()));
//        }

//        return ResponseEntity.status(HttpStatus.FORBIDDEN)
//                             .build();

    }

    private boolean isAdmin() {
        return SecurityContextHolder.getContext()
                                    .getAuthentication()
                                    .getAuthorities()
                                    .stream()
                                    .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
    }
}
