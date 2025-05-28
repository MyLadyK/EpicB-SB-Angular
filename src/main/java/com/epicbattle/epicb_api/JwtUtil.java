package com.epicbattle.epicb_api;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class JwtUtil {
    private final Key SIGN_KEY = Keys.hmacShaKeyFor("epicBattleSecretKey_1234567890abcd".getBytes()); // ¡Debe tener al menos 32 caracteres!

    public String generateToken(String username) {
        long expirationMillis = 1000 * 60 * 60 * 24; // 24 horas
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new java.util.Date(System.currentTimeMillis()))
                .setExpiration(new java.util.Date(System.currentTimeMillis() + expirationMillis))
                .signWith(SIGN_KEY, io.jsonwebtoken.SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token).getSubject();
    }

    public Date extractExpiration(String token) {
        return extractClaim(token).getExpiration();
    }

    public Claims extractClaim(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SIGN_KEY)
                .build()
                .parseClaimsJws(token.replace("Bearer ", ""))
                .getBody();
    }

    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public boolean validateToken(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }
}
