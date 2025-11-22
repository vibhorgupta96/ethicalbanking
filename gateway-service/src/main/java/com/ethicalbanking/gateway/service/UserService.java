package com.ethicalbanking.gateway.service;

import com.ethicalbanking.gateway.domain.user.UserProfile;
import com.ethicalbanking.gateway.repository.UserProfileRepository;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class UserService {

	private static final Logger log = LoggerFactory.getLogger(UserService.class);

	private final UserProfileRepository userProfileRepository;

	public UserService(UserProfileRepository userProfileRepository) {
		this.userProfileRepository = userProfileRepository;
	}

	public Optional<UserProfile> findByExternalId(String userId) {
		Optional<UserProfile> profile = userProfileRepository.findByExternalId(userId);
		log.info("User lookup for {} => {}", userId, profile.isPresent() ? "found" : "not found");
		return profile;
	}
}

