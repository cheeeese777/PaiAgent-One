package com.paiagent.engine.llm;

public interface LLMProvider {

    String getProviderKey();

    LLMResponse chat(LLMRequest request);
}
