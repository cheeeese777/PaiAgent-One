package com.paiagent.engine.tts;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class AliyunTTSProvider implements TTSProvider {

    private static final String API_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation";
    private final RestTemplate restTemplate;

    public AliyunTTSProvider() {
        this.restTemplate = new RestTemplate();
    }

    @Override
    public String getProviderKey() {
        return "aliyun";
    }

    @Override
    public TTSResponse synthesize(TTSRequest request) {
        String apiKey = request.getApiKey();
        if (apiKey == null || apiKey.isEmpty()) {
            log.warn("AliyunTTSProvider: API key is empty, using mock mode");
            return createMockResponse(request);
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            Map<String, Object> requestBody = buildRequestBody(request);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            log.info("AliyunTTSProvider: Calling Qwen3-TTS-Flash API, text length={}, voice={}, model={}", 
                    request.getText() != null ? request.getText().length() : 0,
                    request.getVoice(), 
                    request.getModel());

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    API_URL, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                log.info("AliyunTTSProvider: API response received: {}", responseBody);
                
                String audioUrl = extractAudioUrl(responseBody);

                if (audioUrl != null && !audioUrl.isEmpty()) {
                    log.info("AliyunTTSProvider: TTS synthesis completed successfully, audioUrl={}", audioUrl);

                    TTSResponse ttsResponse = new TTSResponse();
                    ttsResponse.setVoiceUrl(audioUrl);
                    ttsResponse.setAudioFormat("mp3");
                    ttsResponse.setDuration(estimateDuration(request.getText()));
                    return ttsResponse;
                } else {
                    log.error("AliyunTTSProvider: Failed to extract audio URL from response");
                    return createMockResponse(request);
                }
            } else {
                log.error("AliyunTTSProvider: API call failed with status: {}", response.getStatusCode());
                return createMockResponse(request);
            }

        } catch (Exception e) {
            log.error("AliyunTTSProvider: Error during TTS synthesis", e);
            return createMockResponse(request);
        }
    }

    private Map<String, Object> buildRequestBody(TTSRequest request) {
        Map<String, Object> requestBody = new HashMap<>();

        // Model specification
        requestBody.put("model", request.getModel() != null ? request.getModel() : "qwen3-tts-flash");

        // Input - according to Aliyun API format
        Map<String, Object> input = new HashMap<>();
        input.put("text", request.getText() != null ? request.getText() : "");
        
        // Voice parameter
        if (request.getVoice() != null && !request.getVoice().isEmpty()) {
            input.put("voice", request.getVoice());
        }
        
        requestBody.put("input", input);

        // Parameters
        Map<String, Object> parameters = new HashMap<>();
        if (request.getLanguageType() != null && !request.getLanguageType().isEmpty()) {
            parameters.put("language_type", request.getLanguageType());
        }
        parameters.put("format", "mp3");
        requestBody.put("parameters", parameters);

        return requestBody;
    }

    @SuppressWarnings("unchecked")
    private String extractAudioUrl(Map<String, Object> responseBody) {
        // Extract audio URL from Aliyun API response
        // Response structure: {"output": {"audio": {"url": "..."}}}
        try {
            Map<String, Object> output = (Map<String, Object>) responseBody.get("output");
            if (output != null) {
                Map<String, Object> audio = (Map<String, Object>) output.get("audio");
                if (audio != null) {
                    Object url = audio.get("url");
                    if (url != null) {
                        return String.valueOf(url);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to extract audio URL from response", e);
        }
        return null;
    }

    private Integer estimateDuration(String text) {
        // Estimate audio duration: ~3-4 characters per second for Chinese
        if (text == null || text.isEmpty()) {
            return 0;
        }
        int charCount = text.length();
        return Math.max(1, charCount / 4);
    }

    private TTSResponse createMockResponse(TTSRequest request) {
        log.info("AliyunTTSProvider: Using mock response for text length: {}",
                request.getText() != null ? request.getText().length() : 0);

        TTSResponse response = new TTSResponse();
        response.setVoiceUrl("/api/mock/audio/qwen3_tts_" + System.currentTimeMillis() + ".mp3");
        response.setAudioFormat("mp3");
        response.setDuration(estimateDuration(request.getText()));
        return response;
    }
}
