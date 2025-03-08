package com.warehouse.server.controllers.impl;

import com.warehouse.server.controllers.QuotationController;
import com.warehouse.server.services.QuotationService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/quotations")
public class QuotationControllerImpl implements QuotationController {

    private final QuotationService quotationService;

    public QuotationControllerImpl(QuotationService quotationService) {this.quotationService = quotationService;}

    @Override
    @GetMapping(path = "/{id}/generate")
    public ResponseEntity<byte[]> generateQuotationPdf(@PathVariable Long id) {
        var         bytes   = this.quotationService.generateQuotationPDF(id);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        String filename = "quotation-" + id + "-" + LocalDateTime.now() + ".pdf";
        headers.setContentDispositionFormData("inline", filename);
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
        return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
    }
}
