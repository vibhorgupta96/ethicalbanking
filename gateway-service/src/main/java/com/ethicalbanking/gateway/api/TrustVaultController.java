package com.ethicalbanking.gateway.api;

import com.ethicalbanking.gateway.dto.TrustVaultConsentRequest;
import com.ethicalbanking.gateway.service.ConsentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user/{userId}/trustvault")
public class TrustVaultController {

	private final ConsentService consentService;

	public TrustVaultController(ConsentService consentService) {
		this.consentService = consentService;
	}

	@PostMapping
	public ResponseEntity<Void> recordConsent(@PathVariable String userId,
			@RequestBody TrustVaultConsentRequest request) {
		consentService.recordConsent(userId, request);
		return ResponseEntity.accepted().build();
	}
}

