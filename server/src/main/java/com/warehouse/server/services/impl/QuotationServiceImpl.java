package com.warehouse.server.services.impl;

import com.warehouse.server.entities.Contact;
import com.warehouse.server.entities.Quotation;
import com.warehouse.server.repositories.QuotationRepository;
import com.warehouse.server.services.QuotationService;
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
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

import static com.warehouse.server.services.SettingService.KEY;

@Service
public class QuotationServiceImpl implements QuotationService {

    private final QuotationRepository quotationRepository;
    private final SettingService      settingService;

    public QuotationServiceImpl(QuotationRepository quotationRepository, SettingService settingService) {
        this.quotationRepository = quotationRepository;
        this.settingService      = settingService;
    }

    @Override
    public byte[] generateQuotationPDF(Long id) {
        Quotation quotation = this.quotationRepository.findById(id).orElseThrow();

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
                final Table.TableBuilder quotationHeaderBuilder = Table.builder()
                                                                       .addColumnsOfWidth(470)
                                                                       .fontSize(10)
                                                                       .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA))
                                                                       .borderColor(Color.WHITE)
                                                                       .textColor(royalBlue)
                                                                       .wordBreak(false);

                quotationHeaderBuilder.addRow(Row.builder()
                                                 .add(TextCell.builder()
                                                              .horizontalAlignment(HorizontalAlignment.LEFT)
                                                              .fontSize(14)
                                                              .text(this.settingService.getSetting(KEY.COMPANY_NAME)
                                                                                       .getValue())
                                                              .build())
                                                 .build())
                                      .addRow(Row.builder()
                                                 .add(TextCell.builder()
                                                              .horizontalAlignment(HorizontalAlignment.LEFT)
                                                              .text("VAT Reg. TIN : " + this.settingService.getSetting(
                                                                      KEY.TIN).getValue())
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
                                                              .text(this.settingService.getSetting(KEY.ADDRESS)
                                                                                       .getValue())
                                                              .build())
                                                 .build())
                                      .build();

                TableDrawer invoiceHeaderDrawer = TableDrawer.builder()
                                                             .contentStream(contentStream)
                                                             .startX(100f)
                                                             .startY(page.getMediaBox().getUpperRightY() - 25f)
                                                             .table(quotationHeaderBuilder.build())
                                                             .build();

                invoiceHeaderDrawer.draw();
                // Company Heading End

                // Quotation Details
                final Table.TableBuilder detailBuilder = Table.builder()
                                                              .fontSize(10)
                                                              .addColumnsOfWidth(110, 300, 44, 96)
                                                              .textColor(Color.BLACK)
                                                              .wordBreak(false);

                detailBuilder.addRow(Row.builder()
                                        .add(TextCell.builder()
                                                     .colSpan(4)
                                                     .horizontalAlignment(HorizontalAlignment.CENTER)
                                                     .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD))
                                                     .text("Quotation")
                                                     .fontSize(14)
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
                                                     .text(DateTimeFormatter.ofPattern("MMMM d, yyyy, HH:mm")
                                                                            .format(quotation.getQuotationDate()
                                                                                             .toLocalDateTime()))
                                                     .build())
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD))
                                                     .text("TID No")
                                                     .build())
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .text(quotation.getId().toString())
                                                     .build())
                                        .build())
                             .addRow(Row.builder()
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .borderColorRight(Color.WHITE)
                                                     .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD))
                                                     .text("Customer Name")
                                                     .build())
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .text(quotation.getCustomer().getName())
                                                     .build())
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD))
                                                     .text("TIN")
                                                     .build())
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .text(quotation.getCustomer().getTin())
                                                     .build())
                                        .build())
                             .addRow(Row.builder()
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .borderColorRight(Color.WHITE)
                                                     .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD))
                                                     .text("Contact Person")
                                                     .build())
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .text(quotation.getCustomer()
                                                                    .getContacts()
                                                                    .stream()
                                                                    .findAny()
                                                                    .orElse(Contact.builder().name("").build())
                                                                    .getName())
                                                     .build())
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD))
                                                     .text("PO no")
                                                     .build())
                                        .add(TextCell.builder().text("").build())
                                        .build())
                             .addRow(Row.builder()
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .borderColorRight(Color.WHITE)
                                                     .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD))
                                                     .text("Contact Number")
                                                     .build())
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .text(quotation.getCustomer()
                                                                    .getContacts()
                                                                    .stream()
                                                                    .findAny()
                                                                    .orElse(Contact.builder().phone("").build())
                                                                    .getPhone())
                                                     .build())
                                        .add(TextCell.builder().text("").build())
                                        .add(TextCell.builder().text("").build())
                                        .build())
                             .addRow(Row.builder()
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .borderColorRight(Color.WHITE)
                                                     .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD))
                                                     .text("Billing Address")
                                                     .build())
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .text(quotation.getCustomer().getBillingAddress())
                                                     .build())
                                        .add(TextCell.builder().text("").build())
                                        .add(TextCell.builder().text("").build())
                                        .build())
                             .addRow(Row.builder()
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .borderColorRight(Color.WHITE)
                                                     .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD))
                                                     .text("Shipping Address")
                                                     .build())
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .text(quotation.getShippingAddress())
                                                     .build())
                                        .add(TextCell.builder().text("").build())
                                        .add(TextCell.builder().text("").build())
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
                                                             .addColumnsOfWidth(40, 40, 140, 142, 60, 53, 75)
                                                             .fontSize(10)
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
                for (var quoteItem : quotation.getQuoteItems()) {
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
                                                        .text(String.format("%,.2f", quoteItem.getPrice()))
                                                        .horizontalAlignment(HorizontalAlignment.RIGHT)
                                                        .build())
                                           .add(TextCell.builder()
                                                        .text(String.format("%,.2f", quoteItem.getDiscountAmount()))
                                                        .horizontalAlignment(HorizontalAlignment.RIGHT)
                                                        .build())
                                           .add(TextCell.builder()
                                                        .text(String.format("%,.2f", quoteItem.getSubtotal()))
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
                                                                     .addColumnsOfWidth(375, 100, 75)
                                                                     .fontSize(10)
                                                                     .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA))
                                                                     .borderColor(Color.WHITE)
                                                                     .wordBreak(true);

                subtotalTableBuilder.addRow(Row.builder()
                                               .add(TextCell.builder().rowSpan(5).text("").build())
                                               .add(TextCell.builder()
                                                            .horizontalAlignment(HorizontalAlignment.RIGHT)
                                                            .text("Subtotal")
                                                            .build())
                                               .add(TextCell.builder()
                                                            .horizontalAlignment(HorizontalAlignment.RIGHT)
                                                            .text(String.format("%,.2f", quotation.getSubtotal()))
                                                            .build())
                                               .build())
                                    .addRow(Row.builder()
                                               .add(TextCell.builder()
                                                            .horizontalAlignment(HorizontalAlignment.RIGHT)
                                                            .text("Discount")
                                                            .build())
                                               .add(TextCell.builder()
                                                            .horizontalAlignment(HorizontalAlignment.RIGHT)
                                                            .text(String.format(quotation.getDiscountSubtotal() > 0 ?
                                                                                        "-%,.2f" : "%,.2f",
                                                                                quotation.getDiscountSubtotal()))
                                                            .build())
                                               .build())
                                    .addRow(Row.builder()
                                               .add(TextCell.builder()
                                                            .horizontalAlignment(HorizontalAlignment.RIGHT)
                                                            .text("Delivery Charge")
                                                            .build())
                                               .add(TextCell.builder()
                                                            .horizontalAlignment(HorizontalAlignment.RIGHT)
                                                            .text(String.format("%,.2f",
                                                                                quotation.getDeliverySubtotal()))
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
                                                            .text(String.format("%,.2f", quotation.getTotalAmount()))
                                                            .build())
                                               .build())
                                    .addRow(Row.builder()
                                               .add(TextCell.builder()
                                                            .horizontalAlignment(HorizontalAlignment.RIGHT)
                                                            .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA_OBLIQUE))
                                                            .text(quotation.getVatInclusive() ? "VAT Inclusive" :
                                                                          "VAT Exclusive")
                                                            .build())
                                               .add(TextCell.builder().text("").build())
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
                var   font       = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
                var   fontSize   = 8;

                contentStream.setFont(font, fontSize);
                contentStream.setLeading(14.5f);

                contentStream.beginText();


                // Footer
                contentStream.newLineAtOffset(20, 15);
                contentStream.showText("Printed on " + LocalDateTime.ofInstant(Instant.now(),
                                                                               ZoneId.systemDefault())
                                                                    .format(DateTimeFormatter.ofPattern(
                                                                            "MM/dd/yyyy HH:mm:ss")));
                var text      = "Page " + pageNumber++ + " of " + document.getNumberOfPages();
                var textWidth = font.getStringWidth(text) / 1000 * fontSize;
                contentStream.newLineAtOffset(pageWidth - margin - textWidth, 0);
                contentStream.showText(text);

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
