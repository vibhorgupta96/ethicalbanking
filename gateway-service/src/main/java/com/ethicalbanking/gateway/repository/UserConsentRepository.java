package com.ethicalbanking.gateway.repository;

import com.ethicalbanking.gateway.domain.consent.UserConsent;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserConsentRepository extends JpaRepository<UserConsent, Long> {

	Optional<UserConsent> findTopByUserExternalIdOrderByRecordedAtDesc(String userExternalId);
}

