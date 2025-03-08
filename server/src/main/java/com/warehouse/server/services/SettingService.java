package com.warehouse.server.services;

import com.warehouse.server.dtos.requests.setting.UpdateSettingRequestDTO;
import com.warehouse.server.dtos.responses.setting.GetSettingsResponseDTO;
import com.warehouse.server.dtos.responses.setting.UpdateSettingResponseDTO;
import com.warehouse.server.entities.Setting;
import lombok.Getter;
import org.springframework.http.ResponseEntity;

public interface SettingService {
    @Getter
    enum KEY {
        APP_NAME("appName"), COMPANY_NAME("companyName"), TIN("tin"), ADDRESS("address"), DEFAULT("default");

        final String value;

        KEY(String value) {
            this.value = value;
        }
    }

    ResponseEntity<GetSettingsResponseDTO> getSettings();

    Setting getSetting(String key);

    Setting getSetting(KEY key);

    ResponseEntity<UpdateSettingResponseDTO> updateSetting(UpdateSettingRequestDTO requestDTO);
}
