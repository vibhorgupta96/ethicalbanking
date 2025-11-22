package com.ethicalbanking.gateway.repository;

import com.ethicalbanking.gateway.domain.user.UserProfile;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {

	Optional<UserProfile> findByExternalId(String externalId);

	List<UserProfile> findAllByOrderByFullNameAsc();
}

