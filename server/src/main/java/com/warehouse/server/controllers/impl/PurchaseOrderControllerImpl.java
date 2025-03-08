package com.warehouse.server.controllers.impl;

import com.warehouse.server.controllers.PurchaseOrderController;
import com.warehouse.server.services.PurchaseOrderService;
import org.springframework.beans.factory.annotation.Autowired;
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
@RequestMapping("/api/purchaseOrders")
public class PurchaseOrderControllerImpl implements PurchaseOrderController {
    private final PurchaseOrderService purchaseOrderService;

    @Autowired
    public PurchaseOrderControllerImpl(PurchaseOrderService purchaseOrderService) {
        this.purchaseOrderService = purchaseOrderService;
    }

    @Override
    @GetMapping(path = "/{id}/generate")
    public ResponseEntity<byte[]> generatePurchaseOrderPdf(@PathVariable Long id) {
        var         bytes   = this.purchaseOrderService.generatePurchaseOrderPDF(id);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        String filename = "purchaseOrder-" + id + "-" + LocalDateTime.now() + ".pdf";
        headers.setContentDispositionFormData("inline", filename);
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
        return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
    }
}
