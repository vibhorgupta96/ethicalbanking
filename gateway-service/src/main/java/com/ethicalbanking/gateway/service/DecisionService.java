package com.ethicalbanking.gateway.service;

import com.ethicalbanking.gateway.domain.user.LoanApplication;
import com.ethicalbanking.gateway.domain.user.UserProfile;
import com.ethicalbanking.gateway.dto.DecisionDriver;
import com.ethicalbanking.gateway.dto.DecisionInsightResponse;
import com.ethicalbanking.gateway.dto.DecisionInsightResponse.DecisionSummary;
import com.ethicalbanking.gateway.repository.LoanApplicationRepository;
import com.ethicalbanking.gateway.repository.UserProfileRepository;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DecisionService {

	private static final Logger log = LoggerFactory.getLogger(DecisionService.class);

	private final UserProfileRepository userProfileRepository;
	private final LoanApplicationRepository loanApplicationRepository;

	public DecisionService(UserProfileRepository userProfileRepository,
			LoanApplicationRepository loanApplicationRepository) {
		this.userProfileRepository = userProfileRepository;
		this.loanApplicationRepository = loanApplicationRepository;
	}

	public Optional<DecisionInsightResponse> buildInsightForUser(String userId) {
		Optional<UserProfile> userProfile = userProfileRepository.findByExternalId(userId);
		if (userProfile.isEmpty()) {
			log.warn("Unable to build decision insight for non-existent user {}", userId);
			return Optional.empty();
		}

		List<LoanApplication> history = loanApplicationRepository.findByUser_ExternalIdOrderByDecisionDateDesc(userId);
		if (history.isEmpty()) {
			log.warn("User {} does not have any loan applications recorded", userId);
			return Optional.empty();
		}

		LoanApplication latestDecision = history.get(0);

		DecisionSummary summary = new DecisionSummary(
				latestDecision.getProductType(),
				latestDecision.getRequestedAmount(),
				latestDecision.getDecision(),
				latestDecision.getDecisionDate(),
				latestDecision.getRationale());

		UserProfile profile = userProfile.get();
		List<DecisionDriver> drivers = buildDrivers(profile, latestDecision);
		String counterfactual = buildCounterfactual(profile, summary, drivers);

		return Optional.of(new DecisionInsightResponse(
				profile.getExternalId(),
				profile.getFullName(),
				profile.getSegment(),
				summary,
				drivers,
				counterfactual));
	}

	private List<DecisionDriver> buildDrivers(UserProfile profile, LoanApplication loan) {
		double creditImpact = normalize(profile.getCreditScore(), 540, 830);
		double incomeImpact = normalize(profile.getNetMonthlyIncome(), 3500, 12000);
		double burdenImpact = computeLoanBurden(loan.getRequestedAmount(), profile.getNetMonthlyIncome());
		double segmentImpact = deriveSegmentModifier(profile.getSegment());

		log.debug("Drivers for {} => credit {}, income {}, burden {}, segment {}", profile.getExternalId(), creditImpact,
				incomeImpact, burdenImpact, segmentImpact);

		return List.of(
				new DecisionDriver(
						"creditScore",
						"Credit score",
						"%d / 850".formatted(profile.getCreditScore()),
						creditImpact),
				new DecisionDriver(
						"income",
						"Net monthly income",
						"%s monthly".formatted(formatCurrency(profile.getNetMonthlyIncome())),
						incomeImpact),
				new DecisionDriver(
						"loanBurden",
						"Loan size vs income",
						formatLoanToIncome(loan.getRequestedAmount(), profile.getNetMonthlyIncome()),
						burdenImpact),
				new DecisionDriver(
						"segment",
						"Segment risk tier",
						profile.getSegment(),
						segmentImpact));
	}

	private String formatCurrency(Number value) {
		return NumberFormat.getCurrencyInstance(Locale.US).format(value);
	}

	private double normalize(Integer rawValue, double min, double max) {
		if (rawValue == null) {
			return 0.0;
		}
		double clamped = Math.max(min, Math.min(max, rawValue));
		double percent = (clamped - min) / (max - min);
		return round((percent * 2) - 1);
	}

	private double computeLoanBurden(BigDecimal requestedAmount, Integer netMonthlyIncome) {
		if (requestedAmount == null || netMonthlyIncome == null || netMonthlyIncome <= 0) {
			return 0.0;
		}
		double annualIncome = netMonthlyIncome * 12d;
		double ratio = requestedAmount.doubleValue() / annualIncome;
		double raw = 1.0 - (ratio / 5.0);
		return round(Math.max(-1.0, Math.min(1.0, raw)));
	}

	private double deriveSegmentModifier(String segment) {
		if (segment == null) {
			return 0.0;
		}
		return switch (segment.toLowerCase(Locale.ROOT)) {
			case "prime" -> 0.6;
			case "growth" -> 0.15;
			case "watch" -> -0.45;
			default -> -0.05;
		};
	}

	private String formatLoanToIncome(BigDecimal requestedAmount, Integer netMonthlyIncome) {
		if (requestedAmount == null || netMonthlyIncome == null || netMonthlyIncome <= 0) {
			return "n/a";
		}
		double annualIncome = netMonthlyIncome * 12d;
		double ratio = requestedAmount.doubleValue() / annualIncome;
		return "%.1fx annual income".formatted(ratio);
	}

	private double round(double value) {
		return Math.round(value * 100d) / 100d;
	}

	private String buildCounterfactual(UserProfile profile, DecisionSummary summary, List<DecisionDriver> drivers) {
		if (drivers == null || drivers.isEmpty()) {
			return "We do not have enough signal to propose a counterfactual scenario.";
		}

		boolean approved = summary.decision() != null
				&& summary.decision().equalsIgnoreCase("Approved");
		if (approved) {
			return "The application already satisfies the automated policy; changes would only improve pricing.";
		}

		DecisionDriver weakest = drivers.stream()
				.min(Comparator.comparingDouble(DecisionDriver::impact))
				.orElse(null);
		if (weakest == null || weakest.impact() >= 0) {
			return "All tracked drivers are already positive; escalate to a human reviewer.";
		}

		return switch (weakest.key()) {
			case "creditScore" -> creditScoreCounterfactual(profile);
			case "income" -> incomeCounterfactual(profile);
			case "loanBurden" -> loanBurdenCounterfactual(summary, profile);
			case "segment" -> segmentCounterfactual(profile);
			default -> "If the applicant improved their %s signal, the decision would likely flip."
					.formatted(weakest.label().toLowerCase(Locale.ROOT));
		};
	}

	private String creditScoreCounterfactual(UserProfile profile) {
		Integer score = profile.getCreditScore();
		if (score == null) {
			return "Provide a valid credit score to unlock a counterfactual recommendation.";
		}
		int target = Math.max(score + 25, 685);
		return "If %s's credit score were around %d instead of %d, the automated policy would move this loan into the approval band."
				.formatted(profile.getFullName(), target, score);
	}

	private String incomeCounterfactual(UserProfile profile) {
		Integer income = profile.getNetMonthlyIncome();
		if (income == null) {
			return "Submitting verified income would allow us to craft a counterfactual scenario.";
		}
		int target = Math.max(income + 1200, 7800);
		return "If %s documented net monthly income near %s (vs. %s), the affordability checks would pass."
				.formatted(profile.getFullName(), formatCurrency(target), formatCurrency(income));
	}

	private String loanBurdenCounterfactual(DecisionSummary summary, UserProfile profile) {
		BigDecimal requested = summary.requestedAmount();
		Integer income = profile.getNetMonthlyIncome();
		if (requested == null || income == null || income <= 0) {
			return "Adjusting the requested amount downward would likely improve this decision.";
		}
		double annualIncome = income * 12d;
		double targetAmount = Math.min(requested.doubleValue() * 0.75, annualIncome * 3.5);
		return "If %s reduced the requested amount to about %s (currently %s), the debt-to-income pressure would drop below the rejection threshold."
				.formatted(profile.getFullName(), formatCurrency(targetAmount), formatCurrency(requested));
	}

	private String segmentCounterfactual(UserProfile profile) {
		String segment = profile.getSegment();
		String targetSegment = "Growth";
		if (segment != null && segment.equalsIgnoreCase("growth")) {
			targetSegment = "Prime";
		}
		return "If %s graduated from the %s segment into the %s tier by improving repayment behavior, this loan would likely be approved."
				.formatted(profile.getFullName(), segment == null ? "current" : segment, targetSegment);
	}
}

