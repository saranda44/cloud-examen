# Cloud Note Examen

API REST desplegada en EC2 que permite gestionar clientes, productos, domicilios y notas de venta. Al crear una nota, se desencadena un flujo en AWS para generar un PDF, subirlo a S3, y enviar un correo electrónico al cliente con el enlace de descarga.

---

## Estructura de carpetas

```
cloud-examen/
├── src/
│   ├── index.ts                  # Punto de entrada del servidor Express
│   ├── controllers/              # Lógica de negocio por entidad
│   │   ├── clientes.controller.ts
│   │   ├── domicilio.controller.ts
│   │   ├── notas.controller.ts
│   │   └── productos.controller.ts
│   ├── routes/                   # Definición de rutas por entidad
│   │   ├── routes.ts             # Router principal
│   │   ├── clientes.routes.ts
│   │   ├── domicilio.routes.ts
│   │   ├── notas.routes.ts
│   │   └── productos.routes.ts
│   ├── middlewares/              # Validaciones con express-validator
│   │   ├── validation.ts
│   │   ├── cliente.validation.ts
│   │   ├── domicilio.validation.ts
│   │   ├── nota.validation.ts
│   │   ├── nota.detalle.validation.ts
│   │   └── productos.validation.ts
│   ├── models/                   # Modelos de datos / interfaces TypeScript
│   ├── database/                 # Conexión a la base de datos (PostgreSQL / RDS)
│   │   └── connection.ts
│   └── services/                 # Integraciones con servicios AWS (SNS, S3, Lambda)
├── lambda/
│   ├── src/
│   │   ├── generatePDF.ts        # Lambda: genera PDF y lo sube a S3
│   │   └── sendEmail.ts          # Lambda: envía correo con enlace de descarga
│   ├── package.json
│   └── tsconfig.json
├── scripts/                      # Scripts de despliegue
├── dist/                         # Código compilado (generado por tsc)
├── .env                          # Variables de entorno 
├── package.json
└── tsconfig.json
```

---

## Servicios AWS utilizados

| Servicio | Uso |
|---|---|
| **Amazon RDS (PostgreSQL)** | Base de datos relacional para clientes, productos, domicilios y notas |
| **Amazon SNS** | Publicación de eventos al crear una nota (`noteCreated`) y al enviar correo (`sendEmail`) |
| **AWS Lambda** | Ejecución serverless de `generatePDF` y `sendEmail` |
| **Amazon S3** | Almacenamiento de los PDFs generados |
| **Amazon EC2** | Servidor donde corre la API REST |
| **AWS Secrets Manager** | Gestión segura de credenciales de base de datos |

---

## Librerías

| Librería | Propósito |
|---|---|
| `express-validator` | Validación de datos de entrada en los endpoints (body, params) |
| `pdfkit` | Generación programática de archivos PDF desde la Lambda |
| `@aws-sdk/client-sns` | Cliente para publicar mensajes en tópicos SNS |
| `@aws-sdk/client-s3` | Cliente para subir y descargar archivos de S3 |
| `@aws-sdk/client-secrets-manager` | Recuperar secretos (credenciales DB) desde Secrets Manager |
| `pg` | Driver de PostgreSQL para Node.js |

---

## Flujo de creación de nota

```
1. Se crea una nota mediante el endpoint `/notas`.
2. La información se guarda en la base de datos RDS.
3. Se envía un evento a SNS.
4. Una función Lambda genera el PDF de la nota.
5. El PDF se almacena en S3.
6. SNS envía un correo al cliente con el enlace de descarga.
```

---

## Endpoints disponibles

### Clientes — `/api/clientes`

| Método | Ruta 
|----|-----
| `GET` | `/api/clientes` 
| `GET` | `/api/clientes/:id` 
| `POST` | `/api/clientes` 
| `PUT` | `/api/clientes/:id` 
| `DELETE` | `/api/clientes/:id`
---

### Domicilios — `/api/domicilios`

| Método | Ruta 
|---|---
| `GET` | `/api/domicilios` 
| `GET` | `/api/domicilios/:id` 
| `GET` | `/api/domicilios/clientes/:id` 
| `POST` | `/api/domicilios` 
| `PUT` | `/api/domicilios/:id` 
| `DELETE` | `/api/domicilios/:id`

---

### Productos — `/api/productos`

| Método | Ruta 
|---|---
| `GET` | `/api/productos`
| `GET` | `/api/productos/:id`
| `POST` | `/api/productos` 
| `PUT` | `/api/productos/:id`
| `DELETE` | `/api/productos/:id` 

---

### Notas — `/api/notas`

| Método | Ruta 
|---|---
| `POST` | `/api/notas` 
| `GET` | `/api/notas/:id` 
| `GET` | `/api/notas/:rfc/:folio/descargar` 

---

## Variables de entorno

```env
RDS_HOST
SNS_TOPIC_ARN_NOTIFICATION
SNS_TOPIC_ARN_EMAIL
```

---

## Despliegue en EC2

### 1. Conexión a la instancia

```bash
ssh -i Examen1NubeKey.pem ec2-user@$EC2IP
```

### 2. Instalación de dependencias del sistema

```bash
sudo yum update -y
sudo yum install git -y
sudo yum install -y nodejs
```

### 3. Clonar el repositorio

```bash
git clone https://github.com/saranda44/cloud-examen.git
cd cloud-examen
```

### 4. Instalar dependencias y compilar

```bash
npm install
npm run build
```

### 5. Configurar variables de entorno

```bash
vi .env
```

### 8. Ejecutar el servidor

```bash
node dist/index.js
```

---
