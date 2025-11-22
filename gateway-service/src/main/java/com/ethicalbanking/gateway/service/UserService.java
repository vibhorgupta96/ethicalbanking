package com.ethicalbanking.gateway.service;

import com.ethicalbanking.gateway.domain.user.UserProfile;
import com.ethicalbanking.gateway.repository.UserProfileRepository;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class UserService {

	private static final Logger log = LoggerFactory.getLogger(UserService.class);

	private final UserProfileRepository userProfileRepository;
	private final PasswordEncoder passwordEncoder;

	public UserService(UserProfileRepository userProfileRepository,
			PasswordEncoder passwordEncoder) {
		this.userProfileRepository = userProfileRepository;
		this.passwordEncoder = passwordEncoder;
	}

	public Optional<UserProfile> findByExternalId(String userId) {
		Optional<UserProfile> profile = userProfileRepository.findByExternalId(userId);
		log.info("User lookup for {} => {}", userId, profile.isPresent() ? "found" : "not found");
		return profile;
	}

	public Optional<UserProfile> authenticate(String userId, String password) {
		return userProfileRepository.findByExternalId(userId)
				.filter(profile -> passwordEncoder.matches(password, profile.getPasswordHash()));
	}

	public List<UserProfile> findAllProfiles() {
		List<UserProfile> profiles = userProfileRepository.findAllByOrderByFullNameAsc();
		log.info("Retrieved {} user profiles", profiles.size());
		return profiles;
	}
}

