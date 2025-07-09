const Airtable = require('airtable');

module.exports = async function handler(req, res) {
    console.log('=== Get Appointments API Started ===');
    console.log('Method:', req.method);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        console.log('Handling OPTIONS request');
        res.status(200).end();
        return;
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
        console.log('Method not allowed:', req.method);
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Check if database credentials are available
        if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
            return res.status(500).json({ 
                message: 'Database not configured',
                appointments: []
            });
        }

        console.log('Fetching appointments from database...');
        
        // Configure Airtable
        const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
        
        // Get all appointments, sorted by creation date (newest first)
        const records = await base('Citas').select({
            sort: [{ field: 'Fecha_Creacion', direction: 'desc' }],
            maxRecords: 100 // Limit to last 100 appointments
        }).all();

        // Format the appointments for response
        const appointments = records.map(record => {
            const fields = record.fields;
            return {
                id: record.id,
                nombre: fields.Nombre || '',
                email: fields.Email || '',
                telefono: fields.Teléfono || '',
                servicio: fields.Servicio || '',
                precio: fields.Precio || '',
                fecha: fields.Fecha || '',
                hora: fields.Hora || '',
                notas: fields.Notas || '',
                estado: fields.Estado || 'Pendiente',
                fechaCreacion: fields.Fecha_Creacion || ''
            };
        });

        console.log(`Successfully fetched ${appointments.length} appointments`);
        
        return res.status(200).json({
            message: 'Citas obtenidas exitosamente',
            count: appointments.length,
            appointments: appointments
        });

    } catch (error) {
        console.error('Error fetching appointments:', error);
        return res.status(500).json({ 
            message: 'Error al obtener las citas',
            error: error.message,
            appointments: []
        });
    }
};
