package com.ethicalbanking.gateway.api;

import com.ethicalbanking.gateway.domain.user.UserProfile;
import com.ethicalbanking.gateway.dto.LoginRequest;
import com.ethicalbanking.gateway.service.UserService;
import jakarta.validation.Valid;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserController {

	private static final Logger log = LoggerFactory.getLogger(UserController.class);

	private final UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping("/{userId}")
	public ResponseEntity<UserProfile> findUser(@PathVariable String userId) {
		log.info("Fetching user {}", userId);
		return userService.findByExternalId(userId)
				.map(ResponseEntity::ok)
				.orElseGet(() -> ResponseEntity.notFound().build());
	}

	@GetMapping
	public ResponseEntity<List<UserProfile>> listUsers() {
		log.info("Fetching roster of user profiles");
		return ResponseEntity.ok(userService.findAllProfiles());
	}

	@PostMapping("/login")
	public ResponseEntity<UserProfile> login(@Valid @RequestBody LoginRequest request) {
		log.info("Authenticating user {}", request.userId());
		return userService.authenticate(request.userId(), request.password())
				.map(ResponseEntity::ok)
				.orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
	}
}

