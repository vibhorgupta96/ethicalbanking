package com.ethicalbanking.gateway.domain.consent;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "user_consents")
public class UserConsent {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String userExternalId;

	@Column(nullable = false, length = 512)
	private String consentHash;

	@Column(nullable = false)
	private Instant recordedAt = Instant.now();

	public Long getId() {
		return id;
	}

	public String getUserExternalId() {
		return userExternalId;
	}

	public void setUserExternalId(String userExternalId) {
		this.userExternalId = userExternalId;
	}

	public String getConsentHash() {
		return consentHash;
	}

	public void setConsentHash(String consentHash) {
		this.consentHash = consentHash;
	}

	public Instant getRecordedAt() {
		return recordedAt;
	}

	public void setRecordedAt(Instant recordedAt) {
		this.recordedAt = recordedAt;
	}
}

