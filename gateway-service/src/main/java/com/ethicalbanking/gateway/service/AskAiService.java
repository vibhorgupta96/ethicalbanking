package com.ethicalbanking.gateway.service;

import com.ethicalbanking.gateway.client.AiInsightsClient;
import com.ethicalbanking.gateway.dto.AskAiRequest;
import com.ethicalbanking.gateway.dto.AskAiResponse;
import java.util.Map;
import java.util.Objects;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class AskAiService {

	private static final Logger log = LoggerFactory.getLogger(AskAiService.class);

	private final ConsentService consentService;
	private final AiInsightsClient aiInsightsClient;
	private final HuggingFaceService huggingFaceService;

	public AskAiService(ConsentService consentService,
			AiInsightsClient aiInsightsClient,
			HuggingFaceService huggingFaceService) {
		this.consentService = consentService;
		this.aiInsightsClient = aiInsightsClient;
		this.huggingFaceService = huggingFaceService;
	}

	@SuppressWarnings("unchecked")
	public AskAiResponse processQuestion(AskAiRequest request) {
		AskAiRequest safeRequest = Objects.requireNonNull(request, "Ask AI request must not be null");
		if (!consentService.hasValidConsent(safeRequest.getUserId(), safeRequest.getQuestion())) {
			log.warn("Consent check failed for user {}", safeRequest.getUserId());
			throw new IllegalStateException(
					"Consent verification failed for user %s".formatted(safeRequest.getUserId()));
		}

		Map<String, Object> featureSnapshot = safeRequest.getFeatureSnapshot() != null ? safeRequest.getFeatureSnapshot()
				: Map.of();
		log.debug("Forwarding Ask AI request for user {} with {} features", safeRequest.getUserId(),
				featureSnapshot.size());

		Map<String, Object> aiResponse = aiInsightsClient.requestExplanation(featureSnapshot);

		AskAiResponse response = new AskAiResponse();
		response.setShapValues((Map<String, Object>) aiResponse.getOrDefault("shap_values", Map.of()));
		response.setDecisionSummary((String) aiResponse.getOrDefault("decision", "undetermined"));
		response.setExplanation(
				huggingFaceService.craftExplanation(response.getDecisionSummary(), response.getShapValues()));
		log.info("Completed Ask AI request for user {} with decision {}", safeRequest.getUserId(),
				response.getDecisionSummary());
		return response;
	}
}

