package com.warehouse.server.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class UnauthorizedException extends Throwable {
    public UnauthorizedException(String message) {
        super(message);
    }

    public UnauthorizedException() {}
}
