package com.ethicalbanking.gateway.bootstrap;

import com.ethicalbanking.gateway.domain.user.LoanApplication;
import com.ethicalbanking.gateway.domain.user.UserProfile;
import com.ethicalbanking.gateway.repository.LoanApplicationRepository;
import com.ethicalbanking.gateway.repository.UserProfileRepository;
import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer {

	private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

	private final UserProfileRepository userProfileRepository;
	private final LoanApplicationRepository loanApplicationRepository;

	public DataInitializer(UserProfileRepository userProfileRepository,
			LoanApplicationRepository loanApplicationRepository) {
		this.userProfileRepository = userProfileRepository;
		this.loanApplicationRepository = loanApplicationRepository;
	}

	@PostConstruct
	public void seedUsers() {
		if (userProfileRepository.count() > 0) {
			return;
		}

		List<UserSeed> seeds = buildSeeds();
		Map<String, UserProfile> persistedUsers = new LinkedHashMap<>();
		for (UserSeed seed : seeds) {
			UserProfile profile = new UserProfile();
			profile.setExternalId(seed.id());
			profile.setFullName(seed.fullName());
			profile.setEmail(seed.email());
			profile.setCreditScore(seed.creditScore());
			profile.setNetMonthlyIncome(seed.netMonthlyIncome());
			profile.setSegment(seed.segment());
			persistedUsers.put(seed.id(), userProfileRepository.save(profile));
		}

		List<LoanApplication> loanApplications = new ArrayList<>();
		for (UserSeed seed : seeds) {
			LoanApplication loan = new LoanApplication()
					.setUser(persistedUsers.get(seed.id()))
					.setProductType(seed.productType())
					.setRequestedAmount(seed.requestedAmount())
					.setDecision(seed.decision())
					.setDecisionDate(LocalDate.now().minusDays(seed.daysAgo()))
					.setRationale(seed.rationale());
			loanApplications.add(loan);
		}
		loanApplicationRepository.saveAll(loanApplications);

		log.info("Seeded {} user profiles and {} loan applications",
				persistedUsers.size(), loanApplications.size());
	}

	private List<UserSeed> buildSeeds() {
		return List.of(
				new UserSeed("user_001", "Avery Ethical", "avery.ethical@example.com", 742, 9500,
						"Prime", "GreenMortgage", new BigDecimal("420000"), "Approved",
						"High household income and strong repayment record.", 14),
				new UserSeed("user_002", "Jordan Alvarez", "jordan.alvarez@example.com", 688, 7200,
						"Prime", "SolarUpgrade", new BigDecimal("18000"), "Approved",
						"Approved for solar retrofit with municipal rebate backing.", 28),
				new UserSeed("user_003", "Morgan Patel", "morgan.patel@example.com", 655, 6100,
						"Growth", "GreenAuto", new BigDecimal("34000"), "Approved",
						"Lower rate due to EV purchase and steady income.", 42),
				new UserSeed("user_004", "Riley Chen", "riley.chen@example.com", 602, 5400,
						"Growth", "EthicalLine", new BigDecimal("12000"), "Declined",
						"Debt-to-income temporarily exceeded policy threshold.", 11),
				new UserSeed("user_005", "Skyler Singh", "skyler.singh@example.com", 712, 8800,
						"Prime", "GreenMortgage", new BigDecimal("360000"), "Approved",
						"Approved with TrustVault consent and stellar payment history.", 7),
				new UserSeed("user_006", "Dakota Reyes", "dakota.reyes@example.com", 581, 4900,
						"Watch", "BridgeFund", new BigDecimal("22000"), "Declined",
						"Request redirected to human review after recent delinquencies.", 18),
				new UserSeed("user_007", "Emerson Boyd", "emerson.boyd@example.com", 630, 5600,
						"Growth", "GreenAuto", new BigDecimal("28000"), "Approved",
						"Approved with smaller ticket size and repayment coaching.", 33),
				new UserSeed("user_008", "Quinn Hart", "quinn.hart@example.com", 701, 9100,
						"Prime", "SolarUpgrade", new BigDecimal("22000"), "Approved",
						"Approved with instant rebate verification via TrustVault.", 21),
				new UserSeed("user_009", "Casey O'Neal", "casey.oneal@example.com", 590, 4700,
						"Watch", "EthicalLine", new BigDecimal("9000"), "Declined",
						"Consent hash missing for last disclosure update.", 5),
				new UserSeed("user_010", "Harper Silva", "harper.silva@example.com", 668, 6400,
						"Growth", "GreenAuto", new BigDecimal("31000"), "Approved",
						"Approved with co-signer acknowledgement stored in TrustVault.", 65),
				new UserSeed("user_011", "Lennon Brooks", "lennon.brooks@example.com", 734, 10200,
						"Prime", "CommunityImpact", new BigDecimal("50000"), "Approved",
						"Approved for community impact bond participation.", 24),
				new UserSeed("user_012", "Rowan Mehta", "rowan.mehta@example.com", 577, 4300,
						"Watch", "BridgeFund", new BigDecimal("15000"), "Declined",
						"Denied due to unresolved consent mismatch and low score.", 9),
				new UserSeed("user_013", "Kai Turner", "kai.turner@example.com", 710, 8900,
						"Prime", "GreenMortgage", new BigDecimal("400000"), "Approved",
						"Approved with sustainability-linked rate reduction.", 58),
				new UserSeed("user_014", "Blake Foster", "blake.foster@example.com", 645, 6000,
						"Growth", "SolarUpgrade", new BigDecimal("26000"), "Approved",
						"Approved; SHAP highlights utilization improvements.", 36),
				new UserSeed("user_015", "Sydney Park", "sydney.park@example.com", 605, 5200,
						"Growth", "EthicalLine", new BigDecimal("11000"), "Approved",
						"Approved after additional consent validation.", 13),
				new UserSeed("user_016", "Micah Hughes", "micah.hughes@example.com", 582, 4600,
						"Watch", "BridgeFund", new BigDecimal("19000"), "Declined",
						"Declined after AI backend flagged recent delinquencies.", 3),
				new UserSeed("user_017", "Jules Navarro", "jules.navarro@example.com", 699, 7600,
						"Prime", "GreenAuto", new BigDecimal("33000"), "Approved",
						"Approved; Mistral explanation cites positive payment streak.", 49),
				new UserSeed("user_018", "Tatum Wells", "tatum.wells@example.com", 720, 9800,
						"Prime", "CommunityImpact", new BigDecimal("62000"), "Approved",
						"Approved for local agriculture co-op project.", 74),
				new UserSeed("user_019", "Phoenix Ortiz", "phoenix.ortiz@example.com", 592, 4800,
						"Watch", "EthicalLine", new BigDecimal("10500"), "Declined",
						"Declined until TrustVault records refreshed.", 16),
				new UserSeed("user_020", "Reese Coleman", "reese.coleman@example.com", 662, 6700,
						"Growth", "SolarUpgrade", new BigDecimal("25500"), "Approved",
						"Approved with structured repayment schedule.", 27));
	}

	private record UserSeed(
			String id,
			String fullName,
			String email,
			int creditScore,
			int netMonthlyIncome,
			String segment,
			String productType,
			BigDecimal requestedAmount,
			String decision,
			String rationale,
			int daysAgo) {
	}
}
