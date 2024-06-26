package com.welcome;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;

import java.util.HashMap;
import java.util.Map;

@Getter
@Setter
//@JsonInclude(JsonInclude.Include.NON_DEFAULT)
//@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.ALWAYS)
public class Statistics {
    // 개인통계량 및 이벤트
    private long accPrivateRentFee; // 누적 임대료
    private long accPrivateUpgradeFee;  // 개인별 전체 누적 업그레이드 비용
    private long accPrivateEventBonus;  // 개인별 누적 이벤트 보너스
    private long maxPrivateProductIncome;  // 하나의 판매 단위에서 최대 판매 비용
    private int accPrivatePlayTime; // 누적 플레이 시간
    private int accPrivateOnlineTimeSlotCount = -1;  // 시간대 별 접속 횟수
    private int accPrivateGamePlayCount;    // 개인별 누적 게임 생성 횟수
    private String accPrivateEventOccurId;  // 개인별 누적 발생 이벤트 아이디

    // 농산물 품목별 개인 통계량
    private Map<Long, ProductInfo> productInfoMap;

    public Statistics() {
        productInfoMap = new HashMap<>();
    }

    // productId를 키로 ProductInfo 추가
    public void addProductInfo(Long productId, ProductInfo productInfo) {
        productInfoMap.put(productId, productInfo);
    }

    // ProductInfo 맵 반환
    public Map<Long, ProductInfo> getProductInfoMap() {
        return productInfoMap;
    }
}



