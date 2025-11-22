package com.ethicalbanking.gateway.dto;

public record DecisionDriver(
		String key,
		String label,
		String value,
		double impact) {
}

