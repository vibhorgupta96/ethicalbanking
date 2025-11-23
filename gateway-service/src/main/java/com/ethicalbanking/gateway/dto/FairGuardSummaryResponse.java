package com.ethicalbanking.gateway.dto;

import java.time.Instant;
import java.util.List;

public record FairGuardSummaryResponse(
		Instant generatedAt,
		int windowSize,
		DriftSnapshot drift,
		CircuitBreakerSnapshot circuitBreaker,
		List<String> alerts,
		List<DimensionSnapshot> dimensions,
		List<ShapWatch> shapWatchlist) {

	public record DriftSnapshot(double score, double threshold, String status) {
	}

	public record CircuitBreakerSnapshot(boolean active, String reason) {
	}

	public record DimensionSnapshot(
			String attribute,
			double parityGap,
			double threshold,
			String status,
			long sampleSize,
			List<GroupSnapshot> groups) {
	}

	public record GroupSnapshot(String value, long count, double approvalRate) {
	}

	public record ShapWatch(String feature, double weight) {
	}
}

