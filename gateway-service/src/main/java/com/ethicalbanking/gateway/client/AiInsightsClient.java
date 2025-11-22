package com.ethicalbanking.gateway.client;

import java.time.Duration;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Component
public class AiInsightsClient {

	private static final Logger log = LoggerFactory.getLogger(AiInsightsClient.class);

	private final WebClient aiWebClient;

	public AiInsightsClient(@Qualifier("aiWebClient") WebClient aiWebClient) {
		this.aiWebClient = aiWebClient;
	}

	@SuppressWarnings("unchecked")
	public Map<String, Object> requestExplanation(Map<String, Object> payload) {
		Map<String, Object> safePayload = payload != null ? payload : Map.of();
		try {
			log.debug("Requesting explanation from AI backend with {} features", safePayload.size());
			Map<String, Object> responseBody = aiWebClient.post()
					.uri("/explain")
					.contentType(MediaType.APPLICATION_JSON)
					.bodyValue(safePayload)
					.retrieve()
					.bodyToMono(Map.class)
					.timeout(Duration.ofSeconds(10))
					.blockOptional()
					.orElseThrow(() -> new ExternalServiceException("AI Insights",
							"AI backend returned an empty response."));
			log.debug("Received explanation response containing keys {}", responseBody.keySet());
			return responseBody;
		}
		catch (WebClientResponseException ex) {
			log.error("AI backend responded with {}: {}", ex.getStatusCode(), ex.getResponseBodyAsString(), ex);
			throw new ExternalServiceException("AI Insights",
					"AI backend responded with status %s".formatted(ex.getStatusCode()),
					ex);
		}
		catch (ExternalServiceException ex) {
			throw ex;
		}
		catch (Exception ex) {
			log.error("AI backend call failed", ex);
			throw new ExternalServiceException("AI Insights", "AI backend is unavailable", ex);
		}
	}
}

