package com.paiagent.engine.llm;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@ConditionalOnProperty(name = "paiagent.llm.deepseek.api-key", havingValue = "", matchIfMissing = false)
public class DeepSeekLLMProvider implements LLMProvider {

    private final String apiKey;
    private final String apiUrl;
    private final String defaultModel;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public DeepSeekLLMProvider(
            @Value("${paiagent.llm.deepseek.api-key}") String apiKey,
            @Value("${paiagent.llm.deepseek.api-url:https://api.deepseek.com/v1/chat/completions}") String apiUrl,
            @Value("${paiagent.llm.deepseek.default-model:deepseek-chat}") String defaultModel) {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.defaultModel = defaultModel;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public String getProviderKey() {
        return "deepseek";
    }

    @Override
    public LLMResponse chat(LLMRequest request) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            log.warn("DeepSeek API key not configured, using mock response");
            return createMockResponse(request);
        }

        try {
            // Build request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", request.getModel() != null ? request.getModel() : defaultModel);
            
            List<Map<String, String>> messages = new java.util.ArrayList<>();
            if (request.getSystemPrompt() != null && !request.getSystemPrompt().isEmpty()) {
                Map<String, String> systemMsg = new HashMap<>();
                systemMsg.put("role", "system");
                systemMsg.put("content", request.getSystemPrompt());
                messages.add(systemMsg);
            }
            
            Map<String, String> userMsg = new HashMap<>();
            userMsg.put("role", "user");
            userMsg.put("content", request.getUserMessage());
            messages.add(userMsg);
            
            requestBody.put("messages", messages);
            requestBody.put("temperature", request.getTemperature() != null ? request.getTemperature() : 0.7);

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            log.info("Calling DeepSeek API with model: {}", requestBody.get("model"));
            
            // Call API
            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, entity, String.class);
            
            // Parse response
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode choices = root.get("choices");
            
            if (choices != null && choices.isArray() && choices.size() > 0) {
                String content = choices.get(0).get("message").get("content").asText();
                
                // Get token usage if available
                int tokenCount = 0;
                JsonNode usage = root.get("usage");
                if (usage != null) {
                    tokenCount = usage.get("total_tokens").asInt(0);
                } else {
                    tokenCount = content.length(); // Fallback
                }
                
                log.info("DeepSeek response received, tokens: {}", tokenCount);
                return new LLMResponse(content, tokenCount);
            } else {
                throw new RuntimeException("Invalid DeepSeek API response format");
            }
            
        } catch (Exception e) {
            log.error("Failed to call DeepSeek API", e);
            throw new RuntimeException("DeepSeek API 调用失败: " + e.getMessage(), e);
        }
    }

    private LLMResponse createMockResponse(LLMRequest request) {
        try {
            Thread.sleep(800);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        String prompt = request.getUserMessage();
        String summary = prompt.length() > 50 ? prompt.substring(0, 50) + "..." : prompt;
        String model = request.getModel() != null ? request.getModel() : defaultModel;

        String responseText = "这是来自 " + model + " 的模拟回复（API Key 未配置）。\n\n" +
                "您的输入: " + summary + "\n\n" +
                "请在 application.yml 中配置 paiagent.llm.deepseek.api-key 以使用真实的 DeepSeek API。";

        return new LLMResponse(responseText, responseText.length());
    }
}
