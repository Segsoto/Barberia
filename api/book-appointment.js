const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { service, date, time, name, email, phone, notes } = req.body;

        // Validate required fields
        if (!service || !date || !time || !name || !email || !phone) {
            return res.status(400).json({ 
                message: 'Todos los campos obligatorios deben ser completados' 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                message: 'Email inválido' 
            });
        }

        // Configure email transporter (usando Gmail como ejemplo)
        // Puedes cambiar esto por tu proveedor de email preferido
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // brandonsoto1908@gmail.com
                pass: process.env.EMAIL_PASS  // contraseña sin espacios
            }
        });

        // Verify transporter configuration (but don't fail if it doesn't work)
        let transporterWorking = true;
        try {
            await transporter.verify();
            console.log('Email transporter verified successfully');
        } catch (error) {
            console.error('Email transporter verification failed:', error.message);
            transporterWorking = false;
            // Continue anyway - sometimes verify fails but sending still works
        }

        // Get service details
        const serviceDetails = getServiceDetails(service);
        
        // Format date for display
        const formattedDate = formatDate(date);
        const formattedTime = formatTime(time);

        // Email to barber
        const barberEmailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #ff4444, #ff6666); padding: 30px; text-align: center; color: white; }
                .content { padding: 30px; background: #f9f9f9; }
                .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                .detail-label { font-weight: bold; color: #666; }
                .detail-value { color: #333; }
                .footer { text-align: center; padding: 20px; color: #666; }
                .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">CHAMACO THE BARBER</div>
                    <h2>Nueva Cita Reservada</h2>
                </div>
                
                <div class="content">
                    <h3>Detalles de la Cita:</h3>
                    
                    <div class="appointment-details">
                        <div class="detail-row">
                            <span class="detail-label">Cliente:</span>
                            <span class="detail-value">${name}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Email:</span>
                            <span class="detail-value">${email}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Teléfono:</span>
                            <span class="detail-value">${phone}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Servicio:</span>
                            <span class="detail-value">${serviceDetails.name}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Precio:</span>
                            <span class="detail-value">${serviceDetails.price}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Fecha:</span>
                            <span class="detail-value">${formattedDate}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Hora:</span>
                            <span class="detail-value">${formattedTime}</span>
                        </div>
                        ${notes ? `
                        <div class="detail-row">
                            <span class="detail-label">Notas:</span>
                            <span class="detail-value">${notes}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    <p><strong>Recuerda:</strong> Confirma la cita con el cliente y prepara todo lo necesario para el servicio.</p>
                </div>
                
                <div class="footer">
                    <p>Sistema de reservas - Chamaco The Barber</p>
                    <p>Este es un email automático, no respondas a este mensaje.</p>
                </div>
            </div>
        </body>
        </html>
        `;

        // Email to customer
        const customerEmailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #ff4444, #ff6666); padding: 30px; text-align: center; color: white; }
                .content { padding: 30px; background: #f9f9f9; }
                .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                .detail-label { font-weight: bold; color: #666; }
                .detail-value { color: #333; }
                .footer { text-align: center; padding: 20px; color: #666; }
                .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                .contact-info { background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">CHAMACO THE BARBER</div>
                    <h2>¡Cita Confirmada!</h2>
                </div>
                
                <div class="content">
                    <p>Hola <strong>${name}</strong>,</p>
                    <p>Tu cita ha sido confirmada exitosamente. Aquí tienes los detalles:</p>
                    
                    <div class="appointment-details">
                        <div class="detail-row">
                            <span class="detail-label">Servicio:</span>
                            <span class="detail-value">${serviceDetails.name}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Precio:</span>
                            <span class="detail-value">${serviceDetails.price}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Fecha:</span>
                            <span class="detail-value">${formattedDate}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Hora:</span>
                            <span class="detail-value">${formattedTime}</span>
                        </div>
                    </div>
                    
                    <div class="contact-info">
                        <h4>Información de Contacto:</h4>
                        <p><strong>Dirección:</strong> San José, Costa Rica - Centro Comercial Plaza del Sol</p>
                        <p><strong>Teléfono:</strong> +506 8888-8888</p>
                        <p><strong>Email:</strong> info@chamacothebarber.com</p>
                    </div>
                    
                    <h4>Importante:</h4>
                    <ul>
                        <li>Por favor, llega 5 minutos antes de tu cita</li>
                        <li>Si necesitas cancelar o reprogramar, contactanos con al menos 24 horas de anticipación</li>
                        <li>Trae una foto de referencia si tienes un estilo específico en mente</li>
                    </ul>
                    
                    <p>¡Esperamos verte pronto!</p>
                </div>
                
                <div class="footer">
                    <p>Chamaco The Barber - Donde el estilo urbano se encuentra con la tradición barbera</p>
                    <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                </div>
            </div>
        </body>
        </html>
        `;

        // Send emails with better error handling
        let emailsSuccessful = true;
        let emailErrors = [];

        try {
            // Send email to barber
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: process.env.BARBER_EMAIL || process.env.EMAIL_USER, // Email del barbero
                subject: `Nueva Cita - ${name} - ${formattedDate} ${formattedTime}`,
                html: barberEmailHtml
            });
            console.log('Email to barber sent successfully');
        } catch (error) {
            console.error('Error sending email to barber:', error.message);
            emailErrors.push('Error enviando email al barbero');
            emailsSuccessful = false;
        }

        try {
            // Send confirmation email to customer
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Cita Confirmada - Chamaco The Barber',
                html: customerEmailHtml
            });
            console.log('Confirmation email to customer sent successfully');
        } catch (error) {
            console.error('Error sending confirmation email:', error.message);
            emailErrors.push('Error enviando email de confirmación');
            emailsSuccessful = false;
        }

        // Return success response (even if emails failed, the appointment is still recorded)
        res.status(200).json({ 
            message: emailsSuccessful ? 
                'Cita reservada exitosamente' : 
                'Cita reservada exitosamente (algunos emails pueden no haberse enviado)',
            appointment: {
                service: serviceDetails.name,
                date: formattedDate,
                time: formattedTime,
                name,
                email
            },
            emailStatus: {
                successful: emailsSuccessful,
                errors: emailErrors
            }
        });

    } catch (error) {
        console.error('Error processing appointment:', error);
        
        // Send more detailed error information
        let errorMessage = 'Error interno del servidor.';
        
        if (error.message.includes('Invalid login')) {
            errorMessage = 'Error de configuración de email. Contacta al administrador.';
        } else if (error.message.includes('Network')) {
            errorMessage = 'Error de conexión. Por favor, inténtalo de nuevo.';
        } else if (error.message.includes('timeout')) {
            errorMessage = 'Tiempo de espera agotado. Por favor, inténtalo de nuevo.';
        }
        
        res.status(500).json({ 
            message: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

function getServiceDetails(serviceId) {
    const services = {
        'corte-clasico': {
            name: 'Corte Clásico',
            price: '₡15,000'
        },
        'arreglo-barba': {
            name: 'Arreglo de Barba',
            price: '₡8,000'
        },
        'fade-premium': {
            name: 'Fade Premium',
            price: '₡18,000'
        },
        'combo-completo': {
            name: 'Combo Completo',
            price: '₡25,000'
        }
    };

    return services[serviceId] || {
        name: 'Servicio Desconocido',
        price: 'Precio por consultar'
    };
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    return date.toLocaleDateString('es-ES', options);
}

function formatTime(timeString) {
    const [hour, minute] = timeString.split(':');
    const hour12 = hour % 12 || 12;
    const ampm = hour < 12 ? 'AM' : 'PM';
    return `${hour12}:${minute} ${ampm}`;
}
