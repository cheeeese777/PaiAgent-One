package com.paiagent.engine.tts;

import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;

@Component
public class TTSProviderFactory {

    private final ApplicationContext applicationContext;
    private final Map<String, TTSProvider> providers = new HashMap<>();

    public TTSProviderFactory(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    @PostConstruct
    public void init() {
        Map<String, TTSProvider> beans = applicationContext.getBeansOfType(TTSProvider.class);
        for (TTSProvider provider : beans.values()) {
            providers.put(provider.getProviderKey(), provider);
        }
    }

    public TTSProvider getProvider(String providerKey) {
        TTSProvider provider = providers.get(providerKey);
        if (provider == null) {
            // Fallback to aliyun provider
            provider = providers.get("aliyun");
        }
        return provider;
    }
}
