const sellerModel = require('../../models/sellerModel')
const customerModel = require('../../models/customerModel')
const sellerCustomerModel = require('../../models/chat/sellerCustomerModel')
const sellerCustomerMessage = require('../../models/chat/sellerCustomerMessage')
const adminSellerMessage = require('../../models/chat/adminSellerMessage')
const { responseReturn } = require('../../utiles/response')
const mongoose = require('mongoose'); // Add this at the top of your file

class chatController {
    add_customer_friend = async (req, res) => {
        const { sellerId, userId } = req.body;
        
        try {
            if (sellerId !== '') {
                const seller = await sellerModel.findById(sellerId)
                const user = await customerModel.findById(userId)
                
                // Check and update customer's friend list
                const checkSeller = await sellerCustomerModel.findOne({
                    $and: [
                        { myId: userId },
                        { 'myFriends.fdId': sellerId }
                    ]
                })
                
                if (!checkSeller) {
                    await sellerCustomerModel.updateOne(
                        { myId: userId },
                        {
                            $push: {
                                myFriends: {
                                    fdId: sellerId,
                                    name: seller.shopInfo?.agencyName,
                                    image: seller.image
                                }
                            }
                        },
                        { upsert: true }
                    )
                }

                // Check and update seller's friend list
                const checkCustomer = await sellerCustomerModel.findOne({
                    $and: [
                        { myId: sellerId },
                        { 'myFriends.fdId': userId }
                    ]
                })
                
                if (!checkCustomer) {
                    await sellerCustomerModel.updateOne(
                        { myId: sellerId },
                        {
                            $push: {
                                myFriends: {
                                    fdId: userId,
                                    name:seller.shopInfo?.agencyName,
                                    image: ""
                                }
                            }
                        },
                        { upsert: true }
                    )
                }

                // Get messages between seller and customer
                const messages = await sellerCustomerMessage.find({
                    $or: [
                        { $and: [{ receverId: sellerId }, { senderId: userId }] },
                        { $and: [{ receverId: userId }, { senderId: sellerId }] }
                    ]
                }).sort({ createdAt: 1 })

                const MyFriends = await sellerCustomerModel.findOne({ myId: userId })
                const currentFd = MyFriends.myFriends.find(s => s.fdId === sellerId)
                
                responseReturn(res, 200, {
                    myFriends: MyFriends.myFriends,
                    currentFd,
                    messages
                })
            } else {
                const MyFriends = await sellerCustomerModel.findOne({ myId: userId })
                responseReturn(res, 200, {
                    myFriends: MyFriends?.myFriends || []
                })
            }
        } catch (error) {
            console.log(error)
            responseReturn(res, 500, { error: error.message })
        }
    }

