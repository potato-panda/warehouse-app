package com.warehouse.server.services.impl;

import com.warehouse.server.entities.PurchaseOrder;
import com.warehouse.server.repositories.PurchaseOrderRepository;
import com.warehouse.server.services.PurchaseOrderService;
import com.warehouse.server.services.SettingService;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.vandeseer.easytable.RepeatedHeaderTableDrawer;
import org.vandeseer.easytable.TableDrawer;
import org.vandeseer.easytable.settings.HorizontalAlignment;
import org.vandeseer.easytable.structure.Row;
import org.vandeseer.easytable.structure.Table;
import org.vandeseer.easytable.structure.cell.TextCell;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;

@Service
public class PurchaseOrderServiceImpl implements PurchaseOrderService {
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SettingService          settingService;

    public PurchaseOrderServiceImpl(PurchaseOrderRepository purchaseOrderRepository, SettingService settingService) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.settingService          = settingService;
    }

    @Override
    public byte[] generatePurchaseOrderPDF(Long id) {
        PurchaseOrder purchaseOrder = this.purchaseOrderRepository.findById(id).orElseThrow();

        try (PDDocument document = new PDDocument()) {
            final PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                byte[] image  = Files.readAllBytes(Path.of(new ClassPathResource("logo.png").getURI()));
                var    width  = page.getMediaBox().getWidth();
                var    height = page.getMediaBox().getHeight();
                var    lowerX = 20.0f;
                var    lowerY = height - 90.0f;
                contentStream.drawImage(PDImageXObject.createFromByteArray(document, image, null),
                                        lowerX,
                                        lowerY,
                                        80,
                                        80);

                final var royalBlue = new Color(65, 105, 225);

                // Company Heading
                final Table.TableBuilder purchaseOrderHeaderBuilder = Table.builder()
                                                                           .addColumnsOfWidth(470)
                                                                           .fontSize(8)
                                                                           .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA))
                                                                           .borderColor(Color.WHITE)
                                                                           .textColor(royalBlue)
                                                                           .wordBreak(false);

                purchaseOrderHeaderBuilder.addRow(Row.builder()
                                                     .add(TextCell.builder()
                                                                  .horizontalAlignment(HorizontalAlignment.LEFT)
                                                                  .fontSize(11)
                                                                  .text(this.settingService.getSetting(SettingService.KEY.COMPANY_NAME)
                                                                                           .getValue())
                                                                  .build())
                                                     .build())
                                          .addRow(Row.builder()
                                                     .add(TextCell.builder()
                                                                  .horizontalAlignment(HorizontalAlignment.LEFT)
                                                                  .text("VAT Reg. TIN : " + this.settingService.getSetting(
                                                                          SettingService.KEY.TIN).getValue())
                                                                  .build())
                                                     .build())
                                          .addRow(Row.builder()
                                                     .add(TextCell.builder()
                                                                  .horizontalAlignment(HorizontalAlignment.LEFT)
                                                                  .text("Contact : " + this.settingService.getSetting(
                                                                          SettingService.KEY.CONTACT).getValue())
                                                                  .build())
                                                     .build())
                                          .addRow(Row.builder()
                                                     .add(TextCell.builder()
                                                                  .horizontalAlignment(HorizontalAlignment.LEFT)
                                                                  .text(this.settingService.getSetting(SettingService.KEY.ADDRESS)
                                                                                           .getValue())
                                                                  .build())
                                                     .build())
                                          .build();

                TableDrawer invoiceHeaderDrawer = TableDrawer.builder()
                                                             .contentStream(contentStream)
                                                             .startX(100f)
                                                             .startY(page.getMediaBox().getUpperRightY() - 25f)
                                                             .table(purchaseOrderHeaderBuilder.build())
                                                             .build();

                invoiceHeaderDrawer.draw();
                // Company Heading End

                // Purchase Order Details
                final Table.TableBuilder detailBuilder = Table.builder()
                                                              .fontSize(8)
                                                              .addColumnsOfWidth(80, 195, 80, 195)
                                                              .textColor(Color.BLACK)
                                                              .wordBreak(false);

                detailBuilder.addRow(Row.builder()
                                        .add(TextCell.builder()
                                                     .colSpan(4)
                                                     .horizontalAlignment(HorizontalAlignment.CENTER)
                                                     .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD))
                                                     .text("Purchase Order")
                                                     .fontSize(11)
                                                     .backgroundColor(Color.LIGHT_GRAY)
                                                     .build())
                                        .build())
                             .addRow(Row.builder()
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .borderColorRight(Color.WHITE)
                                                     .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD))
                                                     .text("Date")
                                                     .build())
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .text("")
                                                     .build())
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD))
                                                     .text("PO No")
                                                     .build())
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .text("")
                                                     .build())
                                        .build())
                             .addRow(Row.builder()
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD))
                                                     .borderColorRight(Color.WHITE)
                                                     .text("Supplier Name")
                                                     .build())
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .text(purchaseOrder.getSupplier().getName())
                                                     .build())
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD))
                                                     .text("Ref No")
                                                     .build())
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .text(purchaseOrder.getId().toString())
                                                     .build())
                                        .build())
                             .addRow(Row.builder()
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD))
                                                     .borderColorRight(Color.WHITE)
                                                     .text("Contact")
                                                     .build())
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .text("")
                                                     .build())
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .text("")
                                                     .build())
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .text("")
                                                     .build())
                                        .build())
                             .addRow(Row.builder()
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD))
                                                     .borderColorRight(Color.WHITE)
                                                     .text("Prepared By")
                                                     .build())
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .text(Optional.ofNullable(purchaseOrder.getPreparedBy())
                                                                   .orElse(""))
                                                     .build())
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD))
                                                     .text("Checked By")
                                                     .build())
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .text(Optional.ofNullable(purchaseOrder.getCheckedBy()).orElse(""))
                                                     .build())
                                        .build())
                             .addRow(Row.builder()
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD))
                                                     .borderColorRight(Color.WHITE)
                                                     .text("Approved By")
                                                     .build())
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .text(Optional.ofNullable(purchaseOrder.getApprovedBy())
                                                                   .orElse(""))
                                                     .build())
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD))
                                                     .text("Received By")
                                                     .build())
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .text(Optional.ofNullable(purchaseOrder.getReceivedBy())
                                                                   .orElse(""))
                                                     .build())
                                        .build())
                             .build();

                TableDrawer detailDrawer = TableDrawer.builder()
                                                      .contentStream(contentStream)
                                                      .startX(20f)
                                                      .startY(invoiceHeaderDrawer.getFinalY() - 5f)
                                                      .table(detailBuilder.build())
                                                      .build();

                detailDrawer.draw();
                // Invoice Details End

                // Build the table
                final Table.TableBuilder tableBuilder = Table.builder()
                                                             .addColumnsOfWidth(40, 40, 140, 180, 55, 55, 40)
                                                             .fontSize(8)
                                                             .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA))
                                                             .borderColor(Color.WHITE)
                                                             .wordBreak(true);

                // Add the header
                tableBuilder.addRow(Row.builder()
                                       .add(TextCell.builder()
                                                    .borderWidth(1)
                                                    .horizontalAlignment(HorizontalAlignment.CENTER)
                                                    .text("Qty")
                                                    .build())
                                       .add(TextCell.builder()
                                                    .borderWidth(1)
                                                    .horizontalAlignment(HorizontalAlignment.CENTER)
                                                    .text("UM")
                                                    .build())
                                       .add(TextCell.builder()
                                                    .borderWidth(1)
                                                    .horizontalAlignment(HorizontalAlignment.CENTER)
                                                    .text("Item Name")
                                                    .build())
                                       .add(TextCell.builder()
                                                    .borderWidth(1)
                                                    .horizontalAlignment(HorizontalAlignment.CENTER)
                                                    .text("Description")
                                                    .build())
                                       .add(TextCell.builder()
                                                    .borderWidth(1)
                                                    .horizontalAlignment(HorizontalAlignment.CENTER)
                                                    .text("Price")
                                                    .build())
                                       .add(TextCell.builder()
                                                    .borderWidth(1)
                                                    .horizontalAlignment(HorizontalAlignment.CENTER)
                                                    .text("Discount, %")
                                                    .build())
                                       .add(TextCell.builder()
                                                    .borderWidth(1)
                                                    .horizontalAlignment(HorizontalAlignment.CENTER)
                                                    .text("Amount")
                                                    .build())
                                       .backgroundColor(Color.LIGHT_GRAY)
                                       .build());

                // Add the rows
                int i = 0;
                for (var quoteItem : purchaseOrder.getQuoteItems()) {
                    tableBuilder.addRow(Row.builder()
                                           .add(TextCell.builder()
                                                        .text(quoteItem.getQuantity().toString())
                                                        .horizontalAlignment(HorizontalAlignment.RIGHT)
                                                        .build())
                                           .add(TextCell.builder()
                                                        .text(quoteItem.getQuotedProduct().getUm())
                                                        .horizontalAlignment(HorizontalAlignment.RIGHT)
                                                        .build())
                                           .add(TextCell.builder().text(quoteItem.getQuotedProduct().getName()).build())
                                           .add(TextCell.builder()
                                                        .text(quoteItem.getQuotedProduct().getDescription())
                                                        .build())
                                           .add(TextCell.builder()
                                                        .text(String.format("%.2f", quoteItem.getPrice()))
                                                        .horizontalAlignment(HorizontalAlignment.RIGHT)
                                                        .build())
                                           .add(TextCell.builder()
                                                        .text(String.format("%.2f", quoteItem.getDiscountAmount()))
                                                        .horizontalAlignment(HorizontalAlignment.RIGHT)
                                                        .build())
                                           .add(TextCell.builder()
                                                        .text(String.format("%.2f", quoteItem.getSubtotal()))
                                                        .horizontalAlignment(HorizontalAlignment.RIGHT)
                                                        .build())
                                           .backgroundColor(i++ % 2 == 0 ? new Color(240, 240, 240) : Color.WHITE)
                                           .build());
                }

                // Set up the drawer
                RepeatedHeaderTableDrawer tableDrawer = RepeatedHeaderTableDrawer.builder()
                                                                                 .contentStream(contentStream)
                                                                                 .startX(20f)
                                                                                 .startY(detailDrawer.getFinalY() - 5f)
                                                                                 .endY(50f)
                                                                                 .startTableInNewPage(false)
                                                                                 .numberOfRowsToRepeat(1)
                                                                                 .table(tableBuilder.build())
                                                                                 .build();

                // And go for it!
                tableDrawer.draw(() -> document, () -> new PDPage(PDRectangle.A4), 50f);

                // Subtotal
                final Table.TableBuilder subtotalTableBuilder = Table.builder()
                                                                     .addColumnsOfWidth(390, 100, 60)
                                                                     .fontSize(8)
                                                                     .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA))
                                                                     .borderColor(Color.WHITE)
                                                                     .wordBreak(true);

                subtotalTableBuilder.addRow(Row.builder()
                                               .add(TextCell.builder()
                                                            .rowSpan(3)
                                                            .backgroundColor(new Color(240, 240, 240))
                                                            .text("")
                                                            .build())
                                               .add(TextCell.builder()
                                                            .horizontalAlignment(HorizontalAlignment.RIGHT)
                                                            .text("Subtotal")
                                                            .build())
                                               .add(TextCell.builder()
                                                            .horizontalAlignment(HorizontalAlignment.RIGHT)
                                                            .text(String.format("%.2f", purchaseOrder.getSubtotal()))
                                                            .build())
                                               .build())
                                    .addRow(Row.builder()
                                               .add(TextCell.builder()
                                                            .horizontalAlignment(HorizontalAlignment.RIGHT)
                                                            .text("Discount")
                                                            .build())
                                               .add(TextCell.builder()
                                                            .horizontalAlignment(HorizontalAlignment.RIGHT)
                                                            .text(String.format(purchaseOrder.getDiscountSubtotal() > 0 ? "-%.2f" : "%.2f",
                                                                                purchaseOrder.getDiscountSubtotal()))
                                                            .build())
                                               .build())
                                    .addRow(Row.builder()
                                               .add(TextCell.builder()
                                                            .horizontalAlignment(HorizontalAlignment.RIGHT)
                                                            .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD))
                                                            .text("Total")
                                                            .build())
                                               .add(TextCell.builder()
                                                            .horizontalAlignment(HorizontalAlignment.RIGHT)
                                                            .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD))
                                                            .text(String.format("%.2f", purchaseOrder.getTotalAmount()))
                                                            .build())
                                               .build());

                RepeatedHeaderTableDrawer subtotalTableDrawer = RepeatedHeaderTableDrawer.builder()
                                                                                         .contentStream(contentStream)
                                                                                         .startX(20f)
                                                                                         .startY(tableDrawer.getFinalY() - 5f)
                                                                                         .endY(50f)
                                                                                         .startTableInNewPage(false)
                                                                                         .table(subtotalTableBuilder.build())
                                                                                         .build();

                subtotalTableDrawer.draw(() -> document, () -> new PDPage(PDRectangle.A4), 50f);
            }

            int pageNumber = 1;
            for (PDPage _page : document.getPages()) {
                PDPageContentStream contentStream = new PDPageContentStream(document,
                                                                            _page,
                                                                            PDPageContentStream.AppendMode.APPEND,
                                                                            true,
                                                                            true);

                float margin     = 50;
                float pageWidth  = page.getMediaBox().getWidth();
                float pageHeight = page.getMediaBox().getHeight();

                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 8);
                contentStream.setLeading(14.5f);

                contentStream.beginText();


                // Footer
                contentStream.newLineAtOffset(pageWidth - margin - 10, 20);
                contentStream.showText("Page " + pageNumber++ + " of " + document.getNumberOfPages());

                contentStream.endText();
                contentStream.close();
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

            document.save(outputStream);

            return outputStream.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

    }
}
