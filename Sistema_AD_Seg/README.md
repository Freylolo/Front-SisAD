# SISTEMA INTEGRAL DE GESTIÓN PARA LA URBANIZACIÓN ‘CAMINO REAL’: MONITOREO DE ACCESO VEHICULAR, CONTROL DE ALÍCUOTAS Y COMUNICACIÓN ÁGIL

## Descripción del Proyecto
**Autor:** Freya López López

**Institución:** Universidad de Guayaquil

## Resumen:

El SISTEMA INTEGRAL DE GESTIÓN PARA LA URBANIZACIÓN ‘CAMINO REAL’ es una herramienta web completa diseñada para optimizar la administración y gestión de la urbanización Camino Real. Este sistema abarca tres módulos principales:

1. **Monitoreo de Acceso Vehicular:**
    - Registro y control del ingreso y salida de vehículos y personas a la urbanización.
    - Generación de reportes detallados de accesos.
    - Visualización en tiempo real del estado de acceso (entrada/salida).

2. **Control de Alicuotas:**
    - Registro mensual de los valores a pagar por parte de residentes y propietarios.
    - Visualización de las deudas pendientes de pago.
    - Envío de notificaciones automáticas a residentes y propietarios sobre sus obligaciones.
    - Generación de estados de cuenta personalizados.

3. **Comunicación Ágil:**
    - Creación y gestión de eventos sociales dentro de la urbanización.
    - Envío de anuncios y notificaciones importantes a los residentes.
    - Foro comunitario para la comunicación y el intercambio de información entre residentes.

## Tecnologías Utilizadas
- **Front-end:** Angular 17.3.0
- **Back-end:** PHP 8.1.10

### Librerías:
- Font-Awesome
- ngx-scanner-qrcode
- angularx-qrcode
- Bootstrap
- xlsx

## Imágenes del Sistema

**Módulo de Monitoreo de Acceso Vehicular:**

![Imagen del módulo de Monitoreo de Acceso Vehicular](Imagen del módulo de Monitoreo de Acceso Vehicular)

**Módulo de Control de Alicuotas:**

(Imagen del módulo de Control de Alicuotas)

**Módulo de Comunicación Ágil:**

(Imagen del módulo de Comunicación Ágil)

## Levantamiento del Servidor

### Requisitos:
- Servidor web con soporte para PHP y MySQL
- Base de datos MySQL

### Pasos:
1. Clonar el repositorio del proyecto en su servidor.
2. Configurar la conexión a la base de datos en el archivo `config.php`.
3. Ejecutar el comando `composer install` para instalar las dependencias de PHP.
4. Ejecutar el comando `npm install` para instalar las dependencias de Angular.
5. Ejecutar el comando `ng build` para compilar el front-end de Angular.
6. Copiar la carpeta `dist` de Angular a la raíz del servidor web.
7. Acceder al sistema a través de la URL `http://localhost/` (o la URL correspondiente a su servidor).

**Nota:**
Se recomienda consultar la documentación detallada del proyecto para obtener instrucciones más completas sobre la instalación y configuración del sistema.
