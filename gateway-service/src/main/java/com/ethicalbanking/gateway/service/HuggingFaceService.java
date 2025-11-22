package com.ethicalbanking.gateway.service;

import com.ethicalbanking.gateway.client.ExternalServiceException;
import com.ethicalbanking.gateway.client.HuggingFaceClient;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class HuggingFaceService {

	private static final Logger log = LoggerFactory.getLogger(HuggingFaceService.class);

	private final HuggingFaceClient huggingFaceClient;
	private final ObjectMapper objectMapper;
	private final String systemPrompt;

	public HuggingFaceService(HuggingFaceClient huggingFaceClient,
			ObjectMapper objectMapper,
			@Value("${huggingface.system-prompt:You are an ethical banking assistant.}") String systemPrompt) {
		this.huggingFaceClient = huggingFaceClient;
		this.objectMapper = objectMapper;
		this.systemPrompt = systemPrompt;
	}

	public String craftExplanation(String decision, Map<String, Object> shapValues) {
		try {
			String shapJson = objectMapper.writeValueAsString(shapValues != null ? shapValues : Map.of());
			String userPrompt = """
					Decision summary: %s
					Explain the model decision in accessible language using the following SHAP data:
					%s""".formatted(decision, shapJson);
			log.debug("Requesting explanation for decision '{}'", decision);
			return huggingFaceClient.requestExplanation(systemPrompt, userPrompt);
		}
		catch (JsonProcessingException e) {
			log.error("Failed to serialize SHAP payload", e);
			return "Unable to serialize SHAP payload for Hugging Face.";
		}
		catch (ExternalServiceException e) {
			log.warn("Falling back due to Hugging Face issue: {}", e.getMessage());
			return "Hugging Face service unavailable at the moment.";
		}
	}
}


