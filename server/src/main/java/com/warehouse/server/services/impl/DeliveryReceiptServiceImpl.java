package com.warehouse.server.services.impl;

import com.warehouse.server.entities.Contact;
import com.warehouse.server.entities.Customer;
import com.warehouse.server.entities.DeliveryReceipt;
import com.warehouse.server.entities.Quotation;
import com.warehouse.server.repositories.DeliveryReceiptRepository;
import com.warehouse.server.services.DeliveryReceiptService;
import com.warehouse.server.services.SettingService;
import com.warehouse.server.utils.SvgToPngConverter;
import org.apache.batik.transcoder.TranscoderException;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class DeliveryReceiptServiceImpl implements DeliveryReceiptService {
    private final Logger                    LOGGER = LoggerFactory.getLogger(DeliveryReceiptServiceImpl.class);
    private final DeliveryReceiptRepository deliveryReceiptRepository;
    private final SettingService            settingService;

    public DeliveryReceiptServiceImpl(DeliveryReceiptRepository deliveryReceiptRepository,
                                      SettingService settingService) {
        this.deliveryReceiptRepository = deliveryReceiptRepository;
        this.settingService            = settingService;
    }

    @Override
    public byte[] generateDeliveryReceiptPDF(Long id) {
        DeliveryReceipt deliveryReceipt = this.deliveryReceiptRepository.findById(id).orElseThrow();
        Quotation       quotation       = deliveryReceipt.getQuotation();

        var isPhildex = Optional.of(deliveryReceipt)
                                .map(DeliveryReceipt::getSite)
                                .map(site -> site.getName().toLowerCase().contains("phildex"))
                                .orElse(false);

        var POINTS_PER_INCH = 72;
        var NINE_AND_A_HALF = 9.5f; // width: 684 dots
        var ELEVEN          = 11.0f; // height: 792 dots

        class Scaler {
            final float WIDTH_SCALE  = isPhildex ? 1 : 1.36f;
            final float HEIGHT_SCALE = isPhildex ? 1 : 1.36f;

            float scaleHeight(int height) {
                return height * HEIGHT_SCALE;
            }

            float scaleWidth(int width) {
                return width * WIDTH_SCALE;
            }
        }

        Scaler scaler = new Scaler();

        var pageRect = isPhildex ? PDRectangle.A4 : new PDRectangle(ELEVEN * POINTS_PER_INCH,
                                                                    NINE_AND_A_HALF * POINTS_PER_INCH);

        try (PDDocument document = new PDDocument()) {
            final PDPage page = new PDPage(pageRect);
            document.addPage(page);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                PDRectangle pageSize  = page.getMediaBox();
                float       pageWidth = pageSize.getWidth();

                byte[] logo   = Files.readAllBytes(Path.of(new ClassPathResource("logo.png").getURI()));
                var    width  = page.getMediaBox().getWidth();
                var    height = page.getMediaBox().getHeight();
                var    lowerX = 20.0f;
                var    lowerY = height - 90.0f;

                contentStream.drawImage(PDImageXObject.createFromByteArray(document, logo, null),
                                        lowerX,
                                        lowerY,
                                        80,
                                        80);

                final var royalBlue = new Color(65, 105, 225);

                if (isPhildex) {
                    try (InputStream is = new ClassPathResource("phildex-logo.svg").getInputStream()) {
                        byte[] pngBytes = SvgToPngConverter.convert(is);
                        PDImageXObject pdImage = PDImageXObject.createFromByteArray(document, pngBytes, "svg_image");
                        contentStream.drawImage(pdImage, width - 80 - 50, lowerY, 80, 80);
                    }
                }
                // Company Heading
                final Table.TableBuilder deliveryReceiptHeaderBuilder = Table.builder()
                                                                             .addColumnsOfWidth(scaler.scaleWidth(470))
                                                                             .fontSize(10)
                                                                             .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA))
                                                                             .borderColor(Color.WHITE)
                                                                             .textColor(royalBlue)
                                                                             .wordBreak(false);

                deliveryReceiptHeaderBuilder.addRow(Row.builder()
                                                       .add(TextCell.builder()
                                                                    .horizontalAlignment(HorizontalAlignment.LEFT)
                                                                    .fontSize(14)
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
                                                             .table(deliveryReceiptHeaderBuilder.build())
                                                             .build();

                invoiceHeaderDrawer.draw();
                // Company Heading End

                // Quotation Details
                final Table.TableBuilder detailBuilder = Table.builder()
                                                              .fontSize(10)
                                                              .addColumnsOfWidth(scaler.scaleWidth(110),
                                                                                 scaler.scaleWidth(300),
                                                                                 scaler.scaleWidth(44),
                                                                                 scaler.scaleWidth(96))
                                                              .textColor(Color.BLACK)
                                                              .wordBreak(false);

                detailBuilder.addRow(Row.builder()
                                        .add(TextCell.builder()
                                                     .colSpan(4)
                                                     .horizontalAlignment(HorizontalAlignment.CENTER)
                                                     .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD))
                                                     .text("Delivery Receipt")
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
                                                     .text(Optional.of(quotation)
                                                                   .map(Quotation::getCustomer)
                                                                   .map(Customer::getContacts)
                                                                   .filter(contacts -> !contacts.isEmpty())
                                                                   .map(List::getFirst)
                                                                   .map(Contact::getName)
                                                                   .orElse(""))
                                                     .build())
                                        .add(TextCell.builder()
                                                     .horizontalAlignment(HorizontalAlignment.LEFT)
                                                     .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD))
                                                     .text("PO no")
                                                     .build())
                                        .add(TextCell.builder()
                                                     .text(Optional.of(quotation)
                                                                   .map(Quotation::getDeliveryReceipt)
                                                                   .map(DeliveryReceipt::getPo)
                                                                   .orElse(""))
                                                     .build())
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
                                                             .addColumnsOfWidth(scaler.scaleWidth(40),
                                                                                scaler.scaleWidth(40),
                                                                                scaler.scaleWidth(140),
                                                                                scaler.scaleWidth(142),
                                                                                scaler.scaleWidth(60),
                                                                                scaler.scaleWidth(53),
                                                                                scaler.scaleWidth(75))
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
                                                                     .addColumnsOfWidth(scaler.scaleWidth(375),
                                                                                        scaler.scaleWidth(100),
                                                                                        scaler.scaleWidth(75))
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

                final Table.TableBuilder receiptTableBuilder = Table.builder()
                                                                    .addColumnsOfWidth(scaler.scaleWidth(80),
                                                                                       scaler.scaleWidth(195),
                                                                                       scaler.scaleWidth(80),
                                                                                       scaler.scaleWidth(195))
                                                                    .fontSize(10)
                                                                    .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA))
                                                                    .borderColor(Color.WHITE)
                                                                    .wordBreak(true);

                receiptTableBuilder.addRow(Row.builder()
                                              .add(TextCell.builder()
                                                           .text("Received By")
                                                           .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD))
                                                           .build())
                                              .add(TextCell.builder()
                                                           .text(Optional.ofNullable(quotation.getDeliveryReceipt()
                                                                                              .getReceivedBy())
                                                                         .orElse(""))
                                                           .build())
                                              .add(TextCell.builder()
                                                           .text("Received Date")
                                                           .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD))
                                                           .build())
                                              .add(TextCell.builder()
                                                           .text(Optional.ofNullable(quotation.getDeliveryReceipt()
                                                                                              .getReceivedDate())
                                                                         .map(date -> DateTimeFormatter.ofPattern(
                                                                                                               "MMMM "
                                                                                                               + "d, "
                                                                                                               + "yyyy")
                                                                                                       .format(date.toLocalDateTime()))
                                                                         .orElse(""))
                                                           .build())
                                              .build())
                                   .addRow(Row.builder()
                                              .add(TextCell.builder()
                                                           .text("Cheque Number")
                                                           .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD))
                                                           .build())
                                              .add(TextCell.builder()
                                                           .text(Optional.ofNullable(quotation.getDeliveryReceipt()
                                                                                              .getChequeNumber())
                                                                         .orElse(""))
                                                           .build())
                                              .add(TextCell.builder()
                                                           .text("Payment Due Date")
                                                           .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD))
                                                           .build())
                                              .add(TextCell.builder()
                                                           .text(Optional.ofNullable(quotation.getDeliveryReceipt()
                                                                                              .getPaymentDueDate())
                                                                         .map(date -> DateTimeFormatter.ofPattern(
                                                                                 "MMMM d, yyyy").format(date))
                                                                         .orElse(""))
                                                           .build())
                                              .build())
                                   .addRow(Row.builder()
                                              .add(TextCell.builder()
                                                           .text("Signature")
                                                           .font(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD))
                                                           .build())
                                              .add(TextCell.builder().text("").colSpan(3).build())
                                              .build());

                TableDrawer receiptTableDrawer = TableDrawer.builder()
                                                            .contentStream(contentStream)
                                                            .startX(20f)
                                                            .startY(subtotalTableDrawer.getFinalY() - 5f)
                                                            .endY(50f)
                                                            .startTableInNewPage(false)
                                                            .table(receiptTableBuilder.build())
                                                            .build();

                receiptTableDrawer.draw();
            } catch (TranscoderException e) {
                LOGGER.error(e.getMessage(), e);
                throw new RuntimeException(e);
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
                contentStream.newLineAtOffset(20, 30);
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
            LOGGER.error(e.getMessage(), e);
            throw new RuntimeException(e);
        }

    }
}
