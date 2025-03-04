package com.warehouse.server.dtos.responses.setting;

import java.util.List;

public record GetSettingsResponseDTO(List<Setting> settings) {

    public record Setting(Long id, String key, String value) {}
}

