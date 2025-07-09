// Script de prueba para el sistema de reservas
const testBooking = async () => {
    const bookingData = {
        service: 'fade-premium',
        date: '2025-07-10', // Mañana
        time: '15:00',
        name: 'Brandon Soto - Prueba',
        email: 'brandonsoto1908@gmail.com',
        phone: '8888-1234',
        notes: 'Esta es una prueba del sistema de reservas desde el desarrollo'
    };

    try {
        console.log('🧪 Enviando cita de prueba...');
        console.log('📋 Datos de la cita:', bookingData);

        const response = await fetch('https://chamaco-the-barber-1dz01s6hf-brandon-s-projects-cc03ed1c.vercel.app/api/book-appointment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        });

        console.log('📡 Status:', response.status);
        console.log('📡 Status Text:', response.statusText);

        if (response.ok) {
            const result = await response.json();
            console.log('✅ ¡ÉXITO! Cita reservada correctamente');
            console.log('📧 Respuesta del servidor:', result);
            console.log('🎉 Revisa tu email para ver los mensajes automáticos');
        } else {
            const error = await response.json();
            console.log('❌ Error en la reserva:', error);
        }
    } catch (error) {
        console.log('🚨 Error de conexión:', error.message);
    }
};

// Ejecutar la prueba
testBooking();
