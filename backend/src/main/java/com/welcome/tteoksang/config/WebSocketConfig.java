package com.welcome.tteoksang.config;

import com.welcome.tteoksang.socket.interceptor.AuthHandshakeInterceptor;
import com.welcome.tteoksang.socket.interceptor.InGameChannelInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@RequiredArgsConstructor
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final InGameChannelInterceptor inGameChannelInterceptor;
    private final AuthHandshakeInterceptor authHandshakeInterceptor;

    // 클라이언트로부터 들어오는 메시지를 처리할 인터셉터를 설정
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(inGameChannelInterceptor);
    }

    /**
     * 클라이언트가 메시지를 보낼 수 있는 endpoint 설정
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // "/topic"으로 시작하는 메시지가 메시지 브로커로 라우팅되어야 함
        // 메시지 브로커는 연결된 모든 클라이언트에게 메시지를 broadcast함
        config.enableSimpleBroker("/topic");
        // "/app"으로 시작하는 경로를 가진 메시지를 'message-handling methods', 즉 (@MessageMapping)로 라우팅함
        config.setApplicationDestinationPrefixes("/app");
    }

    /**
     * websocket endpoint 등록
     * 브로커 주소의 주소
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // "/game"라는 endpoint를 등록하고, 모든 도메인에서의 접근을 허용함
        registry.addEndpoint("/game")
                .addInterceptors(authHandshakeInterceptor)
                .setAllowedOriginPatterns("*");
    }
}
