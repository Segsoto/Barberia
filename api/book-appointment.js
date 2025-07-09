const nodemailer = require('nodemailer');
const Airtable = require('airtable');

module.exports = async function handler(req, res) {
    console.log('=== API Handler Started ===');
    console.log('Method:', req.method);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        console.log('Handling OPTIONS request');
        res.status(200).end();
        return;
    }

    // Handle GET request for testing
    if (req.method === 'GET') {
        console.log('Handling GET request');
        return res.status(200).json({ 
            message: 'Book appointment API is working',
            timestamp: new Date().toISOString()
        });
    }

    // Only allow POST requests for actual booking
    if (req.method !== 'POST') {
        console.log('Method not allowed:', req.method);
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

        console.log('Processing booking...', { service, date, time, name, email, phone });

        // Save booking to database (Airtable)
        let bookingSaved = false;
        let bookingId = null;
        let dbError = null;

        try {
            console.log('Saving booking to database...');
            
            // Configure Airtable (only if credentials are available)
            if (process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID) {
                const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
                
                const serviceDetails = getServiceDetails(service);
                
                // Create record in Airtable
                const record = await base('Citas').create([
                    {
                        fields: {
                            'Nombre': name,
                            'Email': email,
                            'Teléfono': phone,
                            'Servicio': serviceDetails.name,
                            'Precio': serviceDetails.price,
                            'Fecha': date,
                            'Hora': time,
                            'Notas': notes || '',
                            'Estado': 'Pendiente',
                            'Fecha_Creacion': new Date().toISOString(),
                        }
                    }
                ]);
                
                bookingId = record[0].getId();
                bookingSaved = true;
                console.log('Booking saved to database with ID:', bookingId);
            } else {
                console.log('Database credentials not configured - skipping database save');
                dbError = 'Database not configured';
            }
        } catch (error) {
            console.error('Failed to save booking to database:', error.message);
            dbError = error.message;
            // Continue - don't fail the booking just because database failed
        }

        // Try to send email notification, but don't fail if it doesn't work
        let emailSent = false;
        let emailError = null;

        try {
            console.log('Attempting to send email notification...');
            console.log('Environment variables check:', {
                EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Missing',
                EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Missing',
                BARBER_EMAIL: process.env.BARBER_EMAIL ? 'Set' : 'Missing'
            });

            // Check if email credentials are available
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                throw new Error('Email credentials not configured');
            }
            
            // Configure email transporter with more specific settings
            const transporter = nodemailer.createTransporter({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                },
                secure: true,
                port: 465
            });

            // Test connection first
            console.log('Testing email connection...');
            await transporter.verify();
            console.log('Email connection verified successfully');

            // Get service details
            const serviceDetails = getServiceDetails(service);
            
            // Format date and time for display
            const formattedDate = formatDate(date);
            const formattedTime = formatTime(time);

            // Email to barber (shop owner)
            const barberEmailHtml = `
                <h2>Nueva Cita Reservada - Chamaco The Barber</h2>
                <p><strong>Servicio:</strong> ${serviceDetails.name} (${serviceDetails.price})</p>
                <p><strong>Fecha:</strong> ${formattedDate}</p>
                <p><strong>Hora:</strong> ${formattedTime}</p>
                <p><strong>Cliente:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Teléfono:</strong> ${phone}</p>
                ${notes ? `<p><strong>Notas:</strong> ${notes}</p>` : ''}
                <p><em>Reservado el ${new Date().toLocaleString('es-ES')}</em></p>
            `;

            // Email to customer
            const customerEmailHtml = `
                <h2>Confirmación de Cita - Chamaco The Barber</h2>
                <p>Hola ${name},</p>
                <p>Tu cita ha sido confirmada:</p>
                <p><strong>Servicio:</strong> ${serviceDetails.name} (${serviceDetails.price})</p>
                <p><strong>Fecha:</strong> ${formattedDate}</p>
                <p><strong>Hora:</strong> ${formattedTime}</p>
                <p>Nos vemos pronto en Chamaco The Barber!</p>
                <p><em>Si necesitas cambiar tu cita, contáctanos al +506 8888-8888</em></p>
            `;

            // Send email to barber
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: process.env.BARBER_EMAIL || process.env.EMAIL_USER,
                subject: `Nueva Cita: ${serviceDetails.name} - ${formattedDate}`,
                html: barberEmailHtml
            });

            // Send confirmation email to customer
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Confirmación de Cita - Chamaco The Barber',
                html: customerEmailHtml
            });

            console.log('Email notifications sent successfully');
            emailSent = true;

        } catch (error) {
            console.error('Failed to send email:', error.message);
            emailError = error.message;
            // Don't fail the booking just because email failed
        }
        
        console.log('Booking processed successfully');
        
        return res.status(200).json({ 
            message: 'Cita reservada exitosamente',
            booking: {
                service,
                date,
                time,
                name,
                email,
                phone,
                notes: notes || '',
                timestamp: new Date().toISOString(),
                bookingId: bookingId
            },
            database: {
                saved: bookingSaved,
                error: bookingSaved ? null : dbError
            },
            email: {
                sent: emailSent,
                error: emailSent ? null : emailError
            }
        });

    } catch (error) {
        console.error('Error processing booking:', error);
        return res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error.message 
        });
    }
};

// Helper functions
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
