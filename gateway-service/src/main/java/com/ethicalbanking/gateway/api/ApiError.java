package com.ethicalbanking.gateway.api;

import java.time.Instant;

/**
 * Simple structured error payload returned by {@link org.springframework.web.bind.annotation.ControllerAdvice}.
 */
public record ApiError(
		String message,
		String detail,
		String path,
		Instant timestamp) {

	public static ApiError of(String message, String detail, String path) {
		return new ApiError(message, detail, path, Instant.now());
	}
}

