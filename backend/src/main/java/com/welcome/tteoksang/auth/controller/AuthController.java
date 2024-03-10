package com.welcome.tteoksang.auth.controller;

import com.welcome.tteoksang.auth.dto.req.TokenReq;
import com.welcome.tteoksang.auth.dto.res.LoginRes;
import com.welcome.tteoksang.auth.dto.res.TokenRes;
import com.welcome.tteoksang.auth.jwt.JWTUtil;
import com.welcome.tteoksang.auth.service.AuthService;
import com.welcome.tteoksang.redis.RedisPrefix;
import com.welcome.tteoksang.redis.RedisService;
import com.welcome.tteoksang.user.dto.User;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

  private final AuthService authService;
  private final RedisService redisService;
  private final JWTUtil jwtUtil;

  @GetMapping("/logout")
  public ResponseEntity<Void> logout(@AuthenticationPrincipal User user) {
    String key = RedisPrefix.REFRESH_TOKEN.prefix() + user.getUserId();
    redisService.deleteValues(key);
    return ResponseEntity.ok().build();
  }

  @PostMapping("/token")
  public ResponseEntity<TokenRes> tokenRegenerate(@RequestBody TokenReq tokenReq) {
    String inputRefreshToken = tokenReq.getRefreshToken();

    if (jwtUtil.isValid(inputRefreshToken)) {
      String userId = jwtUtil.getUserId(inputRefreshToken);
      String refreshTokenKey = RedisPrefix.REFRESH_TOKEN.prefix() + userId;
      String refreshToken = (String) redisService.getValues(refreshTokenKey);

      // refreshToken 같으면 token 재발급
      if (refreshToken != null && refreshToken.equals(inputRefreshToken)) {
        String accessToken = jwtUtil.createJwt(userId, 1000 * 60 * 60L);
        String newRefreshToken = jwtUtil.regenerateRefreshJwt(userId, refreshToken,  1000 * 60 * 60 * 24 * 14L, 1000 * 60 * 60 * 24 * 7L);
        redisService.setValues(refreshTokenKey, newRefreshToken);

        return ResponseEntity.ok().body(TokenRes
            .builder()
            .accessToken(accessToken)
            .refreshToken(newRefreshToken)
            .build()
        );
      }
    }

    // 리프레시 토큰 만료 또는 불일치 하는 경우
    return ResponseEntity.badRequest().build();
  }
}