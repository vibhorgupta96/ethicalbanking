package com.ethicalbanking.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

	@Bean(name = "aiWebClient")
	public WebClient aiWebClient(@Value("${ai-service.base-url:http://localhost:5000}") String baseUrl) {
		return WebClient.builder()
				.baseUrl(baseUrl)
				.build();
	}

	@Bean(name = "geminiWebClient")
	public WebClient geminiWebClient(
			@Value("${gemini.base-url:https://generativelanguage.googleapis.com}") String baseUrl) {
		return WebClient.builder()
				.baseUrl(baseUrl)
				.build();
	}
}

