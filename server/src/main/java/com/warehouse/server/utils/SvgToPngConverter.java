package com.warehouse.server.utils;

import org.apache.batik.transcoder.TranscoderException;
import org.apache.batik.transcoder.TranscoderInput;
import org.apache.batik.transcoder.TranscoderOutput;
import org.apache.batik.transcoder.image.PNGTranscoder;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;

public class SvgToPngConverter {
    public static byte[] convert(String svgPath) throws IOException, TranscoderException {
        File svgFile = new File(svgPath);

        TranscoderInput input = new TranscoderInput(svgFile.toURI().toString());

        ByteArrayOutputStream pngOutput = new ByteArrayOutputStream();
        TranscoderOutput      output    = new TranscoderOutput(pngOutput);

        new PNGTranscoder().transcode(input, output);
        pngOutput.flush();

        return pngOutput.toByteArray();
    }
}
