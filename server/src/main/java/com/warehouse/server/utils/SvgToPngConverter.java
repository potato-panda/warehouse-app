package com.warehouse.server.utils;

import org.apache.batik.transcoder.TranscoderException;
import org.apache.batik.transcoder.TranscoderInput;
import org.apache.batik.transcoder.TranscoderOutput;
import org.apache.batik.transcoder.image.PNGTranscoder;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

public class SvgToPngConverter {
    public static byte[] convert(InputStream svgInputStream) throws IOException, TranscoderException {
        TranscoderInput input = new TranscoderInput(svgInputStream);

        ByteArrayOutputStream pngOutput = new ByteArrayOutputStream();
        TranscoderOutput output = new TranscoderOutput(pngOutput);

        new PNGTranscoder().transcode(input, output);
        pngOutput.flush();

        return pngOutput.toByteArray();
    }
}
