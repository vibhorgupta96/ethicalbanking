package com.ethicalbanking.gateway.service;

import com.ethicalbanking.gateway.domain.user.UserProfile;
import com.ethicalbanking.gateway.repository.UserProfileRepository;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class UserService {

	private final UserProfileRepository userProfileRepository;

	public UserService(UserProfileRepository userProfileRepository) {
		this.userProfileRepository = userProfileRepository;
	}

	public Optional<UserProfile> findByExternalId(String userId) {
		return userProfileRepository.findByExternalId(userId);
	}
}

