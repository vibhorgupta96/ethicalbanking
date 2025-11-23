package com.ethicalbanking.gateway.dto;

import java.util.Map;

public class AskAiResponse {

	private String decisionSummary;
	private String explanation;
	private Map<String, Object> shapValues;
	private Map<String, Object> fairGuard;

	public String getDecisionSummary() {
		return decisionSummary;
	}

	public void setDecisionSummary(String decisionSummary) {
		this.decisionSummary = decisionSummary;
	}

	public String getExplanation() {
		return explanation;
	}

	public void setExplanation(String explanation) {
		this.explanation = explanation;
	}

	public Map<String, Object> getShapValues() {
		return shapValues;
	}

	public void setShapValues(Map<String, Object> shapValues) {
		this.shapValues = shapValues;
	}

	public Map<String, Object> getFairGuard() {
		return fairGuard;
	}

	public void setFairGuard(Map<String, Object> fairGuard) {
		this.fairGuard = fairGuard;
	}
}

