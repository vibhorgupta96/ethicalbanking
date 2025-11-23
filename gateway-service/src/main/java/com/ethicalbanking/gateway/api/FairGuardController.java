package com.ethicalbanking.gateway.api;

import com.ethicalbanking.gateway.dto.FairGuardSummaryResponse;
import com.ethicalbanking.gateway.service.FairGuardService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/fairguard")
public class FairGuardController {

	private static final Logger log = LoggerFactory.getLogger(FairGuardController.class);

	private final FairGuardService fairGuardService;

	public FairGuardController(FairGuardService fairGuardService) {
		this.fairGuardService = fairGuardService;
	}

	@GetMapping("/summary")
	public ResponseEntity<FairGuardSummaryResponse> getSummary() {
		log.info("Fetching FairGuard governance summary");
		return ResponseEntity.ok(fairGuardService.fetchSummary());
	}
}

