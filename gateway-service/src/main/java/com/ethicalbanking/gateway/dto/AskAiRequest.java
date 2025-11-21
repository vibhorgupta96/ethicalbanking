package com.ethicalbanking.gateway.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.Map;

public class AskAiRequest {

	@NotBlank
	private String userId;

	@NotBlank
	private String question;

	private Map<String, Object> featureSnapshot;

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public String getQuestion() {
		return question;
	}

	public void setQuestion(String question) {
		this.question = question;
	}

	public Map<String, Object> getFeatureSnapshot() {
		return featureSnapshot;
	}

	public void setFeatureSnapshot(Map<String, Object> featureSnapshot) {
		this.featureSnapshot = featureSnapshot;
	}
}

