package com.ethicalbanking.gateway.client;

import java.time.Duration;
import java.util.Map;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
public class AiInsightsClient {

	private final WebClient aiWebClient;

	public AiInsightsClient(@Qualifier("aiWebClient") WebClient aiWebClient) {
		this.aiWebClient = aiWebClient;
	}

	public Map<String, Object> requestExplanation(Map<String, Object> payload) {
		// Placeholder synchronous call — can be moved to reactive later
		return aiWebClient.post()
				.uri("/explain")
				.contentType(MediaType.APPLICATION_JSON)
				.bodyValue(payload)
				.retrieve()
				.bodyToMono(Map.class)
				.timeout(Duration.ofSeconds(10))
				.onErrorResume(throwable -> Mono.just(Map.of("error", throwable.getMessage())))
				.blockOptional()
				.orElse(Map.of("error", "No response from AI backend"));
	}
}

