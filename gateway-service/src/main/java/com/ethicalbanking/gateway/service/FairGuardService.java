package com.ethicalbanking.gateway.service;

import com.ethicalbanking.gateway.client.FairGuardClient;
import com.ethicalbanking.gateway.dto.FairGuardSummaryResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.locks.ReentrantLock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class FairGuardService {

	private static final Logger log = LoggerFactory.getLogger(FairGuardService.class);
	private static final Duration CACHE_TTL = Duration.ofSeconds(15);

	private final FairGuardClient client;
	private final ReentrantLock lock = new ReentrantLock();

	private FairGuardSummaryResponse cachedSummary;
	private Instant cacheExpiry = Instant.EPOCH;

	public FairGuardService(FairGuardClient client) {
		this.client = client;
	}

	public FairGuardSummaryResponse fetchSummary() {
		Instant now = Instant.now();
		if (cachedSummary != null && cacheExpiry.isAfter(now)) {
			return cachedSummary;
		}

		lock.lock();
		try {
			now = Instant.now();
			if (cachedSummary != null && cacheExpiry.isAfter(now)) {
				return cachedSummary;
			}

			cachedSummary = client.fetchSummary();
			cacheExpiry = now.plus(CACHE_TTL);
			log.debug("FairGuard summary refreshed at {}", cachedSummary.generatedAt());
			return cachedSummary;
		}
		finally {
			lock.unlock();
		}
	}

	public FairGuardSummaryResponse triggerSimulation() {
		lock.lock();
		try {
			// Trigger simulation and update cache immediately
			cachedSummary = client.triggerSimulation();
			cacheExpiry = Instant.now().plus(CACHE_TTL);
			return cachedSummary;
		} finally {
			lock.unlock();
		}
	}

	public void evictCache() {
		lock.lock();
		try {
			cacheExpiry = Instant.EPOCH;
		}
		finally {
			lock.unlock();
		}
	}
}

