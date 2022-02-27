package io.castled.apps.connectors.restapi;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.github.mustachejava.DefaultMustacheFactory;
import com.google.common.collect.Lists;
import io.castled.utils.JsonUtils;
import io.castled.utils.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;

import javax.ws.rs.BadRequestException;
import java.io.StringReader;
import java.io.StringWriter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class MustacheJsonParser {

    private static final char TEMPLATE_START = '{';
    private static final char TEMPLATE_END = '}';

    public String resolveTemplateString(String mustacheTemplate, Map<String, Object> inputMap) {

        String cleanedTemplate = cleanMustacheJson(mustacheTemplate);
        StringWriter writer = new StringWriter();
        for (int i = 0; i < cleanedTemplate.length(); i++) {
            if (cleanedTemplate.charAt(i) == TEMPLATE_START && cleanedTemplate.charAt(i + 1) == TEMPLATE_START) {
                StringWriter templateVariable = new StringWriter();
                for (int j = i + 2; j < cleanedTemplate.length(); j++) {
                    if (cleanedTemplate.charAt(j) == TEMPLATE_END && cleanedTemplate.charAt(j + 1) == TEMPLATE_END) {
                        Object templateValue = inputMap.get(templateVariable.toString());
                        if (templateValue instanceof String) {
                            writer.append(StringUtils.quoteText((String) templateValue));
                        } else {
                            writer.append(templateValue.toString());
                        }
                        i = j + 1;
                        break;
                    }
                    templateVariable.append(cleanedTemplate.charAt(j));
                }
                continue;
            }
            writer.append(cleanedTemplate.charAt(i));
        }
        return writer.toString();
    }

    public Map<String, Object> resolveTemplate(String mustacheTemplate, Map<String, Object> inputMap) {
        return JsonUtils.jsonStringToMap(resolveTemplateString(mustacheTemplate, inputMap));
    }

    public List<String> getTemplateVariables(String mustacheTemplate) {
        String cleanedTemplate = mustacheTemplate.replaceAll("\\s+", "");
        List<String> templateVariables = Lists.newArrayList();
        for (int i = 0; i < cleanedTemplate.length(); i++) {
            if (i == cleanedTemplate.length() - 1) {
                return templateVariables;
            }
            if (cleanedTemplate.charAt(i) == TEMPLATE_START && cleanedTemplate.charAt(i + 1) == TEMPLATE_START) {
                StringWriter templateVariable = new StringWriter();
                for (int j = i + 2; j < cleanedTemplate.length(); j++) {
                    if (cleanedTemplate.charAt(j) == TEMPLATE_END && cleanedTemplate.charAt(j + 1) == TEMPLATE_END) {
                        templateVariables.add(templateVariable.toString());
                        i = j + 1;
                        break;
                    }
                    templateVariable.append(cleanedTemplate.charAt(j));
                }
            }
        }
        return templateVariables;
    }

    public void getRecordTemplate(String bulkJson, String arrayPath) {
        String cleanedJson = cleanMustacheJson(bulkJson);
        List<String> templateVariables = getTemplateVariables(bulkJson);
        Map<String, Object> valuesMap = templateVariables.stream().collect(Collectors.toMap(template -> template,
                template -> String.format("{{%s}}", template)));
        JsonNode jsonNode = JsonUtils.jsonStringToJsonNode(resolveTemplateString(cleanedJson, valuesMap));
        for (String token : arrayPath.split("\\.")) {
            jsonNode = jsonNode.get(token);
        }
        if (!jsonNode.isArray()) {
            throw new BadRequestException("Invalid Bulk Json");
        }
        ArrayNode arrayNode = (ArrayNode) jsonNode;
        if (arrayNode.size() == 0) {
            throw new BadRequestException("No elements in array node");
        }
        if (arrayNode.size() > 1) {
            throw new BadRequestException("length should be 1");
        }
        JsonNode templateNode = arrayNode.get(0);
        if (!templateNode.isObject()) {
            throw new BadRequestException("should be object");
        }
        String templateJson = cleanMustacheJson(templateNode.toString());
        System.out.println(templateJson);

        String templateArrayJson = cleanMustacheJson(arrayNode.toString());
        System.out.println(templateArrayJson);
        int templateArrayIndex = cleanedJson.indexOf(templateArrayJson);
        String templateArrayPrefix = cleanedJson.substring(0, templateArrayIndex);
        System.out.println(templateArrayPrefix);
        String templateArraySuffix = cleanedJson.substring(templateArrayIndex + templateArrayJson.length());
        String constructedJson = String.format("%s%s%s", templateArrayPrefix, templateArrayJson, templateArraySuffix);
        System.out.println(cleanedJson.equals(constructedJson));


    }

    public  String cleanMustacheJson(String mustacheJson) {
        mustacheJson = mustacheJson.replaceAll("\\s+", "");
        StringWriter cleanedJson = new StringWriter();
        for (int i = 0; i < mustacheJson.length(); i++) {
            if (mustacheJson.charAt(i) == '"') {
                if (i < mustacheJson.length() - 2 && mustacheJson.charAt(i + 1) == '{' && mustacheJson.charAt(i + 2) == '{') {
                    continue;
                }
                if (i >= 2 && mustacheJson.charAt(i - 1) == '}' && mustacheJson.charAt(i - 2) == '}') {
                    continue;
                }
            }
            cleanedJson.append(mustacheJson.charAt(i));
        }
        return cleanedJson.toString();

    }

    public  void validateMustacheJson(String mustacheJson) {
        validatePayload(mustacheJson);
        List<String> templateVariables = getTemplateVariables(mustacheJson);
        Map<String, Object> valuesMap = templateVariables.stream().collect(Collectors.toMap(template -> template, template -> "dummy"));
        try {
            resolveTemplate(mustacheJson, valuesMap);
        } catch (Exception e) {
            if (ExceptionUtils.getRootCause(e) instanceof JsonParseException)
                throw new BadRequestException("Json Invalid");
        }
    }


    public  void validatePayload(String payloadTemplate) {
        try {
            new DefaultMustacheFactory().compile(new StringReader(payloadTemplate), "template.output");
        } catch (com.github.mustachejava.MustacheException e) {
            throw new BadRequestException(e.getMessage());
        }
    }
}
