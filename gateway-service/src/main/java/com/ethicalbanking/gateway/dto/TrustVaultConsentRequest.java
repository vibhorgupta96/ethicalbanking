package com.ethicalbanking.gateway.dto;

import jakarta.validation.constraints.NotBlank;

public class TrustVaultConsentRequest {

	@NotBlank
	private String consentPayload;

	public String getConsentPayload() {
		return consentPayload;
	}

	public void setConsentPayload(String consentPayload) {
		this.consentPayload = consentPayload;
	}
}

