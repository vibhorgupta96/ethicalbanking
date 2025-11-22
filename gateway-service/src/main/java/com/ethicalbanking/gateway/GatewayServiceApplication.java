package com.ethicalbanking.gateway;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class GatewayServiceApplication {

	public static void main(String[] args) {
		loadEnv();
		SpringApplication.run(GatewayServiceApplication.class, args);
	}

	private static void loadEnv() {
		Path envPath = Paths.get(".env");
		if (!Files.exists(envPath)) {
			// Try parent directory if running from a subdirectory
			envPath = Paths.get("../.env");
		}

		if (Files.exists(envPath)) {
			try {
				List<String> lines = Files.readAllLines(envPath);
				for (String line : lines) {
					if (line.trim().isEmpty() || line.trim().startsWith("#")) {
						continue;
					}
					String[] parts = line.split("=", 2);
					if (parts.length == 2) {
						String key = parts[0].trim();
						String value = parts[1].trim();
						// Remove quotes if present
						if (value.startsWith("\"") && value.endsWith("\"")) {
							value = value.substring(1, value.length() - 1);
						}
						// Only set if not already set (prioritize actual env vars)
						if (System.getenv(key) == null && System.getProperty(key) == null) {
							System.setProperty(key, value);
						}
					}
				}
			}
			catch (IOException e) {
				// Silently ignore if we can't read it, rely on standard config
			}
		}
	}
}
