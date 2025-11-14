package com.motorshop.MotorShopSystem.models;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "_user")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String firstName;
    private String lastName;

    @Column(unique = true)
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private Role role;

    @Column(name = "vendor_id")
    private Long vendorId;

    // ✅ Spring Security expects "ROLE_" prefix
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }

    public void updateDetails(User updatedUser) {
        if (updatedUser.getFirstName() != null) this.firstName = updatedUser.getFirstName();
        if (updatedUser.getLastName() != null) this.lastName = updatedUser.getLastName();
        if (updatedUser.getEmail() != null) this.email = updatedUser.getEmail();
        if (updatedUser.getVendorId() != null) this.vendorId = updatedUser.getVendorId();
    }

    public void updateRole(String newRole) {
        if (newRole == null || newRole.isBlank()) {
            throw new IllegalArgumentException("Role cannot be empty.");
        }
        try {
            this.role = Role.valueOf(newRole.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + newRole);
        }
    }
}
