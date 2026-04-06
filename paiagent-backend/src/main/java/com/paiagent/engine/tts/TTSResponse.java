package com.paiagent.engine.tts;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TTSResponse {
    private String voiceUrl;
    private String audioFormat;
    private Integer duration;
}
