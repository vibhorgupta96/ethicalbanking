package com.ethicalbanking.gateway.api;

import com.ethicalbanking.gateway.dto.AskAiRequest;
import com.ethicalbanking.gateway.dto.AskAiResponse;
import com.ethicalbanking.gateway.service.AskAiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ask")
public class AskAiController {

	private final AskAiService askAiService;

	public AskAiController(AskAiService askAiService) {
		this.askAiService = askAiService;
	}

	@PostMapping
	public ResponseEntity<AskAiResponse> ask(@RequestBody AskAiRequest request) {
		return ResponseEntity.ok(askAiService.processQuestion(request));
	}
}

