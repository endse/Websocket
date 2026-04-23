package com.chat.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class UserDTO {
    private String id;
    private String username;
    private String email;
    private String avatarUrl;
    private String status;
    private String lastSeen;
}
