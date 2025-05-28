# Epic Battle - Juego de Batallas de Personajes

## Descripción del Proyecto

Epic Battle es una aplicación web full-stack que permite a los usuarios participar en batallas épicas con personajes únicos. El proyecto está desarrollado como Trabajo de Fin de Grado, utilizando tecnologías modernas tanto en el frontend como en el backend.

## Arquitectura

### Frontend (Angular)
- **Framework**: Angular 16+
- **Características principales**:
  - Sistema de autenticación con JWT
  - Gestión de estado con servicios
  - Componentes reactivos
  - Diseño responsive con CSS moderno
  - Animaciones y transiciones fluidas
  - Interceptores HTTP para manejo de tokens
  - Guards para protección de rutas

### Backend (Spring Boot)
- **Framework**: Spring Boot 3
- **Características principales**:
  - API REST
  - Seguridad con Spring Security y JWT
  - JPA/Hibernate para persistencia
  - Validación de datos
  - Manejo de excepciones global
  - Documentación con Swagger/OpenAPI

### Base de Datos
- **Motor**: MySQL 8
- **Características**:
  - Relaciones entre entidades
  - Índices optimizados
  - Constraints y claves foráneas
  - Triggers para actualizaciones automáticas

## Características Principales

### Sistema de Usuarios
- Registro y autenticación
- Perfiles de usuario
- Roles (Usuario/Administrador)
- Gestión de puntuación

### Sistema de Personajes
- Creación y gestión de personajes
- Atributos únicos (salud, ataque, defensa)
- Imágenes personalizadas
- Sistema de niveles

### Sistema de Batallas
- Batallas en tiempo real
- Animaciones de combate
- Cálculo de daño basado en estadísticas
- Historial de batallas
- Sistema de puntuación

### Panel de Administración
- Gestión de usuarios
- Gestión de personajes
- Monitoreo de batallas
- Estadísticas del sistema

### Ranking Global
- Clasificación por puntos
- Estadísticas de jugadores
- Historial de victorias/derrotas

## Requisitos Técnicos

### Frontend
- Node.js 18+
- npm 9+
- Angular CLI 16+

### Backend
- Java 17+
- Maven 3.8+
- MySQL 8+

## Configuración del Entorno

### Base de Datos
1. Instalar MySQL 8
2. Crear base de datos:
   ```sql
   CREATE DATABASE epicb_db;
   ```
3. Configurar usuario y contraseña en application.properties

### Backend
1. Clonar el repositorio
2. Configurar application.properties:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/epicb_db
   spring.datasource.username=tu_usuario
   spring.datasource.password=tu_contraseña
   ```
3. Ejecutar:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

### Frontend
1. Navegar al directorio frontend:
   ```bash
   cd frontend/epicb-frontend
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Iniciar servidor de desarrollo:
   ```bash
   ng serve
   ```

## Acceso a la Aplicación

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8081/api
- **Swagger/OpenAPI**: http://localhost:8081/swagger-ui.html

## Estructura del Proyecto

```
epicb-api-Front/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   ├── controllers/
│   │   │   │   ├── models/
│   │   │   │   ├── services/
│   │   │   │   └── security/
│   │   │   └── resources/
│   │   └── test/
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── guards/
│   │   │   └── models/
│   │   ├── assets/
│   │   └── environments/
│   ├── package.json
│   └── angular.json
└── README.md
```

## Características de Seguridad

- Autenticación JWT
- Protección CSRF
- Encriptación de contraseñas
- Validación de datos
- Protección contra XSS
- Rate limiting
- Sanitización de entrada

## Mantenimiento y Soporte

### Logs
- Los logs del backend se encuentran en `/logs/epicb.log`
- Los logs del frontend se muestran en la consola del navegador

### Monitoreo
- Endpoints de health check
- Métricas de Spring Actuator
- Monitoreo de rendimiento

## Solución de Problemas

### Problemas Comunes
1. Error de conexión a la base de datos:
   - Verificar credenciales en application.properties
   - Comprobar que MySQL está ejecutándose

2. Error al iniciar el frontend:
   - Limpiar caché: `npm clean-cache`
   - Reinstalar dependencias: `npm install`

3. Problemas de autenticación:
   - Verificar token JWT en localStorage
   - Comprobar cookies de sesión

## Contribución

1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-caracteristica`
3. Commit cambios: `git commit -am 'Añadir nueva característica'`
4. Push a la rama: `git push origin feature/nueva-caracteristica`
5. Crear Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE.md para más detalles.
