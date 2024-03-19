package com.welcome.tteoksang.user.controller;

import com.welcome.tteoksang.user.dto.Achieve;
import com.welcome.tteoksang.user.dto.AchieveRes;
import com.welcome.tteoksang.user.dto.User;
import com.welcome.tteoksang.user.dto.req.UpdateUserNameReq;
import com.welcome.tteoksang.user.dto.req.UpdateUserProfileFrameReq;
import com.welcome.tteoksang.user.dto.req.UpdateUserProfileIconReq;
import com.welcome.tteoksang.user.dto.req.UpdateUserThemeReq;
import com.welcome.tteoksang.user.dto.res.SearchAchieveRes;
import com.welcome.tteoksang.user.dto.res.SearchHonorRes;
import com.welcome.tteoksang.user.dto.res.SearchUserInfoRes;
import com.welcome.tteoksang.user.service.AchieveService;
import com.welcome.tteoksang.user.service.HonorService;
import com.welcome.tteoksang.user.service.UserService;

import java.net.URISyntaxException;
import java.util.List;
import java.util.UUID;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {

    private final UserService userService;
    private final HonorService honorService;
    private final AchieveService achieveService;

    @PutMapping("/nickname")
    public ResponseEntity<Void> updateUser(@RequestBody UpdateUserNameReq updateUserReq,
                                           @AuthenticationPrincipal User user) {
        userService.updateUserName(updateUserReq, user);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/theme")
    public ResponseEntity<Void> updateTheme(@RequestBody UpdateUserThemeReq updateUserThemeReq,
                                            @AuthenticationPrincipal User user) {
        userService.updateUserTheme(updateUserThemeReq, user);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/profile-icon")
    public ResponseEntity<Void> updateProfileIcon(@RequestBody UpdateUserProfileIconReq updateUserProfileIconReq,
                                                  @AuthenticationPrincipal User user) {
        userService.updateUserProfileIcon(updateUserProfileIconReq, user);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/profile-frame")
    public ResponseEntity<Void> updateProfileFrame(@RequestBody UpdateUserProfileFrameReq updateUserProfileFrameReq,
                                                   @AuthenticationPrincipal User user) {
        userService.updateUserProfileFrame(updateUserProfileFrameReq, user);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/title")
    public ResponseEntity<SearchHonorRes> searchHonor(@AuthenticationPrincipal User user) {
        List<Integer> honorList = honorService.searchAllHonor(user.getUserId());

        return ResponseEntity.ok()
                .body(
                        SearchHonorRes.builder()
                                .acquiredTitleList(honorList)
                                .build()
                );
    }

    @GetMapping("/achievement")
    public ResponseEntity<SearchAchieveRes> searchAchievement(@AuthenticationPrincipal User user) {
        List<AchieveRes> achievementList = achieveService.searchAllAchieve(user.getUserId());

        return ResponseEntity.ok()
                .body(
                        SearchAchieveRes.builder()
                                .acquiredAchievementList(achievementList)
                                .build()
                );
    }

    @DeleteMapping
    public void deleteUser(@AuthenticationPrincipal User user) throws URISyntaxException {
        userService.deleteUser(user);
    }

    @GetMapping
    public ResponseEntity<SearchUserInfoRes> searchUserInfo(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok()
                .body(
                        SearchUserInfoRes.builder()
                                .userNickname(user.getUserNickname())
                                .profileIconId(user.getProfileIcon().getProfileIconId())
                                .profileFrameId(user.getProfileFrame().getProfileFrameId())
                                .themeId(user.getTheme().getThemeId())
                                .titleId(user.getTitle().getTitleId())
                                .career(user.getCareer())
                                .build()
                );
    }

}
