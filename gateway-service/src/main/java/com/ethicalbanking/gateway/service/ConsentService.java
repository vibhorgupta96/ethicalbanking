package com.ethicalbanking.gateway.service;

import com.ethicalbanking.gateway.domain.consent.UserConsent;
import com.ethicalbanking.gateway.dto.TrustVaultConsentRequest;
import com.ethicalbanking.gateway.repository.UserConsentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConsentService {

	private final UserConsentRepository consentRepository;
	private final HashService hashService;

	public ConsentService(UserConsentRepository consentRepository, HashService hashService) {
		this.consentRepository = consentRepository;
		this.hashService = hashService;
	}

	@Transactional
	public void recordConsent(String userId, TrustVaultConsentRequest request) {
		UserConsent consent = new UserConsent();
		consent.setUserExternalId(userId);
		consent.setConsentHash(hashService.sha256(request.getConsentPayload()));
		consentRepository.save(consent);
	}

	public boolean hasValidConsent(String userId, String payload) {
		return consentRepository.findTopByUserExternalIdOrderByRecordedAtDesc(userId)
				.map(UserConsent::getConsentHash)
				.map(stored -> stored.equals(hashService.sha256(payload)))
				.orElse(false);
	}
}

