package com.warehouse.server.dtos.requests.setting;

import jakarta.validation.constraints.NotNull;

public record UpdateSettingRequestDTO(@NotNull Long id, String key, @NotNull String value) {
}
