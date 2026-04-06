package com.paiagent.engine.tts;

public interface TTSProvider {

    String getProviderKey();

    TTSResponse synthesize(TTSRequest request);
}
