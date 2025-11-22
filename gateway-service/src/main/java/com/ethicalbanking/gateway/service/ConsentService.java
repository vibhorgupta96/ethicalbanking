package com.ethicalbanking.gateway.service;

import com.ethicalbanking.gateway.domain.consent.UserConsent;
import com.ethicalbanking.gateway.dto.TrustVaultConsentRequest;
import com.ethicalbanking.gateway.repository.UserConsentRepository;
import java.util.Objects;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConsentService {

	private static final Logger log = LoggerFactory.getLogger(ConsentService.class);

	private final UserConsentRepository consentRepository;
	private final HashService hashService;

	public ConsentService(UserConsentRepository consentRepository, HashService hashService) {
		this.consentRepository = consentRepository;
		this.hashService = hashService;
	}

	@Transactional
	public void recordConsent(String userId, TrustVaultConsentRequest request) {
		log.info("Recording TrustVault consent for user {}", userId);
		TrustVaultConsentRequest safeRequest = Objects.requireNonNull(request,
				"TrustVault consent request must not be null");
		String payload = Objects.requireNonNull(safeRequest.getConsentPayload(), "Consent payload must not be null");
		UserConsent consent = new UserConsent();
		consent.setUserExternalId(userId);
		consent.setConsentHash(hashService.sha256(payload));
		consentRepository.save(consent);
		log.debug("Consent persisted for user {}", userId);
	}

	public boolean hasValidConsent(String userId, String payload) {
		boolean hasConsent = consentRepository.findTopByUserExternalIdOrderByRecordedAtDesc(userId)
				.map(UserConsent::getConsentHash)
				.map(stored -> stored.equals(hashService.sha256(payload)))
				.orElse(false);
		log.debug("Consent validation for user {} => {}", userId, hasConsent);
		return hasConsent;
	}
}
