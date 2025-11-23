package com.ethicalbanking.gateway.client;

import com.ethicalbanking.gateway.dto.FairGuardSummaryResponse;
import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Component
public class FairGuardClient {

	private static final Logger log = LoggerFactory.getLogger(FairGuardClient.class);

	private final WebClient aiWebClient;

	public FairGuardClient(@Qualifier("aiWebClient") WebClient aiWebClient) {
		this.aiWebClient = aiWebClient;
	}

	public FairGuardSummaryResponse fetchSummary() {
		try {
			log.debug("Requesting FairGuardAI governance summary from AI backend");
			return aiWebClient.get()
					.uri("/monitor/fairguard")
					.accept(MediaType.APPLICATION_JSON)
					.retrieve()
					.bodyToMono(FairGuardSummaryResponse.class)
					.timeout(Duration.ofSeconds(5))
					.blockOptional()
					.orElseThrow(() -> new ExternalServiceException("AI FairGuard",
							"AI backend did not return a FairGuard summary."));
		}
		catch (WebClientResponseException ex) {
			log.error("FairGuard endpoint responded with {}: {}", ex.getStatusCode(), ex.getResponseBodyAsString(),
					ex);
			throw new ExternalServiceException("AI FairGuard",
					"AI backend responded with status %s".formatted(ex.getStatusCode()),
					ex);
		}
		catch (ExternalServiceException ex) {
			throw ex;
		}
		catch (Exception ex) {
			log.error("FairGuard summary request failed", ex);
			throw new ExternalServiceException("AI FairGuard", "FairGuard endpoint is unavailable", ex);
		}
	}

	public FairGuardSummaryResponse triggerSimulation() {
		try {
			log.info("Triggering FairGuardAI simulation on AI backend");
			return aiWebClient.post()
					.uri("/monitor/fairguard/simulate")
					.contentType(MediaType.APPLICATION_JSON)
					.accept(MediaType.APPLICATION_JSON)
					.retrieve()
					.bodyToMono(FairGuardSummaryResponse.class)
					.timeout(Duration.ofSeconds(10))
					.blockOptional()
					.orElseThrow(() -> new ExternalServiceException("AI FairGuard",
							"AI backend did not return a summary after simulation."));
		} catch (Exception ex) {
			log.error("FairGuard simulation request failed", ex);
			throw new ExternalServiceException("AI FairGuard", "Simulation trigger failed", ex);
		}
	}
}

