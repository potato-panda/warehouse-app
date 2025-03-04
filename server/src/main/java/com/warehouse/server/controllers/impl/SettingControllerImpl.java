package com.warehouse.server.controllers.impl;

import com.warehouse.server.controllers.SettingController;
import com.warehouse.server.dtos.requests.setting.UpdateSettingRequestDTO;
import com.warehouse.server.dtos.responses.setting.GetSettingsResponseDTO;
import com.warehouse.server.dtos.responses.setting.UpdateSettingResponseDTO;
import com.warehouse.server.services.SettingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.BasePathAwareController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@BasePathAwareController("/settings")
public class SettingControllerImpl implements SettingController {

    private final SettingService settingService;

    @Autowired
    public SettingControllerImpl(SettingService settingService) {this.settingService = settingService;}

    @Override
    @GetMapping
    public ResponseEntity<GetSettingsResponseDTO> getSettings() {
        return settingService.getSettings();
    }

    @Override
    @PutMapping("/{id}")
    public ResponseEntity<UpdateSettingResponseDTO> updateSetting(@Valid @RequestBody UpdateSettingRequestDTO requestDTO) {
        return settingService.updateSetting(requestDTO);
    }
}
