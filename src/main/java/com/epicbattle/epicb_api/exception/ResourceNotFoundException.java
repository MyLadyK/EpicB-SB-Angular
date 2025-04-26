package com.epicbattle.epicb_api.exception;

/**
 * Excepción personalizada para recursos no encontrados en la API.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
