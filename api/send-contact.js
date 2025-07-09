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
        const { name, email, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ 
                message: 'Todos los campos son obligatorios' 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                message: 'Email inválido' 
            });
        }

        // Configure email transporter
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // brandonsoto1908@gmail.com
                pass: process.env.EMAIL_PASS  // contraseña sin espacios
            }
        });

        // Verify transporter configuration
        try {
            await transporter.verify();
            console.log('Email transporter ready');
        } catch (error) {
            console.error('Email transporter error:', error);
            throw new Error('Configuración de email incorrecta');
        }

        // Email to barber/business owner
        const contactEmailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #ff4444, #ff6666); padding: 30px; text-align: center; color: white; }
                .content { padding: 30px; background: #f9f9f9; }
                .message-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                .detail-label { font-weight: bold; color: #666; min-width: 100px; }
                .detail-value { color: #333; flex: 1; margin-left: 20px; }
                .message-content { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
                .footer { text-align: center; padding: 20px; color: #666; }
                .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">CHAMACO THE BARBER</div>
                    <h2>Nuevo Mensaje de Contacto</h2>
                </div>
                
                <div class="content">
                    <h3>Detalles del Mensaje:</h3>
                    
                    <div class="message-details">
                        <div class="detail-row">
                            <span class="detail-label">Nombre:</span>
                            <span class="detail-value">${name}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Email:</span>
                            <span class="detail-value">${email}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Asunto:</span>
                            <span class="detail-value">${subject}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Fecha:</span>
                            <span class="detail-value">${new Date().toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}</span>
                        </div>
                    </div>
                    
                    <h4>Mensaje:</h4>
                    <div class="message-content">
                        ${message.replace(/\n/g, '<br>')}
                    </div>
                    
                    <p><strong>Responde directamente a este email</strong> para contactar al cliente.</p>
                </div>
                
                <div class="footer">
                    <p>Sistema de contacto - Chamaco The Barber</p>
                    <p>Este mensaje fue enviado desde tu sitio web.</p>
                </div>
            </div>
        </body>
        </html>
        `;

        // Auto-reply email to customer
        const autoReplyEmailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #ff4444, #ff6666); padding: 30px; text-align: center; color: white; }
                .content { padding: 30px; background: #f9f9f9; }
                .message-summary { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #666; }
                .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                .contact-info { background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">CHAMACO THE BARBER</div>
                    <h2>Mensaje Recibido</h2>
                </div>
                
                <div class="content">
                    <p>Hola <strong>${name}</strong>,</p>
                    <p>Hemos recibido tu mensaje y te responderemos en las próximas 24 horas.</p>
                    
                    <div class="message-summary">
                        <h4>Resumen de tu mensaje:</h4>
                        <p><strong>Asunto:</strong> ${subject}</p>
                        <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}</p>
                    </div>
                    
                    <div class="contact-info">
                        <h4>Mientras tanto, puedes contactarnos directamente:</h4>
                        <p><strong>Teléfono:</strong> +506 8888-8888</p>
                        <p><strong>WhatsApp:</strong> +506 8888-8888</p>
                        <p><strong>Dirección:</strong> San José, Costa Rica - Centro Comercial Plaza del Sol</p>
                        <p><strong>Horarios:</strong></p>
                        <ul>
                            <li>Lunes - Sábado: 9:00 AM - 7:00 PM</li>
                            <li>Domingo: 10:00 AM - 5:00 PM</li>
                        </ul>
                    </div>
                    
                    <p>¡Gracias por contactarnos!</p>
                </div>
                
                <div class="footer">
                    <p>Chamaco The Barber - Donde el estilo urbano se encuentra con la tradición barbera</p>
                    <p>Este es un mensaje automático, por favor no respondas a este email.</p>
                </div>
            </div>
        </body>
        </html>
        `;

        // Send email to business owner
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.BARBER_EMAIL || process.env.EMAIL_USER,
            replyTo: email, // This allows replying directly to the customer
            subject: `Contacto Web: ${subject}`,
            html: contactEmailHtml
        });

        // Send auto-reply to customer
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Mensaje Recibido - Chamaco The Barber',
            html: autoReplyEmailHtml
        });

        // Return success response
        res.status(200).json({ 
            message: 'Mensaje enviado exitosamente. Te responderemos pronto.',
            contact: {
                name,
                email,
                subject,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error processing contact message:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor. Por favor, inténtalo de nuevo.' 
        });
    }
}
