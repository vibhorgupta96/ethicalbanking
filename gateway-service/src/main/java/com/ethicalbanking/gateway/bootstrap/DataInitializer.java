package com.ethicalbanking.gateway.bootstrap;

import com.ethicalbanking.gateway.domain.user.UserProfile;
import com.ethicalbanking.gateway.repository.UserProfileRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer {

	private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

	private final UserProfileRepository userProfileRepository;

	public DataInitializer(UserProfileRepository userProfileRepository) {
		this.userProfileRepository = userProfileRepository;
	}

	@PostConstruct
	public void seedUsers() {
		if (userProfileRepository.count() > 0) {
			return;
		}

		UserProfile demo = new UserProfile();
		demo.setExternalId("user_123");
		demo.setFullName("Avery Ethical");
		demo.setEmail("avery.ethical@example.com");
		demo.setCreditScore(715);
		userProfileRepository.save(demo);

		log.info("Seeded demo user profile for {}", demo.getExternalId());
	}
}

