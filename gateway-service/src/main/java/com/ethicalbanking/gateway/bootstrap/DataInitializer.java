package com.ethicalbanking.gateway.bootstrap;

import com.ethicalbanking.gateway.domain.user.LoanApplication;
import com.ethicalbanking.gateway.domain.user.UserProfile;
import com.ethicalbanking.gateway.domain.user.UserType;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer {

	private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
	private static final String PASSWORD_ADMIN = "admin123";
	private static final String PASSWORD_CUSTOMER = "pass123";
	private static final String STATUS_APPROVED = "Approved";
	private static final String STATUS_DECLINED = "Declined";
	private static final String SEGMENT_PRIME = "Prime";
	private static final String SEGMENT_GROWTH = "Growth";
	private static final String SEGMENT_WATCH = "Watch";
	private static final String PRODUCT_GREEN_MORTGAGE = "GreenMortgage";
	private static final String PRODUCT_SOLAR_UPGRADE = "SolarUpgrade";
	private static final String PRODUCT_GREEN_AUTO = "GreenAuto";
	private static final String PRODUCT_ETHICAL_LINE = "EthicalLine";
	private static final String PRODUCT_BRIDGE_FUND = "BridgeFund";
	private static final String PRODUCT_PORTFOLIO_OVERSIGHT = "PortfolioOversight";
	private static final String PRODUCT_COMMUNITY_IMPACT = "CommunityImpact";

	private final UserProfileRepository userProfileRepository;
	private final LoanApplicationRepository loanApplicationRepository;
	private final PasswordEncoder passwordEncoder;

	public DataInitializer(UserProfileRepository userProfileRepository,
			LoanApplicationRepository loanApplicationRepository,
			PasswordEncoder passwordEncoder) {
		this.userProfileRepository = userProfileRepository;
		this.loanApplicationRepository = loanApplicationRepository;
		this.passwordEncoder = passwordEncoder;
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
			profile.setUserType(seed.userType());
			profile.setPasswordHash(passwordEncoder.encode(seed.password()));
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
				new UserSeed("admin_001", "Dana Ledger", "dana.ledger@ethicalbank.com", 812, 12000,
						SEGMENT_PRIME, PRODUCT_PORTFOLIO_OVERSIGHT, new BigDecimal("25000"),
						STATUS_APPROVED,
						"Internal admin profile for decision oversight tooling.", 5, UserType.ADMIN,
						PASSWORD_ADMIN),
				new UserSeed("user_001", "Avery Ethical", "avery.ethical@example.com", 742, 9500,
						SEGMENT_PRIME, PRODUCT_GREEN_MORTGAGE, new BigDecimal("420000"),
						STATUS_APPROVED,
						"High household income and strong repayment record.", 14, UserType.CUSTOMER,
						PASSWORD_CUSTOMER),
				new UserSeed("user_002", "Jordan Alvarez", "jordan.alvarez@example.com", 688, 7200,
						SEGMENT_PRIME, PRODUCT_SOLAR_UPGRADE, new BigDecimal("18000"),
						STATUS_APPROVED,
						"Approved for solar retrofit with municipal rebate backing.", 28,
						UserType.CUSTOMER, PASSWORD_CUSTOMER),
				new UserSeed("user_003", "Morgan Patel", "morgan.patel@example.com", 655, 6100,
						SEGMENT_GROWTH, PRODUCT_GREEN_AUTO, new BigDecimal("34000"),
						STATUS_APPROVED,
						"Lower rate due to EV purchase and steady income.", 42, UserType.CUSTOMER,
						PASSWORD_CUSTOMER),
				new UserSeed("user_004", "Riley Chen", "riley.chen@example.com", 602, 5400,
						SEGMENT_GROWTH, PRODUCT_ETHICAL_LINE, new BigDecimal("12000"),
						STATUS_DECLINED,
						"Debt-to-income temporarily exceeded policy threshold.", 11,
						UserType.CUSTOMER, PASSWORD_CUSTOMER),
				new UserSeed("user_005", "Skyler Singh", "skyler.singh@example.com", 712, 8800,
						SEGMENT_PRIME, PRODUCT_GREEN_MORTGAGE, new BigDecimal("360000"),
						STATUS_APPROVED,
						"Approved with TrustVault consent and stellar payment history.", 7,
						UserType.CUSTOMER, PASSWORD_CUSTOMER),
				new UserSeed("user_006", "Dakota Reyes", "dakota.reyes@example.com", 581, 4900,
						SEGMENT_WATCH, PRODUCT_BRIDGE_FUND, new BigDecimal("22000"),
						STATUS_DECLINED,
						"Request redirected to human review after recent delinquencies.", 18,
						UserType.CUSTOMER, PASSWORD_CUSTOMER),
				new UserSeed("user_007", "Emerson Boyd", "emerson.boyd@example.com", 630, 5600,
						SEGMENT_GROWTH, PRODUCT_GREEN_AUTO, new BigDecimal("28000"),
						STATUS_APPROVED,
						"Approved with smaller ticket size and repayment coaching.", 33,
						UserType.CUSTOMER, PASSWORD_CUSTOMER),
				new UserSeed("user_008", "Quinn Hart", "quinn.hart@example.com", 701, 9100,
						SEGMENT_PRIME, PRODUCT_SOLAR_UPGRADE, new BigDecimal("22000"),
						STATUS_APPROVED,
						"Approved with instant rebate verification via TrustVault.", 21,
						UserType.CUSTOMER, PASSWORD_CUSTOMER),
				new UserSeed("user_009", "Casey O'Neal", "casey.oneal@example.com", 590, 4700,
						SEGMENT_WATCH, PRODUCT_ETHICAL_LINE, new BigDecimal("9000"),
						STATUS_DECLINED,
						"Consent hash missing for last disclosure update.", 5, UserType.CUSTOMER,
						PASSWORD_CUSTOMER),
				new UserSeed("user_010", "Harper Silva", "harper.silva@example.com", 668, 6400,
						SEGMENT_GROWTH, PRODUCT_GREEN_AUTO, new BigDecimal("31000"),
						STATUS_APPROVED,
						"Approved with co-signer acknowledgement stored in TrustVault.", 65,
						UserType.CUSTOMER, PASSWORD_CUSTOMER),
				new UserSeed("user_011", "Lennon Brooks", "lennon.brooks@example.com", 734, 10200,
						SEGMENT_PRIME, PRODUCT_COMMUNITY_IMPACT, new BigDecimal("50000"),
						STATUS_APPROVED,
						"Approved for community impact bond participation.", 24,
						UserType.CUSTOMER, PASSWORD_CUSTOMER),
				new UserSeed("user_012", "Rowan Mehta", "rowan.mehta@example.com", 577, 4300,
						SEGMENT_WATCH, PRODUCT_BRIDGE_FUND, new BigDecimal("15000"),
						STATUS_DECLINED,
						"Denied due to unresolved consent mismatch and low score.", 9,
						UserType.CUSTOMER, PASSWORD_CUSTOMER),
				new UserSeed("user_013", "Kai Turner", "kai.turner@example.com", 710, 8900,
						SEGMENT_PRIME, PRODUCT_GREEN_MORTGAGE, new BigDecimal("400000"),
						STATUS_APPROVED,
						"Approved with sustainability-linked rate reduction.", 58,
						UserType.CUSTOMER, PASSWORD_CUSTOMER),
				new UserSeed("user_014", "Blake Foster", "blake.foster@example.com", 645, 6000,
						SEGMENT_GROWTH, PRODUCT_SOLAR_UPGRADE, new BigDecimal("26000"),
						STATUS_APPROVED,
						"Approved; SHAP highlights utilization improvements.", 36,
						UserType.CUSTOMER, PASSWORD_CUSTOMER),
				new UserSeed("user_015", "Sydney Park", "sydney.park@example.com", 605, 5200,
						SEGMENT_GROWTH, PRODUCT_ETHICAL_LINE, new BigDecimal("11000"),
						STATUS_APPROVED,
						"Approved after additional consent validation.", 13, UserType.CUSTOMER,
						PASSWORD_CUSTOMER),
				new UserSeed("user_016", "Micah Hughes", "micah.hughes@example.com", 582, 4600,
						SEGMENT_WATCH, PRODUCT_BRIDGE_FUND, new BigDecimal("19000"),
						STATUS_DECLINED,
						"Declined after AI backend flagged recent delinquencies.", 3,
						UserType.CUSTOMER, PASSWORD_CUSTOMER),
				new UserSeed("user_017", "Jules Navarro", "jules.navarro@example.com", 699, 7600,
						SEGMENT_PRIME, PRODUCT_GREEN_AUTO, new BigDecimal("33000"),
						STATUS_APPROVED,
						"Approved; Mistral explanation cites positive payment streak.", 49,
						UserType.CUSTOMER, PASSWORD_CUSTOMER),
				new UserSeed("user_018", "Tatum Wells", "tatum.wells@example.com", 720, 9800,
						SEGMENT_PRIME, PRODUCT_COMMUNITY_IMPACT, new BigDecimal("62000"),
						STATUS_APPROVED,
						"Approved for local agriculture co-op project.", 74, UserType.CUSTOMER,
						PASSWORD_CUSTOMER),
				new UserSeed("user_019", "Phoenix Ortiz", "phoenix.ortiz@example.com", 592, 4800,
						SEGMENT_WATCH, PRODUCT_ETHICAL_LINE, new BigDecimal("10500"),
						STATUS_DECLINED,
						"Declined until TrustVault records refreshed.", 16, UserType.CUSTOMER,
						PASSWORD_CUSTOMER),
				new UserSeed("user_020", "Reese Coleman", "reese.coleman@example.com", 662, 6700,
						SEGMENT_GROWTH, PRODUCT_SOLAR_UPGRADE, new BigDecimal("25500"),
						STATUS_APPROVED,
						"Approved with structured repayment schedule.", 27, UserType.CUSTOMER,
						PASSWORD_CUSTOMER));
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
			int daysAgo,
			UserType userType,
			String password) {
	}
}
