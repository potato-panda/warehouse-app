package com.warehouse.server.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class NotFoundException extends Throwable {
    public NotFoundException(String message) {
        super(message);
    }

    public NotFoundException() {}
}
