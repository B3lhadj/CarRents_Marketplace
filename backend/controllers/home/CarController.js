const cars = require('../../models/productModel'); // Model for cars
const CarOrder = require('../../models/authOrder'); // Model for car orders
const { responseReturn } = require('../../utiles/response'); // Utility for sending responses
const { ObjectId } = require('mongoose').Types; // Mongoose ObjectId for ID validation

class CarController {
    // Get all cars (limited to 16, sorted by creation date descending)
    get_cars = async (req, res) => {
        try {
            const carList = await cars.find({})
                .limit(16)
                .sort({ createdAt: -1 });

            responseReturn(res, 200, {
                success: true,
                cars: carList
            });
        } catch (error) {
            console.error('Error in get_cars:', error.message);
            responseReturn(res, 500, {
                success: false,
                error: 'Internal server error'
            });
        }
    };

    // Search available cars based on dates, location, type, price, and features
    search_cars = async (req, res) => {
        try {
            const { startDate, endDate, ville, carType, minPrice, maxPrice, features } = req.query;

            // Validate required date parameters
            if (!startDate || !endDate) {
                return responseReturn(res, 400, {
                    success: false,
                    message: 'Both startDate and endDate are required'
                });
            }

            const start = new Date(startDate);
            const end = new Date(endDate);

            // Validate date format
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return responseReturn(res, 400, {
                    success: false,
                    message: 'Invalid date format for startDate or endDate'
                });
            }

            // Ensure start date is before end date
            if (start >= end) {
                return responseReturn(res, 400, {
                    success: false,
                    message: 'startDate must be before endDate'
                });
            }

            // Build query for available cars
            const query = {
                available: true,
                $or: [
                    { bookedDates: { $exists: false } },
                    { bookedDates: { $size: 0 } },
                    {
                        bookedDates: {
                            $not: {
                                $elemMatch: {
                                    $or: [
                                        { startDate: { $lte: end }, endDate: { $gte: start } },
                                        { startDate: { $lte: start }, endDate: { $gte: end } }
                                    ]
                                }
                            }
                        }
                    }
                ]
            };

            // Apply additional filters
            if (ville) query.ville = { $regex: new RegExp(ville, 'i') };
            if (carType) query.carType = carType;
            if (minPrice || maxPrice) {
                query.pricePerDay = {};
                if (minPrice) query.pricePerDay.$gte = Number(minPrice);
                if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
            }
            if (features) {
                query.features = { $all: features.split(',') };
            }

            const availableCars = await cars.find(query)
                .sort({ pricePerDay: 1 });

            responseReturn(res, 200, {
                success: true,
                cars: availableCars
            });
        } catch (error) {
            console.error('Error in search_cars:', error.message);
            responseReturn(res, 500, {
                success: false,
                message: 'Failed to search cars',
                error: error.message
            });
        }
    };

    // Get details of a specific car by ID
    get_car_details = async (req, res) => {
        const { id } = req.params;

        try {
            // Validate ObjectId
            if (!ObjectId.isValid(id)) {
                return responseReturn(res, 400, {
                    success: false,
                    message: 'Invalid car ID'
                });
            }

            const car = await cars.findById(id)
                .populate('sellerId', 'name email phone');

            if (!car) {
                return responseReturn(res, 404, {
                    success: false,
                    message: 'Car not found'
                });
            }

            responseReturn(res, 200, {
                success: true,
                car
            });
        } catch (error) {
            console.error('Error in get_car_details:', error.message);
            responseReturn(res, 500, {
                success: false,
                message: 'Failed to get car details',
                error: error.message
            });
        }
    };

    // Get distinct car types
    get_car_types = async (req, res) => {
        try {
            const types = await cars.distinct('carType');
            responseReturn(res, 200, {
                success: true,
                carTypes: types
            });
        } catch (error) {
            console.error('Error in get_car_types:', error.message);
            responseReturn(res, 500, {
                success: false,
                message: 'Failed to get car types',
                error: error.message
            });
        }
    };

    // Create a car rental order
    create_order = async (req, res) => {
        try {
            const { carId, startDate, endDate, paymentMethod, pickupLocation, dropoffLocation, additionalServices, paymentId } = req.body;
            const customerId = req.user?.id; // Assuming user is authenticated

            // Validate user authentication
            if (!customerId) {
                return responseReturn(res, 401, {
                    success: false,
                    message: 'User not authenticated'
                });
            }

            // Validate required fields
            if (!carId || !startDate || !endDate || !paymentMethod || !pickupLocation || !dropoffLocation || !paymentId) {
                return responseReturn(res, 400, {
                    success: false,
                    message: 'Missing required fields: carId, startDate, endDate, paymentMethod, pickupLocation, dropoffLocation, and paymentId are required'
                });
            }

            // Validate ObjectId for carId
            if (!ObjectId.isValid(carId)) {
                return responseReturn(res, 400, {
                    success: false,
                    message: 'Invalid car ID'
                });
            }

            // Validate dates
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return responseReturn(res, 400, {
                    success: false,
                    message: 'Invalid date format for startDate or endDate'
                });
            }
            if (start >= end) {
                return responseReturn(res, 400, {
                    success: false,
                    message: 'startDate must be before endDate'
                });
            }

            // Check car availability
            const isAvailable = await CarOrder.checkAvailability(carId, start, end);
            if (!isAvailable) {
                return responseReturn(res, 400, {
                    success: false,
                    message: 'Car not available for selected dates'
                });
            }

            // Fetch car details
            const car = await cars.findById(carId);
            if (!car) {
                return responseReturn(res, 404, {
                    success: false,
                    message: 'Car not found'
                });
            }

            // Calculate total days and amount
            const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            const subTotal = car.pricePerDay * totalDays;
            const insuranceFee = additionalServices?.find(s => s.name === 'Insurance')?.price || 0;
            const taxes = Math.round(subTotal * 0.1); // 10% tax
            const totalAmount = subTotal + taxes + insuranceFee;

            // Create order
            const order = new CarOrder({
                orderId: `ORD-${Date.now().toString().slice(-6)}`,
                customerId,
                customerName: req.user.name,
                customerEmail: req.user.email,
                customerPhone: req.user.phone,
                carId,
                carMake: car.brand,
                carModel: car.name,
                carType: car.carType,
                carImage: car.images?.[0] || '',
                startDate: start,
                endDate: end,
                totalDays,
                dailyRate: car.pricePerDay,
                subTotal,
                taxes,
                insuranceFee,
                totalAmount,
                paymentMethod,
                paymentId, // Store paymentId for refund purposes
                pickupLocation,
                dropoffLocation,
                additionalServices: additionalServices || [],
                rentalStatus: 'reserved'
            });

            await order.save();

            // Update car's bookedDates
            await cars.findByIdAndUpdate(carId, {
                $push: {
                    bookedDates: {
                        startDate: start,
                        endDate: end,
                        orderId: order._id
                    }
                }
            });

            responseReturn(res, 201, {
                success: true,
                message: 'Order created successfully',
                order
            });
        } catch (error) {
            console.error('Error in create_order:', error.message);
            responseReturn(res, 500, {
                success: false,
                message: 'Failed to create order',
                error: error.message
            });
        }
    };

    // Cancel a car rental order with refund logic
    cancel_order = async (req, res) => {
        try {
            const { orderId } = req.params;
            const { reason } = req.body;

            // Validate ObjectId
            if (!ObjectId.isValid(orderId)) {
                return responseReturn(res, 400, {
                    success: false,
                    message: 'Invalid order ID'
                });
            }

            // Validate reason
            if (!reason) {
                return responseReturn(res, 400, {
                    success: false,
                    message: 'Cancellation reason is required'
                });
            }

            // Fetch order
            const order = await CarOrder.findById(orderId);
            if (!order) {
                return responseReturn(res, 404, {
                    success: false,
                    message: 'Order not found'
                });
            }

            // Check if order can be cancelled
            if (order.rentalStatus === 'cancelled') {
                return responseReturn(res, 400, {
                    success: false,
                    message: 'Order already cancelled'
                });
            }

            if (order.rentalStatus === 'completed') {
                return responseReturn(res, 400, {
                    success: false,
                    message: 'Completed orders cannot be cancelled'
                });
            }

            // Check if cancellation is before the rental period
            const currentDate = new Date();
            if (currentDate >= order.startDate) {
                return responseReturn(res, 400, {
                    success: false,
                    message: 'Cannot cancel after the rental period has started'
                });
            }

            // Calculate refund (80% of totalAmount)
            const refundPercentage = 0.8;
            const refundAmount = Math.round(order.totalAmount * refundPercentage);
            const retainedAmount = order.totalAmount - refundAmount;

            // Process refund (placeholder for payment gateway integration)
            // Example with Stripe:
            // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
            // const refund = await stripe.refunds.create({
            //     payment_intent: order.paymentId,
            //     amount: refundAmount * 100, // Stripe expects amount in cents
            //     reason: 'requested_by_customer',
            // });
            // if (!refund || refund.status !== 'succeeded') {
            //     throw new Error('Refund processing failed');
            // }

            // Simulate refund success for now
            console.log(`Refund processed: ${refundAmount} (retained: ${retainedAmount}) for order ${orderId}`);

            // Update order status
            order.rentalStatus = 'cancelled';
            order.cancellationReason = reason;
            order.cancellationDate = new Date();
            order.refundedAmount = refundAmount;
            order.retainedAmount = retainedAmount;
            await order.save();

            // Remove from car's bookedDates
            await cars.findByIdAndUpdate(order.carId, {
                $pull: {
                    bookedDates: { orderId: order._id }
                }
            });

            responseReturn(res, 200, {
                success: true,
                message: `Order cancelled successfully. Refunded ${refundAmount} (retained ${retainedAmount}).`
            });
        } catch (error) {
            console.error('Error in cancel_order:', error.message);
            responseReturn(res, 500, {
                success: false,
                message: 'Failed to cancel order',
                error: error.message
            });
        }
    };

    // Fetch user's orders
    get_user_orders = async (req, res) => {
        const { userId } = req.params;

        try {
            // Validate ObjectId
            if (!ObjectId.isValid(userId)) {
                return responseReturn(res, 400, {
                    success: false,
                    message: 'Invalid user ID'
                });
            }

            const orders = await CarOrder.find({ customerId: userId })
                .sort({ createdAt: -1 });

            responseReturn(res, 200, {
                success: true,
                orders
            });
        } catch (error) {
            console.error('Error in get_user_orders:', error.message);
            responseReturn(res, 500, {
                success: false,
                message: 'Failed to fetch user orders',
                error: error.message
            });
        }
    };
}

module.exports = new CarController();