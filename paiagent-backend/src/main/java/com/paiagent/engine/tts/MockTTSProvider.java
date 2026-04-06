package com.paiagent.engine.tts;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class MockTTSProvider implements TTSProvider {

    @Override
    public String getProviderKey() {
        return "mock";
    }

    @Override
    public TTSResponse synthesize(TTSRequest request) {
        try {
            // Simulate network latency
            Thread.sleep(500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        String text = request.getText();
        String model = request.getModel() != null ? request.getModel() : "qwen3-tts-flash";
        String voice = request.getVoice() != null ? request.getVoice() : "Cherry";

        int duration = estimateDuration(text);
        String voiceUrl = "/api/mock/audio/" + model + "_" + voice + "_" + System.currentTimeMillis() + ".mp3";

        log.info("MockTTSProvider: Generated mock TTS response (model={}, voice={}, duration={}s)",
                model, voice, duration);

        TTSResponse response = new TTSResponse();
        response.setVoiceUrl(voiceUrl);
        response.setAudioFormat("mp3");
        response.setDuration(duration);
        return response;
    }

    private Integer estimateDuration(String text) {
        if (text == null || text.isEmpty()) {
            return 0;
        }
        // Estimate ~3-4 characters per second for Chinese
        int charCount = text.length();
        return Math.max(1, charCount / 4);
    }
}
