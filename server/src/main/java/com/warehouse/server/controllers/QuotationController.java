package com.warehouse.server.controllers;

import org.springframework.http.ResponseEntity;

public interface QuotationController {
    ResponseEntity<byte[]> generateQuotationPdf(Long id);
}
