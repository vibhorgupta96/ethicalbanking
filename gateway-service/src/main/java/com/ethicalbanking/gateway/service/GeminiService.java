package com.ethicalbanking.gateway.service;

import com.ethicalbanking.gateway.client.GeminiClient;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class GeminiService {

	private final GeminiClient geminiClient;
	private final ObjectMapper objectMapper;
	private final String systemPrompt;

	public GeminiService(GeminiClient geminiClient,
			ObjectMapper objectMapper,
			@Value("${gemini.system-prompt:You are an ethical banking assistant.}") String systemPrompt) {
		this.geminiClient = geminiClient;
		this.objectMapper = objectMapper;
		this.systemPrompt = systemPrompt;
	}

	public String craftExplanation(String decision, Map<String, Object> shapValues) {
		try {
			String shapJson = objectMapper.writeValueAsString(shapValues);
			String userPrompt = "My loan was " + decision + ". Technical explanation: " + shapJson;
			return geminiClient.requestExplanation(systemPrompt + "\n" + userPrompt, shapValues);
		}
		catch (JsonProcessingException e) {
			return "Unable to serialize SHAP payload for Gemini.";
		}
	}
}

