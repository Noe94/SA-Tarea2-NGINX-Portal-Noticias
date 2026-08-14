# TechPulse - Portal de Noticias con NGINX y Docker Compose

TechPulse es un portal académico de noticias tecnológicas desarrollado como parte de la Tarea 2 de Software Avanzado.

El proyecto utiliza React para la interfaz web, Docker para contenerizar la aplicación, Docker Compose para administrar los servicios y NGINX como proxy inverso, sistema de enrutamiento y balanceador de carga.

El contenido textual y las imágenes utilizadas en las publicaciones fueron generados o asistidos mediante inteligencia artificial con fines exclusivamente académicos.

> Las publicaciones mostradas en TechPulse no representan información periodística verificada.

---

## Tecnologías utilizadas

- React
- Vite
- React Router
- Node.js
- NGINX
- Docker
- Docker Compose
- HTML
- CSS
- JavaScript
- ChatGPT para generación y asistencia del contenido académico

---

## Arquitectura de la solución

La aplicación utiliza dos instancias independientes del portal, ambas ejecutándose dentro de contenedores.

Un tercer contenedor ejecuta NGINX y funciona como único punto de entrada desde el sistema anfitrión.

```text
                         Navegador
                             │
                             │
                    http://localhost:8080
                             │
                             ▼
                  ┌─────────────────────┐
                  │    NGINX EXTERNO    │
                  │                     │
                  │   Reverse Proxy     │
                  │   Enrutamiento      │
                  │   Round Robin       │
                  └──────────┬──────────┘
                             │
                   techpulse-network
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
             ┌─────────────┐   ┌─────────────┐
             │    app1     │   │    app2     │
             │             │   │             │
             │ React       │   │ React       │
             │ NGINX       │   │ NGINX       │
             │ puerto 80   │   │ puerto 80   │
             └─────────────┘   └─────────────┘
```

Las instancias `app1` y `app2` no publican puertos hacia el sistema anfitrión.

Únicamente el contenedor `techpulse-nginx` publica el puerto `8080`, por lo que todas las solicitudes externas deben ingresar mediante NGINX.

---

## Estructura del proyecto

```text
SA-Tarea2-NGINX-Portal-Noticias/
│
├── app/
│   ├── public/
│   │   └── images/
│   ├── src/
│   │   ├── data/
│   │   │   └── noticias.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.js
│
├── nginx/
│   └── nginx.conf
│
├── docker-compose.yml
├── PROMPTS.md
└── README.md
```

---

## Requisitos para ejecutar el proyecto

Es necesario tener instalados:

- Docker
- Docker Compose

No es necesario ejecutar manualmente React ni instalar las dependencias de Node.js en el sistema anfitrión para utilizar la solución final.

El proceso de construcción de la aplicación se realiza dentro de Docker.

---

## Construcción e inicio de los contenedores

Desde la raíz del repositorio ejecutar:

```bash
docker compose up -d --build
```

Este único comando:

1. Construye la imagen de `app1`.
2. Construye la imagen de `app2`.
3. Crea la red interna de Docker.
4. Inicia ambas instancias.
5. Inicia el contenedor NGINX.
6. Publica el portal mediante el puerto `8080`.

---

## Verificar contenedores

Ejecutar:

```bash
docker compose ps
```

El resultado debe mostrar tres servicios activos:

```text
techpulse-app1
techpulse-app2
techpulse-nginx
```

Las aplicaciones únicamente muestran el puerto interno `80/tcp`.

El contenedor NGINX debe mostrar un puerto similar a:

```text
0.0.0.0:8080->80/tcp
```

Esto demuestra que NGINX es el único servicio publicado directamente hacia el sistema anfitrión.

---

## Acceso al portal

Abrir en el navegador:

```text
http://localhost:8080
```

---

## Rutas principales

### Página principal

```text
/
```

Ejemplo:

```text
http://localhost:8080/
```

---

### Listado de noticias

```text
/noticias
```

Ejemplo:

```text
http://localhost:8080/noticias
```

---

### Noticia individual

```text
/noticias/:id
```

Ejemplos:

```text
http://localhost:8080/noticias/1
http://localhost:8080/noticias/3
http://localhost:8080/noticias/6
```

React Router gestiona las rutas internas de la aplicación.

El NGINX incluido dentro de cada instancia utiliza una configuración compatible con aplicaciones SPA para permitir actualizar directamente una ruta como:

```text
/noticias/3
```

sin producir un error 404.

---

### Contenido estático mediante NGINX

También se configuró una regla específica:

```text
/imagenes/
```

Ejemplo:

```text
http://localhost:8080/imagenes/robotica.webp
```

Esta ruta es atendida directamente por el NGINX externo y permite demostrar una regla adicional de enrutamiento sin necesidad de implementar una API.

---

### Identificación de instancia

La ruta:

```text
/instancia
```

permite comprobar cuál instancia respondió una solicitud de verificación.

Ejemplo:

```text
http://localhost:8080/instancia
```

La respuesta puede ser:

```text
app1
```

o:

```text
app2
```

