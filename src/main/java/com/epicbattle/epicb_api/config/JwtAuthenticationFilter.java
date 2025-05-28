package com.epicbattle.epicb_api.config;

import com.epicbattle.epicb_api.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.lang.NonNull;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Filtro de autenticación JWT que intercepta todas las peticiones HTTP
 * y verifica la presencia y validez del token JWT.
 * Se ejecuta una vez por cada petición en la cadena de filtros.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    /**
     * Método principal que procesa cada petición HTTP.
     * Extrae el token JWT del header Authorization, lo valida,
     * y establece la autenticación en el SecurityContext si el token es válido.
     *
     * @param request Petición HTTP entrante
     * @param response Respuesta HTTP
     * @param filterChain Cadena de filtros para continuar el procesamiento
     * @throws ServletException si hay un error en el servlet
     * @throws IOException si hay un error de I/O
     */
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        // Extraer el header de autorización
        final String authorizationHeader = request.getHeader("Authorization");
        String username = null;
        String jwt = null;

        // Verificar si el header existe y tiene el formato correcto
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            // Extraer el token sin el prefijo "Bearer "
            jwt = authorizationHeader.substring(7);
            // Extraer el username del token
            username = jwtUtil.extractUsername(jwt);
        }

        // Verificar si se encontró un username y no hay autenticación actual
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Cargar los detalles del usuario
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
            
            // Validar el token
            if (jwtUtil.validateToken(jwt, userDetails.getUsername())) {
                // Crear el token de autenticación
                UsernamePasswordAuthenticationToken authenticationToken =
                        new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                        );
                
                // Establecer los detalles de la autenticación
                authenticationToken.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request)
                );
                
                // Establecer la autenticación en el contexto de seguridad
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            }
        }
        
        // Continuar con la cadena de filtros
        filterChain.doFilter(request, response);
    }
}
