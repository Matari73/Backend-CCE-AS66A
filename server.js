import dotenv from 'dotenv';
import app from './src/app.js';

// Load environment variables first
dotenv.config();

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor escutando na porta ${PORT}`);
    console.log(`📡 API disponível em http://localhost:${PORT}`);
    console.log(`📚 Documentação disponível em http://localhost:${PORT}/docs`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});