package com.ethicalbanking.gateway.api;

import com.ethicalbanking.gateway.dto.DecisionInsightResponse;
import com.ethicalbanking.gateway.service.DecisionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/decision")
public class DecisionController {

	private static final Logger log = LoggerFactory.getLogger(DecisionController.class);

	private final DecisionService decisionService;

	public DecisionController(DecisionService decisionService) {
		this.decisionService = decisionService;
	}

	@GetMapping("/{userId}")
	public ResponseEntity<DecisionInsightResponse> fetchDecisionInsight(@PathVariable String userId) {
		log.info("Fetching decision insight for {}", userId);
		return decisionService.buildInsightForUser(userId)
				.map(ResponseEntity::ok)
				.orElseGet(() -> ResponseEntity.notFound().build());
	}
}

