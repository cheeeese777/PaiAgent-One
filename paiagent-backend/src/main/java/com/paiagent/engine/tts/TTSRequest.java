package com.paiagent.engine.tts;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TTSRequest {
    private String text;
    private String model;
    private String voice;
    private String languageType;
    private String apiKey;
}
