module.exports = async function handler(req, res) {
    console.log('=== Email Diagnostics ===');
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const envCheck = {
            EMAIL_USER: process.env.EMAIL_USER ? 'Configured' : 'Missing',
            EMAIL_PASS: process.env.EMAIL_PASS ? 'Configured' : 'Missing',
            BARBER_EMAIL: process.env.BARBER_EMAIL ? 'Configured' : 'Missing',
            NODE_ENV: process.env.NODE_ENV || 'undefined'
        };

        console.log('Environment variables:', envCheck);

        // Test nodemailer
        const nodemailer = require('nodemailer');
        let emailTest = 'Not tested';
        
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            try {
                const transporter = nodemailer.createTransporter({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                });
                
                await transporter.verify();
                emailTest = 'Connection successful';
            } catch (error) {
                emailTest = `Connection failed: ${error.message}`;
            }
        } else {
            emailTest = 'Missing credentials';
        }

        return res.status(200).json({
            message: 'Email diagnostics complete',
            environment: envCheck,
            emailTest: emailTest,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Diagnostics error:', error);
        return res.status(500).json({
            message: 'Diagnostics failed',
            error: error.message
        });
    }
};
