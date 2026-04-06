package com.paiagent.common.util;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ExpressionUtil {

    private static final Pattern TEMPLATE_PATTERN = Pattern.compile("\\{\\{\\s*(\\w+)\\s*}}");
    private static final Pattern REF_PATTERN = Pattern.compile("^(.+)\\.(.+)$");

    /**
     * Resolve a reference expression like "超拟人音频合成.audioUrl"
     * Uses label-to-nodeId mapping and node output context.
     */
    public static Object resolveReference(String expression,
                                          Map<String, String> labelToNodeId,
                                          Map<String, Map<String, Object>> context) {
        Matcher m = REF_PATTERN.matcher(expression.trim());
        if (!m.matches()) {
            return null;
        }
        String label = m.group(1);
        String field = m.group(2);

        String nodeId = labelToNodeId.getOrDefault(label, label);
        Map<String, Object> nodeOutput = context.get(nodeId);
        if (nodeOutput == null) {
            return null;
        }
        return nodeOutput.get(field);
    }

    /**
     * Resolve a template string like "{{output}}" using output mappings.
     * outputMappings maps param names to resolved values.
     */
    public static String resolveTemplate(String template, Map<String, Object> outputMappings) {
        if (template == null || template.isEmpty()) {
            return "";
        }
        Matcher m = TEMPLATE_PATTERN.matcher(template);
        StringBuilder sb = new StringBuilder();
        while (m.find()) {
            String paramName = m.group(1);
            Object value = outputMappings.getOrDefault(paramName, "");
            m.appendReplacement(sb, Matcher.quoteReplacement(String.valueOf(value)));
        }
        m.appendTail(sb);
        return sb.toString();
    }
}
