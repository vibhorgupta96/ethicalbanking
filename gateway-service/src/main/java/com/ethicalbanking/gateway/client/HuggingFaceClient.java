package com.ethicalbanking.gateway.client;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Component
public class HuggingFaceClient {

	private static final String ERROR_FIELD = "error";
	private static final String CHOICES_FIELD = "choices";
	private static final String CONTENT_FIELD = "content";

	private static final Logger log = LoggerFactory.getLogger(HuggingFaceClient.class);

	private final WebClient huggingFaceWebClient;
	private final ObjectMapper objectMapper;
	private final String modelId;

	public HuggingFaceClient(@Qualifier("huggingFaceWebClient") WebClient huggingFaceWebClient,
			ObjectMapper objectMapper,
			@Value("${huggingface.model:mistralai/Mistral-7B-Instruct-v0.2}") String modelId) {
		this.huggingFaceWebClient = huggingFaceWebClient;
		this.objectMapper = objectMapper;
		this.modelId = modelId;
	}

	public String requestExplanation(String systemPrompt, String userPrompt) {
		Map<String, Object> payload = Map.of(
				"model", modelId,
				"messages", List.of(
						Map.of("role", "system", CONTENT_FIELD, systemPrompt),
						Map.of("role", "user", CONTENT_FIELD, userPrompt)),
				"stream", Boolean.FALSE);

		try {
			log.debug("Requesting Hugging Face explanation using model {}", modelId);
			String rawResponse = huggingFaceWebClient.post()
					.uri("/v1/chat/completions")
					.contentType(MediaType.APPLICATION_JSON)
					.bodyValue(payload)
					.retrieve()
					.bodyToMono(String.class)
					.timeout(Duration.ofSeconds(20))
					.block();

			String generatedText = extractGeneratedText(rawResponse);
			log.debug("Hugging Face response generated {} characters", generatedText.length());
			return generatedText;
		}
		catch (WebClientResponseException ex) {
			log.error("Hugging Face API error {}: {}", ex.getStatusCode(), ex.getResponseBodyAsString(), ex);
			throw new ExternalServiceException("Hugging Face",
					"Hugging Face API responded with status %s".formatted(ex.getStatusCode()),
					ex);
		}
		catch (ExternalServiceException ex) {
			throw ex;
		}
		catch (JsonProcessingException ex) {
			log.error("Failed to parse Hugging Face response", ex);
			throw new ExternalServiceException("Hugging Face", "Unable to parse Hugging Face response", ex);
		}
		catch (Exception ex) {
			log.error("Unexpected Hugging Face failure", ex);
			throw new ExternalServiceException("Hugging Face", "Hugging Face service is unavailable", ex);
		}
	}

	private String extractGeneratedText(String rawResponse) throws JsonProcessingException {
		if (rawResponse == null || rawResponse.isBlank()) {
			throw new ExternalServiceException("Hugging Face", "Hugging Face returned an empty response.");
		}

		JsonNode rootNode = objectMapper.readTree(rawResponse);

		if (rootNode.has(CHOICES_FIELD) && rootNode.get(CHOICES_FIELD).isArray()
				&& rootNode.get(CHOICES_FIELD).size() > 0) {
			JsonNode messageNode = rootNode.get(CHOICES_FIELD).get(0).path("message");
			if (messageNode.hasNonNull(CONTENT_FIELD)) {
				return messageNode.get(CONTENT_FIELD).asText().trim();
			}
		}
		if (rootNode.has(ERROR_FIELD)) {
			throw new ExternalServiceException("Hugging Face",
					"Hugging Face API error: " + rootNode.get(ERROR_FIELD).asText());
		}

		throw new ExternalServiceException("Hugging Face", "Unable to parse Hugging Face response.");
	}
}


