# Chamaco The Barber - Sitio Web

Una página web moderna y responsive para barbería con sistema de reservas integrado.

## 🚀 Características

- **Diseño Moderno**: Estilo urbano minimalista con colores oscuros y acentos brillantes
- **Responsive**: Optimizado para dispositivos móviles
- **Sistema de Reservas**: Calendario inteligente con disponibilidad en tiempo real
- **Galería**: Showcase de trabajos realizados
- **Formulario de Contacto**: Comunicación directa con los clientes
- **Notificaciones por Email**: Confirmaciones automáticas de citas
- **Animaciones Suaves**: Transiciones y efectos modernos

## 📋 Requisitos Previos

- Node.js 18 o superior
- Cuenta en Vercel
- Cuenta de Gmail (para el envío de emails)

## 🛠️ Instalación Local

1. Clona o descarga el proyecto
2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Ejecuta en modo desarrollo:
   ```bash
   npm run dev
   ```

4. Abre tu navegador en `http://localhost:3000`

## 📧 Configuración de Email

Para que funcione el sistema de envío de emails, necesitas configurar las siguientes variables de entorno:

### Variables de Entorno Requeridas:

- `EMAIL_USER`: Tu email de Gmail (ej: tu-email@gmail.com)
- `EMAIL_PASS`: Contraseña de aplicación de Gmail
- `BARBER_EMAIL`: Email donde recibirás las notificaciones de citas (opcional, usa EMAIL_USER por defecto)

### Obtener Contraseña de Aplicación de Gmail:

1. Ve a tu cuenta de Google → Seguridad
2. Activa la verificación en 2 pasos
3. Ve a "Contraseñas de aplicaciones"
4. Genera una nueva contraseña para "Otra aplicación personalizada"
5. Usa esa contraseña en la variable `EMAIL_PASS`

## 🚀 Despliegue en Vercel

### Opción 1: Desde GitHub

1. **Sube el código a GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/chamaco-barberia.git
   git push -u origin main
   ```

2. **Conecta con Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Inicia sesión con GitHub
   - Click "Import Project"
   - Selecciona tu repositorio
   - Vercel detectará automáticamente la configuración

3. **Configura las Variables de Entorno:**
   - En el dashboard de Vercel, ve a Settings → Environment Variables
   - Agrega:
     - `EMAIL_USER`: tu-email@gmail.com
     - `EMAIL_PASS`: tu-contraseña-de-aplicación
     - `BARBER_EMAIL`: email-del-barbero@gmail.com

4. **Despliega:**
   - Click "Deploy"
   - Vercel construirá y desplegará automáticamente

### Opción 2: Desde Vercel CLI

1. **Instala Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Inicia sesión:**
   ```bash
   vercel login
   ```

3. **Despliega:**
   ```bash
   vercel
   ```

4. **Configura variables de entorno:**
   ```bash
   vercel env add EMAIL_USER
   vercel env add EMAIL_PASS
   vercel env add BARBER_EMAIL
   ```

5. **Redespliega con las variables:**
   ```bash
   vercel --prod
   ```

## 🎨 Personalización

### Colores y Estilos

Edita `public/css/styles.css` para cambiar:
- Colores principales (busca `#ff4444` para el rojo principal)
- Tipografías
- Animaciones
- Layout responsive

### Contenido

Edita `public/index.html` para cambiar:
- Textos y títulos
- Información de contacto
- Servicios y precios
- Imágenes de la galería

### Horarios de Trabajo

En `public/js/scripts.js`, función `loadAvailableTimes()`:
```javascript
// Horarios domingo
startHour = 10;
endHour = 17;

// Horarios lunes a sábado  
startHour = 9;
endHour = 19;
```

## 📱 Funcionalidades

### Sistema de Reservas
- Calendario con bloqueo automático de horarios ocupados
- Validación en tiempo real
- Emails de confirmación automáticos
- Horarios personalizables por día

### Galería
- Lightbox para ver imágenes en grande
- Lazy loading para mejor rendimiento
- Grid responsive

### Formulario de Contacto
- Validación en tiempo real
- Auto-respuesta al cliente
- Notificación al barbero

## 🔧 Estructura del Proyecto

```
chamaco-barberia/
├── public/
│   ├── index.html          # Página principal
│   ├── css/
│   │   └── styles.css      # Estilos principales
│   ├── js/
│   │   └── scripts.js      # JavaScript principal
│   └── images/             # Imágenes estáticas
├── api/
│   ├── book-appointment.js # API para reservas
│   └── send-contact.js     # API para contacto
├── package.json            # Dependencias
├── vercel.json            # Configuración de Vercel
└── README.md              # Este archivo
```

## 🐛 Solución de Problemas

### Los emails no se envían
- Verifica que las variables de entorno estén configuradas correctamente
- Asegúrate de usar una contraseña de aplicación de Gmail, no tu contraseña normal
- Revisa los logs en Vercel Dashboard → Functions

### La página no carga
- Verifica que todos los archivos estén en la carpeta `public/`
- Revisa la configuración en `vercel.json`

### Problemas de responsive
- Abre las herramientas de desarrollador (F12)
- Usa el modo dispositivo móvil para probar
- Verifica que el viewport meta tag esté presente

## 📞 Soporte

Para soporte técnico o personalización adicional, contacta al desarrollador.

## 📄 Licencia

MIT License - puedes usar, modificar y distribuir libremente.

---

¡Tu barbería moderna está lista para el mundo digital! 💈✨
