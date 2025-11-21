package com.ethicalbanking.gateway.service;

import com.ethicalbanking.gateway.client.AiInsightsClient;
import com.ethicalbanking.gateway.dto.AskAiRequest;
import com.ethicalbanking.gateway.dto.AskAiResponse;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class AskAiService {

	private final ConsentService consentService;
	private final AiInsightsClient aiInsightsClient;
	private final GeminiService geminiService;

	public AskAiService(ConsentService consentService,
			AiInsightsClient aiInsightsClient,
			GeminiService geminiService) {
		this.consentService = consentService;
		this.aiInsightsClient = aiInsightsClient;
		this.geminiService = geminiService;
	}

	public AskAiResponse processQuestion(AskAiRequest request) {
		if (!consentService.hasValidConsent(request.getUserId(), request.getQuestion())) {
			throw new IllegalStateException("Consent verification failed for user %s".formatted(request.getUserId()));
		}

		Map<String, Object> aiResponse = aiInsightsClient.requestExplanation(
				request.getFeatureSnapshot() != null ? request.getFeatureSnapshot() : Map.of());

		AskAiResponse response = new AskAiResponse();
		response.setShapValues((Map<String, Object>) aiResponse.getOrDefault("shap_values", Map.of()));
		response.setDecisionSummary((String) aiResponse.getOrDefault("decision", "undetermined"));
		response.setExplanation(
				geminiService.craftExplanation(response.getDecisionSummary(), response.getShapValues()));
		return response;
	}
}

