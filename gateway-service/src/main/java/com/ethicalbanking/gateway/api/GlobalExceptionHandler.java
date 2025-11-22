package com.ethicalbanking.gateway.api;

import com.ethicalbanking.gateway.client.ExternalServiceException;
import jakarta.servlet.http.HttpServletRequest;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

	private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiError> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest request) {
		log.warn("Validation failure at {}: {}", resolvePath(request), ex.getMessage());
		return ResponseEntity.badRequest()
				.body(ApiError.of("Validation failed", ex.getMessage(), resolvePath(request)));
	}

	@ExceptionHandler(IllegalStateException.class)
	public ResponseEntity<ApiError> handleIllegalState(IllegalStateException ex, HttpServletRequest request) {
		log.warn("Request rejected at {}: {}", resolvePath(request), ex.getMessage());
		return ResponseEntity.status(HttpStatus.CONFLICT)
				.body(ApiError.of("Request rejected", ex.getMessage(), resolvePath(request)));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiError> handleBeanValidation(MethodArgumentNotValidException ex,
			HttpServletRequest request) {
		String detail = ex.getBindingResult().getFieldErrors().stream()
				.map(error -> error.getField() + ": " + error.getDefaultMessage())
				.collect(Collectors.joining("; "));
		log.warn("Payload validation failed at {}: {}", resolvePath(request), detail);
		return ResponseEntity.badRequest()
				.body(ApiError.of("Validation failed", detail, resolvePath(request)));
	}

	@ExceptionHandler(ExternalServiceException.class)
	public ResponseEntity<ApiError> handleExternalService(ExternalServiceException ex, HttpServletRequest request) {
		log.error("Downstream service {} failed at {}: {}", ex.getServiceName(), resolvePath(request),
				ex.getMessage());
		return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
				.body(ApiError.of("Downstream service error",
						ex.getMessage(),
						resolvePath(request)));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiError> handleUnhandled(Exception ex, HttpServletRequest request) {
		log.error("Unexpected error at {}", resolvePath(request), ex);
		return ResponseEntity.internalServerError()
				.body(ApiError.of("Something went wrong",
						"An unexpected error occurred. Please retry later.",
						resolvePath(request)));
	}

	private String resolvePath(HttpServletRequest request) {
		return request != null ? request.getRequestURI() : "N/A";
	}
}

