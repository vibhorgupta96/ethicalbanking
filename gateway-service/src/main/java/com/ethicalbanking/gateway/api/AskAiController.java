package com.ethicalbanking.gateway.api;

import com.ethicalbanking.gateway.dto.AskAiRequest;
import com.ethicalbanking.gateway.dto.AskAiResponse;
import com.ethicalbanking.gateway.service.AskAiService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ask")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class AskAiController {

	private static final Logger log = LoggerFactory.getLogger(AskAiController.class);

	private final AskAiService askAiService;

	public AskAiController(AskAiService askAiService) {
		this.askAiService = askAiService;
	}

	@PostMapping
	public ResponseEntity<AskAiResponse> ask(@Valid @RequestBody AskAiRequest request) {
		log.info("Received Ask AI request for user {}", request.getUserId());
		AskAiResponse response = askAiService.processQuestion(request);
		return ResponseEntity.ok(response);
	}
}