El portal también presenta esta información visualmente en el pie de página.

---

## Balanceo de carga

NGINX posee un grupo `upstream` con las dos instancias de la aplicación:

```nginx
upstream techpulse_backend {
    server app1:80;
    server app2:80;
}
```

Se utiliza el algoritmo **Round Robin**, que es el método de balanceo predeterminado de NGINX.

Round Robin distribuye las solicitudes consecutivamente entre los servidores disponibles.

Por ejemplo:

```text
Solicitud 1 -> app1
Solicitud 2 -> app2
Solicitud 3 -> app1
Solicitud 4 -> app2
```

De esta manera, las solicitudes no son atendidas por una sola instancia.

---

## Comprobar el balanceo de carga

En PowerShell puede ejecutarse:

```powershell
1..10 | ForEach-Object {
    $instancia = Invoke-RestMethod http://localhost:8080/instancia
    Write-Host "Solicitud $_ -> $instancia"
}
```

Un resultado esperado es:

```text
Solicitud 1 -> app1
Solicitud 2 -> app2
Solicitud 3 -> app1
Solicitud 4 -> app2
Solicitud 5 -> app1
Solicitud 6 -> app2
Solicitud 7 -> app1
Solicitud 8 -> app2
Solicitud 9 -> app1
Solicitud 10 -> app2
```

Esto demuestra que NGINX distribuye las solicitudes entre las dos instancias.

---

## Prueba de tolerancia a fallo

Para comprobar que el portal continúa disponible cuando una instancia deja de funcionar puede detenerse `app1`:

```bash
docker stop techpulse-app1
```

Comprobar los servicios activos:

```bash
docker compose ps
```

El portal continúa disponible mediante:

```text
http://localhost:8080
```

También puede verificarse la instancia disponible:

```powershell
1..5 | ForEach-Object {
    Invoke-RestMethod http://localhost:8080/instancia
}
```

Durante esta prueba las respuestas deben provenir de:

```text
app2
```

La primera instancia puede iniciarse nuevamente con:

```bash
docker start techpulse-app1
```

Después de reincorporarse al grupo de servidores, NGINX vuelve a distribuir solicitudes entre ambas instancias.

---

## Red interna

Docker Compose crea una red bridge denominada:

```text
techpulse-network
```

Los servicios:

```text
app1
app2
nginx
```

pertenecen a esta red.

NGINX puede comunicarse con las aplicaciones utilizando directamente los nombres de los servicios:

```text
app1:80
app2:80
```

No es necesario configurar direcciones IP manualmente.

---

## Proxy inverso

NGINX conserva información relevante de la solicitud mediante encabezados como:

```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

Además, se configuró comportamiento para continuar utilizando otra instancia disponible cuando ocurre un error de conexión con uno de los servidores.

---

## Dockerfile

La aplicación utiliza un Dockerfile multietapa.

La primera etapa utiliza Node.js para:

```text
npm ci
npm run build
```

y generar la versión de producción de React.

La segunda etapa utiliza NGINX para servir exclusivamente los archivos resultantes.

De esta manera la aplicación puede construirse completamente dentro del entorno Docker.

---

## Contenido del portal

TechPulse incluye seis publicaciones:

1. Inteligencia Artificial.
2. Ciberseguridad.
3. Robótica.
4. Computación cuántica.
5. Realidad extendida.
6. Tecnología espacial.

Cada publicación contiene:

- Título.
- Fecha.
- Categoría.
- Imagen relacionada.
- Resumen.
- Contenido ampliado.
- Identificación de la herramienta de inteligencia artificial utilizada.

---

## Uso de inteligencia artificial

La herramienta utilizada fue:

```text
ChatGPT
```

Los textos fueron generados o asistidos mediante inteligencia artificial y posteriormente incorporados al proyecto con fines académicos.

Cada noticia contiene la atribución:

> **Fuente del texto:** Contenido generado con ChatGPT y revisado para fines académicos.

El portal también incluye una advertencia general indicando que el contenido no constituye información periodística verificada.

Los prompts principales utilizados están disponibles en:

```text
PROMPTS.md
```

---

## Imágenes

Las imágenes relacionadas con las noticias fueron generadas mediante herramientas de generación de imágenes disponibles en ChatGPT.

Los recursos se almacenan localmente dentro del proyecto:

```text
app/public/images/
```

Esto evita que el portal dependa de servicios externos para mostrar las imágenes durante su ejecución.

---

## Detener la solución

Para detener los contenedores:

```bash
docker compose down
```

Para volver a levantar todo el proyecto:

```bash
docker compose up -d --build
```

---

## Proyecto académico

TechPulse fue desarrollado exclusivamente con fines académicos para demostrar:

- Contenerización de aplicaciones web.
- Uso de Docker Compose.
- Redes internas de Docker.
- Proxy inverso con NGINX.
- Reglas de enrutamiento.
- Balanceo de carga mediante Round Robin.
- Disponibilidad ante la caída de una instancia.
- Uso responsable de contenido generado o asistido mediante inteligencia artificial.