    customer_message_add = async (req, res) => {
        const { userId, text, sellerId, name } = req.body
        
        try {
            const message = await sellerCustomerMessage.create({
                senderId: userId,
                senderName: name,
                receverId: sellerId,
                message: text
            })

            // Update customer's conversation order
            await this.updateConversationOrder(userId, sellerId)
            
            // Update seller's conversation order
            await this.updateConversationOrder(sellerId, userId)

            responseReturn(res, 201, { message })

        } catch (error) {
            console.log(error)
            responseReturn(res, 500, { error: error.message })
        }
    }


get_customers = async (req, res) => {
    const { sellerId } = req.params;
    console.log('[1] Starting get_customers for sellerId:', sellerId);

    try {
        // Validate sellerId
        console.log('[2] Validating sellerId');
        if (!sellerId) {
            console.error('[ERROR] No sellerId provided');
            return responseReturn(res, 400, { error: 'Seller ID is required' });
        }

        if (!mongoose.Types.ObjectId.isValid(sellerId)) {
            console.error('[ERROR] Invalid sellerId format:', sellerId);
            return responseReturn(res, 400, { error: 'Invalid seller ID format' });
        }

        // Find seller with populated friends data
        console.log('[3] Querying database for seller');
        const sellerData = await sellerCustomerModel.findOne({ myId: sellerId }).lean();

        console.log('[4] Query completed. Seller data:', sellerData ? 'found' : 'not found');

        if (!sellerData || !sellerData.myFriends) {
            console.log('[5] No seller/friends found');
            return responseReturn(res, 200, { customers: [] });
        }

        console.log('[6] Processing friends data. Friend count:', sellerData.myFriends.length);

        // Process friends (no population needed since we store data directly)
        const customers = sellerData.myFriends
            .filter(friend => friend.fdId && friend.fdId.trim() !== '')
            .map(friend => ({
                fdId: friend.fdId,
                name: friend.name,
                image: friend.image,
                lastSeen: friend.lastSeen, // Note: you might want to add this to your schema
                createdAt: friend.createdAt, // Add to schema if needed
                lastMessage: friend.lastMessage || null,
            }));

        console.log('[8] Valid customers count:', customers.length);

        // Sort by last message time or creation date
        customers.sort((a, b) => {
            const timeA = a.lastMessage?.time || a.createdAt;
            const timeB = b.lastMessage?.time || b.createdAt;
            return new Date(timeB) - new Date(timeA);
        });

        console.log('[9] Returning successful response');
        return responseReturn(res, 200, { customers });

    } catch (error) {
        console.error('[ERROR] Detailed error:', {
            message: error.message,
            stack: error.stack,
            fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
        });
        return responseReturn(res, 500, { 
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Helper function to check online status
 isUserOnline(lastSeen) {
    if (!lastSeen) return false;
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    return (now - lastSeenDate) < (5 * 60 * 1000); // 5 minutes threshold
}

    get_customer_seller_message = async (req, res) => {
        const { customerId } = req.params
        const { id } = req

        try {
            const messages = await sellerCustomerMessage.find({
                $or: [
                    { $and: [{ receverId: customerId }, { senderId: id }] },
                    { $and: [{ receverId: id }, { senderId: customerId }] }
                ]
            }).sort({ createdAt: 1 })

            const currentCustomer = await customerModel.findById(customerId)

            responseReturn(res, 200, { messages, currentCustomer })

        } catch (error) {
            console.log(error)
            responseReturn(res, 500, { error: error.message })
        }
    }

    seller_message_add = async (req, res) => {
        const { senderId, text, receverId, name } = req.body
        
        try {
            const message = await sellerCustomerMessage.create({
                senderId: senderId,
                senderName: name,
                receverId: receverId,
                message: text
            })

            // Update seller's conversation order
            await this.updateConversationOrder(senderId, receverId)
            
            // Update customer's conversation order
            await this.updateConversationOrder(receverId, senderId)

            responseReturn(res, 201, { message })

        } catch (error) {
            console.log(error)
            responseReturn(res, 500, { error: error.message })
        }
    }

    get_sellers = async (req, res) => {
        try {
            const sellers = await sellerModel.find({})
            responseReturn(res, 200, { sellers })
        } catch (error) {
            console.log(error)
            responseReturn(res, 500, { error: error.message })
        }
    }

    seller_admin_message_insert = async (req, res) => {
        const { senderId, receverId, message, senderName } = req.body
        
        try {
            const messageData = await adminSellerMessage.create({
                senderId,
                receverId,
                senderName,
                message
            })

            // Ensure sender (seller) has admin in friends list
            await sellerCustomerModel.updateOne(
                { myId: senderId },
                {
                    $addToSet: {
                        myFriends: {
                            fdId: receverId,
                            name: "Admin",
                            image: ""
                        }
                    }
                },
                { upsert: true }
            )

            responseReturn(res, 200, { message: messageData })
        } catch (error) {
            console.log(error)
            responseReturn(res, 500, { error: error.message })
        }
    }

    get_admin_messages = async (req, res) => {
        const { receverId } = req.params;
        const { id } = req; // Admin ID from auth middleware

        try {
            if (!id) {
                return responseReturn(res, 400, { error: "Admin ID not found" })
            }

            const messages = await adminSellerMessage.find({
                $or: [
                    { $and: [{ receverId: receverId }, { senderId: id }] },
                    { $and: [{ receverId: 'admin' }, { senderId: id }] },
                    { $and: [{ receverId: id }, { senderId: receverId }] }
                ]
            }).sort({ createdAt: 1 })

            let currentSeller = {}
            if (receverId && receverId !== 'undefined') {
                currentSeller = await sellerModel.findById(receverId)
            }

            responseReturn(res, 200, { messages, currentSeller })
        } catch (error) {
            console.log(error)
            responseReturn(res, 500, { error: error.message })
        }
    }

   get_seller_messages = async (req, res) => {
    const { id } = req; // Seller ID from auth middleware
    const { receverId } = req.params; // Optional: for specific conversation

    try {
        if (!id) {
            return responseReturn(res, 400, { error: "Seller ID not found" });
        }

        // Build query based on whether receverId is provided
        const query = receverId 
            ? {
                $or: [
                    { $and: [{ senderId: id }, { receverId: receverId }] },
                    { $and: [{ senderId: receverId }, { receverId: id }] }
                ]
            }
            : {
                $or: [
                    { senderId: id },
                    { receverId: id }
                ]
            };

        const messages = await adminSellerMessage.find(query)
            .sort({ createdAt: 1 });

        // If specific conversation, update conversation order
        if (receverId && receverId !== 'undefined') {
            await this.updateConversationOrder(id, receverId);
            
            // Get admin info if needed
            const adminInfo = receverId === 'admin' 
                ? { name: 'Admin' } // Or fetch from admin collection
                : await sellerModel.findById(receverId).select('name');
            
            return responseReturn(res, 200, { messages, currentAdmin: adminInfo });
        }

        responseReturn(res, 200, { messages });
    } catch (error) {
        console.error('Error in get_seller_messages:', error);
        responseReturn(res, 500, { error: error.message });
    }
}

    // Helper function to update conversation order
    async updateConversationOrder(userId, friendId) {
        const data = await sellerCustomerModel.findOne({ myId: userId })
        if (data) {
            let myFriends = data.myFriends
            let index = myFriends.findIndex(f => f.fdId === friendId)
            
            if (index > 0) {
                // Move the friend to top of the list
                const [friend] = myFriends.splice(index, 1)
                myFriends.unshift(friend)
                
                await sellerCustomerModel.updateOne(
                    { myId: userId },
                    { myFriends }
                )
            }
        }
    }
}

module.exports = new chatController()