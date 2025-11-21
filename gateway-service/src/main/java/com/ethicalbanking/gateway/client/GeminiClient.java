package com.ethicalbanking.gateway.client;

import java.util.Map;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class GeminiClient {

	private final WebClient geminiWebClient;

	public GeminiClient(@Qualifier("geminiWebClient") WebClient geminiWebClient) {
		this.geminiWebClient = geminiWebClient;
	}

	public String requestExplanation(String prompt, Map<String, Object> shapPayload) {
		// Placeholder integration — actual implementation should deserialize the API response
		return geminiWebClient.post()
				.uri("/v1beta/models/gemini-pro:generateContent")
				.contentType(MediaType.APPLICATION_JSON)
				.bodyValue(Map.of("prompt", prompt, "context", shapPayload))
				.retrieve()
				.bodyToMono(String.class)
				.onErrorReturn("Gemini service unavailable at the moment.")
				.block();
	}
}

