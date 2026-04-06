package com.paiagent.engine.llm;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LLMRequest {
    private String systemPrompt;
    private String userMessage;
    private String model;
    private Double temperature;
}
