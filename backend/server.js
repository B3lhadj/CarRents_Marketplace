const express = require('express');
const { dbConnect } = require('./utiles/db');
const app = express();
const cors = require('cors');
const http = require('http');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const socket = require('socket.io');
const mongoose = require('mongoose');

const mode = process.env.mode || 'development';
const server = http.createServer(app);

// CORS Configuration
const corsOptions = {
    origin: mode === 'production' 
        ? [
            'http://localhost:3000', 
            process.env.user_panel_production_url, 
            process.env.admin_panel_production_url
          ].filter(Boolean)
        : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
};

app.use(cors(corsOptions));

// Socket.IO Configuration
const io = socket(server, {
    cors: corsOptions,
    pingTimeout: 60000,
    pingInterval: 25000
});

// User Management
const allCustomer = [];
const allSeller = [];
let admin = {};

// Helper Functions
const addUser = (customerId, socketId, userInfo) => {
    try {
        const checkUser = allCustomer.some(u => u.customerId === customerId);
        if (!checkUser && customerId && socketId) {
            allCustomer.push({
                customerId,
                socketId,
                userInfo: userInfo || null
            });
        }
    } catch (error) {
        console.error('Error in addUser:', error);
    }
};

const addSeller = (sellerId, socketId, userInfo) => {
    try {
        const checkSeller = allSeller.some(u => u.sellerId === sellerId);
        if (!checkSeller && sellerId && socketId) {
            allSeller.push({
                sellerId,
                socketId,
                userInfo: userInfo || null
            });
        }
    } catch (error) {
        console.error('Error in addSeller:', error);
    }
};

const findCustomer = (customerId) => {
    return allCustomer.find(c => c.customerId === customerId);
};

const findSeller = (sellerId) => {
    return allSeller.find(c => c.sellerId === sellerId);
};

const removeUser = (socketId) => {
    allCustomer = allCustomer.filter(c => c.socketId !== socketId);
    allSeller = allSeller.filter(c => c.socketId !== socketId);
};

const removeAdmin = (socketId) => {
    if (admin.socketId === socketId) {
        admin = {};
    }
};

const emitActiveUsers = () => {
    try {
        io.emit('activeSeller', allSeller);
        io.emit('activeCustomer', allCustomer);
        io.emit('activeAdmin', { status: !!admin.socketId });
    } catch (error) {
        console.error('Error emitting active users:', error);
    }
};

// Socket.IO Connection Handling
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('add_user', (customerId, userInfo) => {
        addUser(customerId, socket.id, userInfo);
        emitActiveUsers();
    });

    socket.on('add_seller', (sellerId, userInfo) => {
        addSeller(sellerId, socket.id, userInfo);
        emitActiveUsers();
    });

    socket.on('add_admin', (adminInfo) => {
        try {
            if (adminInfo && typeof adminInfo === 'object') {
                admin = { ...adminInfo };
                delete admin.email;
                admin.socketId = socket.id;
                emitActiveUsers();
            }
        } catch (error) {
            console.error('Error in add_admin:', error);
        }
    });

    socket.on('send_seller_message', (msg) => {
        try {
            if (msg && msg.receverId) {
                const customer = findCustomer(msg.receverId);
                if (customer) {
                    socket.to(customer.socketId).emit('seller_message', msg);
                }
            }
        } catch (error) {
            console.error('Error in send_seller_message:', error);
        }
    });

    socket.on('send_customer_message', (msg) => {
        try {
            if (msg && msg.receverId) {
                const seller = findSeller(msg.receverId);
                if (seller) {
                    socket.to(seller.socketId).emit('customer_message', msg);
                }
            }
        } catch (error) {
            console.error('Error in send_customer_message:', error);
        }
    });

    socket.on('send_message_admin_to_seller', (msg) => {
        try {
            if (msg && msg.receverId) {
                const seller = findSeller(msg.receverId);
                if (seller) {
                    socket.to(seller.socketId).emit('receved_admin_message', msg);
                }
            }
        } catch (error) {
            console.error('Error in send_message_admin_to_seller:', error);
        }
    });

    socket.on('send_message_seller_to_admin', (msg) => {
        try {
            if (msg && admin.socketId) {
                socket.to(admin.socketId).emit('receved_seller_message', msg);
            }
        } catch (error) {
            console.error('Error in send_message_seller_to_admin:', error);
        }
    });

    socket.on('new_booking_request', (booking) => {
        try {
            const seller = findSeller(booking.sellerId);
            if (seller) {
                socket.to(seller.socketId).emit('new_booking_request', booking);
            }
        } catch (error) {
            console.error('Error emitting new booking request:', error);
        }
    });

    socket.on('booking_status_updated', (booking) => {
        try {
            const customer = findCustomer(booking.userId);
            if (customer) {
                socket.to(customer.socketId).emit('booking_status_updated', booking);
            }
        } catch (error) {
            console.error('Error emitting booking status update:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        removeUser(socket.id);
        removeAdmin(socket.id);
        emitActiveUsers();
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api', require('./routes/chatRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api', require('./routes/testroutes'));
const stripetest = require('./routes/stripetest');
app.use('/api', stripetest);
app.use('/api', require('./routes/bannerRoutes'));
app.use('/api', require('./routes/dashboard/dashboardIndexRoutes'));
app.use('/api/home', require('./routes/home/homeRoutes'));
app.use('/api', require('./routes/order/orderRoutes'));
app.use('/api', require('./routes/authRoutes'));
app.use('/api', require('./routes/home/customerAuthRoutes'));
app.use('/api', require('./routes/dashboard/sellerRoutes'));
app.use('/api', require('./routes/dashboard/categoryRoutes'));
app.use('/api', require('./routes/dashboard/productRoutes'));
const carsRouter = require('./routes/dashboard/carRoutes');
app.use('/api/cars', carsRouter);
const bookingRouter = require('./routes/bookings');
app.use('/api/bookings', bookingRouter);
const paymentRouter = require('./routes/payements');
app.use('/api/payments', paymentRouter);
const stripeRoutes = require('./routes/dashboard/stripeRoutes');
app.use('/api/stripe', stripeRoutes);
app.use('/api/stripe/webhook', require('./routes/stripeWebhook'));

// Health Check
app.get('/', (req, res) => res.send('Server is running'));
app.get('/health', (req, res) => res.status(200).json({ status: 'healthy' }));

// Server Startup
const port = process.env.PORT || 5000;
dbConnect()
    .then(() => {
        server.listen(port, () => {
            mongoose.connection.on('connected', () => {
                console.log("[MongoDB] Connected to DB:", mongoose.connection.db.databaseName);
            });
            console.log(`Server is running on port ${port}`);
            console.log(`Mode: ${mode}`);
        });
    })
    .catch(err => {
        console.error('Database connection failed:', err);
        process.exit(1);
    });

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Process Handling
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});