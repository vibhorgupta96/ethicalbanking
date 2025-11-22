package com.ethicalbanking.gateway.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record DecisionInsightResponse(
		String userId,
		String fullName,
		String segment,
		DecisionSummary decision,
		List<DecisionDriver> drivers,
		String counterfactual) {

	public record DecisionSummary(
			String productType,
			BigDecimal requestedAmount,
			String decision,
			LocalDate decisionDate,
			String rationale) {
	}
}

