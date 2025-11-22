package com.ethicalbanking.gateway.repository;

import com.ethicalbanking.gateway.domain.user.LoanApplication;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoanApplicationRepository extends JpaRepository<LoanApplication, Long> {

	List<LoanApplication> findByUser_ExternalIdOrderByDecisionDateDesc(String externalId);
}

