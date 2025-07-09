const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
    console.log('=== Simple API Handler Started ===');
    console.log('Method:', req.method);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        console.log('Handling OPTIONS request');
        return res.status(200).end();
    }

    // Handle GET request for testing
    if (req.method === 'GET') {
        console.log('Handling GET request');
        return res.status(200).json({ 
            message: 'Simple book appointment API is working',
            timestamp: new Date().toISOString(),
            method: req.method
        });
    }

    // Handle POST request
    if (req.method === 'POST') {
        console.log('Handling POST request');
        console.log('Body:', req.body);
        
        try {
            const { service, date, time, name, email, phone, notes } = req.body;

            // Simple validation
            if (!service || !date || !time || !name || !email || !phone) {
                return res.status(400).json({ 
                    message: 'Todos los campos obligatorios deben ser completados',
                    received: { service, date, time, name, email, phone }
                });
            }

            // For now, just return success without sending email
            console.log('Booking data received successfully');
            return res.status(200).json({ 
                message: 'Cita reservada exitosamente (modo prueba)',
                booking: { service, date, time, name, email, phone, notes },
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error processing booking:', error);
            return res.status(500).json({ 
                message: 'Error interno del servidor',
                error: error.message 
            });
        }
    }

    // Method not allowed
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
};
