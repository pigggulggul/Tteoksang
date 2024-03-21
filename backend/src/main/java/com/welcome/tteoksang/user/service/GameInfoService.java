package com.welcome.tteoksang.user.service;

import com.welcome.tteoksang.user.dto.GameInfo;
import com.welcome.tteoksang.user.dto.PreviousPlayInfo;

public interface GameInfoService {

    public PreviousPlayInfo searchPreviousPlayInfo(String userId);

    public GameInfo searchGameInfo(String userId);

}
