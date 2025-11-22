package com.ethicalbanking.gateway.api;

import com.ethicalbanking.gateway.dto.TrustVaultConsentRequest;
import com.ethicalbanking.gateway.service.ConsentService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user/{userId}/trustvault")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class TrustVaultController {

	private static final Logger log = LoggerFactory.getLogger(TrustVaultController.class);

	private final ConsentService consentService;

	public TrustVaultController(ConsentService consentService) {
		this.consentService = consentService;
	}

	@PostMapping
	public ResponseEntity<Void> recordConsent(@PathVariable String userId,
			@Valid @RequestBody TrustVaultConsentRequest request) {
		log.info("Recording TrustVault consent via API for user {}", userId);
		consentService.recordConsent(userId, request);
		return ResponseEntity.accepted().build();
	}
}
