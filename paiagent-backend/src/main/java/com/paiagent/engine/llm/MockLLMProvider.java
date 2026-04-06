package com.paiagent.engine.llm;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class MockLLMProvider implements LLMProvider {

    @Override
    public String getProviderKey() {
        return "mock";
    }

    @Override
    public LLMResponse chat(LLMRequest request) {
        try {
            // Simulate network latency
            Thread.sleep(800);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        String prompt = request.getUserMessage();
        String summary = prompt.length() > 50 ? prompt.substring(0, 50) + "..." : prompt;
        String model = request.getModel() != null ? request.getModel() : "mock-model";

        String responseText = "这是来自 " + model + " 的模拟回复。\n\n" +
                "您的输入: " + summary + "\n\n" +
                "模拟回复内容: 根据您的输入，我为您生成了一段精彩的AI播客内容。" +
                "这段内容涵盖了人工智能的最新发展趋势，包括大模型技术的突破、" +
                "多模态能力的提升，以及AI在各行各业的创新应用。";

        log.info("MockLLMProvider generated response for model: {}", model);
        return new LLMResponse(responseText, responseText.length());
    }
}
