package com.welcome.tteoksang.game.dto.user;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserInfraInfo {
    private Integer warehouseLevel;
    private Integer vehicleLevel;
    private Integer brokerLevel;
}
