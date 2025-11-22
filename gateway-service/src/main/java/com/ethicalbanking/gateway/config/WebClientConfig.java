package com.ethicalbanking.gateway.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

	private static final Logger log = LoggerFactory.getLogger(WebClientConfig.class);

	@Bean(name = "aiWebClient")
	public WebClient aiWebClient(@Value("${ai-service.base-url:http://localhost:5000}") String baseUrl) {
		return WebClient.builder()
				.baseUrl(baseUrl)
				.build();
	}

	@Bean(name = "huggingFaceWebClient")
	public WebClient huggingFaceWebClient(
			@Value("${huggingface.base-url:https://router.huggingface.co}") String baseUrl,
			@Value("${huggingface.api-key:}") String apiKey) {
		WebClient.Builder builder = WebClient.builder()
				.baseUrl(baseUrl);

		if (StringUtils.hasText(apiKey)) {
			builder.defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey);
			log.info("Hugging Face API key detected; Authorization header enabled.");
		}
		else {
			log.warn("Hugging Face API key not configured; requests will likely be rejected with 401.");
		}

		return builder.build();
	}
}

