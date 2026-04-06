package com.paiagent.engine.executor;

import com.paiagent.common.util.ExpressionUtil;
import com.paiagent.engine.ExecutionContext;
import com.paiagent.engine.NodeExecutor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class OutputNodeExecutor implements NodeExecutor {

    @Override
    public String getType() {
        return "OUTPUT";
    }

    @Override
    @SuppressWarnings("unchecked")
    public Map<String, Object> execute(String nodeId, Map<String, Object> nodeData, ExecutionContext context) {
        Map<String, Object> resolvedOutputs = new HashMap<>();

        // Process output mappings: [{name: "output", mode: "reference", value: "超拟人音频合成.audioUrl"}]
        Object mappingsObj = nodeData.get("outputMappings");
        if (mappingsObj instanceof List<?> mappings) {
            for (Object item : mappings) {
                if (item instanceof Map<?, ?> mapping) {
                    String name = String.valueOf(mapping.get("name"));
                    Object modeObj = mapping.get("mode");
                    String mode = modeObj != null ? String.valueOf(modeObj) : "reference";
                    String value = String.valueOf(mapping.get("value"));

                    if ("reference".equals(mode)) {
                        Object resolved = context.resolveReference(value);
                        resolvedOutputs.put(name, resolved != null ? resolved : "");
                    } else {
                        resolvedOutputs.put(name, value);
                    }
                }
            }
        }

        // Process response template: "{{output}}"
        String responseTemplate = (String) nodeData.getOrDefault("responseTemplate", "");
        String finalResponse = ExpressionUtil.resolveTemplate(responseTemplate, resolvedOutputs);

        Map<String, Object> outputs = new HashMap<>(resolvedOutputs);
        outputs.put("__response__", finalResponse);

        log.info("OutputNode [{}] produced response: {}", nodeId,
                finalResponse.length() > 100 ? finalResponse.substring(0, 100) + "..." : finalResponse);

        return outputs;
    }
}
