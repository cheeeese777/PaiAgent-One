package com.paiagent.engine.llm;

import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;

@Component
public class LLMProviderFactory {

    private final ApplicationContext applicationContext;
    private final Map<String, LLMProvider> providers = new HashMap<>();

    public LLMProviderFactory(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    @PostConstruct
    public void init() {
        Map<String, LLMProvider> beans = applicationContext.getBeansOfType(LLMProvider.class);
        for (LLMProvider provider : beans.values()) {
            providers.put(provider.getProviderKey(), provider);
        }
    }

    public LLMProvider getProvider(String providerKey) {
        LLMProvider provider = providers.get(providerKey);
        if (provider == null) {
            // Fallback to mock provider
            provider = providers.get("mock");
        }
        return provider;
    }
}
