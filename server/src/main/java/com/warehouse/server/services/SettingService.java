package com.warehouse.server.services;

import com.warehouse.server.dtos.requests.setting.UpdateSettingRequestDTO;
import com.warehouse.server.dtos.responses.setting.GetSettingsResponseDTO;
import com.warehouse.server.dtos.responses.setting.UpdateSettingResponseDTO;
import org.springframework.http.ResponseEntity;

public interface SettingService {
    ResponseEntity<GetSettingsResponseDTO> getSettings();

    ResponseEntity<UpdateSettingResponseDTO> updateSetting(UpdateSettingRequestDTO requestDTO);
}
