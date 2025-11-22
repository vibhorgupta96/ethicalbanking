package com.ethicalbanking.gateway.domain.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "loan_applications")
public class LoanApplication {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private UserProfile user;

	@Column(nullable = false)
	private String productType;

	@Column(nullable = false, precision = 16, scale = 2)
	private BigDecimal requestedAmount;

	@Column(nullable = false)
	private String decision;

	@Column(nullable = false)
	private LocalDate decisionDate;

	@Column(nullable = false, length = 512)
	private String rationale;

	public Long getId() {
		return id;
	}

	public UserProfile getUser() {
		return user;
	}

	public LoanApplication setUser(UserProfile user) {
		this.user = user;
		return this;
	}

	public String getProductType() {
		return productType;
	}

	public LoanApplication setProductType(String productType) {
		this.productType = productType;
		return this;
	}

	public BigDecimal getRequestedAmount() {
		return requestedAmount;
	}

	public LoanApplication setRequestedAmount(BigDecimal requestedAmount) {
		this.requestedAmount = requestedAmount;
		return this;
	}

	public String getDecision() {
		return decision;
	}

	public LoanApplication setDecision(String decision) {
		this.decision = decision;
		return this;
	}

	public LocalDate getDecisionDate() {
		return decisionDate;
	}

	public LoanApplication setDecisionDate(LocalDate decisionDate) {
		this.decisionDate = decisionDate;
		return this;
	}

	public String getRationale() {
		return rationale;
	}

	public LoanApplication setRationale(String rationale) {
		this.rationale = rationale;
		return this;
	}
}

