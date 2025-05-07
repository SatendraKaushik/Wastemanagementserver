import { asyncHandler } from "../utils/asyncHandler.js";
import { wastecustomer } from "../models/user.models.js";
import { APIError } from "../utils/APIerror.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import CustomerRequest from "../models/customerRequest.model.js";
import mongoose from 'mongoose'
import purchaseModel from "../models/customerPurchase.model.js";
import transferModel from "../models/customertransferCoin.model.js";
// import { asyncHandler } from "../utils/asyncHandler.js"

const demo = asyncHandler(async (req, res) => {
    console.log("Route got hit")
    res.json({
        message: "Jai Shri Ram!"
    })
})

const registerCustomer = asyncHandler(async (req, res) => {
    const { username, password, email, phoneNumber, Location: location } = req.body;
    console.log("data -->", req.body)
    console.log(username, password, email, phoneNumber)
    // Validation: Ensure fields are not empty
    if (!username || !password || !email || !phoneNumber || !location) {
        throw new APIError(400, "Username and password are required");
    }

    // Check if customer already exists
    const existingCustomer = await wastecustomer.findOne({ username });
    if (existingCustomer) {
        throw new APIError(409, "Username already exists");
    }

    // Hash password
    // const salt = await bcrypt.genSalt(10);


    // Create customer
    const customer = await wastecustomer.create({
        username,
        password,
        email,
        phoneNumber,
        location
    });

    // Respond with success
    res.status(201).json({
        success: true,
        message: "Customer registered successfully",
        customer: {
            id: customer._id,
            username: customer.username,
            email: customer.email,
            phoneNumber: customer.phoneNumber
        }
    });
});
const loginCustomer = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    console.log(username, password)
    if (!username || !password) {
        throw new APIError(400, "Username and password are required");
    }

    // Check if customer exists
    const customer = await wastecustomer.findOne({ username });
    if (!customer) {
        throw new APIError(401, "Invalid username or password");
    }

    // Compare passwords directly using bcrypt.compare
    const isPasswordCorrect = await bcrypt.compare(password, customer.password);
    if (!isPasswordCorrect) {
        throw new APIError(401, "Invalid username or password");
    }

    // Generate JWT token
    const token = jwt.sign(
        { id: customer._id, username: customer.username, email: customer.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    // Respond with success
    res
        .cookie("accessToken", token)
        .status(200)
        .json({
            success: true,
            message: "Customer logged in successfully",
            token,
            customer: {
                id: customer._id,
                username: customer.username,
                phoneNumber: customer.phoneNumber,
                email: customer.email,
                location: customer.location || "Not Mentioned"
            }
        });
});


const createRequest = asyncHandler(async (req, res) => {
    console.log(req.body)
    const { description, quantity, category, name, customerId, location } = req.body;


    let uploadedImage;
    if (req.file && req.file.path) {
        const imagePath = req.file.path;
        console.log("THis is the iamgepath>>>", imagePath)
        uploadedImage = await uploadOnCloudinary(imagePath);
        console.log(">>>", uploadedImage)
    }


    // save 

    const imageUrl = uploadedImage ? uploadedImage.secure_url : null;
    console.log("This is the iamge", imageUrl)


    console.log(description, quantity)
    // if (!category || !quantity) {
    //     throw new APIError(400, "No empty fields are required.");

    // }

    // Check if customer exists     
    // const customer = await wastecustomer.findById(req.user._id);
    // if (!customer) {
    //     throw new APIError(404, "Customer not found");
    // }
    // Create request
    const request = await CustomerRequest.create({
        name: name,
        description,
        quantity,
        category,
        imageUrl,
        customerId: customerId,
        location
    });
    if (!request) {
        throw new APIError(500, "Internal server error");
    }

    // Respond with success



    res.status(201).json({
        message: "Request created successfully"
    });
})

const getCustomerCoinRewardSum = async (req, res) => {
    const { customerId, email } = req.body;
    console.log("This is the email", email)
    try {
        const totalCoinReward = await CustomerRequest.aggregate([
            {
                $match: {
                    customerId: new mongoose.Types.ObjectId(customerId)
                }
            },
            {
                $group: {
                    _id: "$customerId",
                    totalCoins: { $sum: "$coinReward" }
                }
            }
        ]);

        const totalCoinExpended = await purchaseModel.aggregate([
            {
                $match: {
                    customerId: new mongoose.Types.ObjectId(customerId)
                }
            },
            {
                $group: {
                    _id: "$customerId",
                    expendedCoins: { $sum: "$productPrice" }
                }
            }
        ]);

        const totalCoinSent = await transferModel.aggregate([
            {
                $match: {
                    senderId: new mongoose.Types.ObjectId(customerId)
                }
            },
            {
                $group: {
                    _id: "$senderId",
                    expendedCoins: { $sum: "$amount" }
                }
            }
        ]);

        const totalCoinReceived = await transferModel.aggregate([
            {
                $match: {
                    recipientEmail: email
                }
            },
            {
                $group: {
                    _id: "$recipientEmail",
                    receivedCoins: { $sum: "$amount" }
                }
            }
        ]);

        console.log("This is total Coin received>>", totalCoinReceived);
        console.log("This is total Coin sent>>", totalCoinSent);

        // Default values to 0 when arrays are empty or fields are undefined
        const earnedCoins = totalCoinReward.length > 0 ? totalCoinReward[0].totalCoins : 0;
        const expended = totalCoinExpended.length > 0 ? totalCoinExpended[0].expendedCoins : 0;
        const sent = totalCoinSent.length > 0 ? totalCoinSent[0].expendedCoins : 0;
        const received = totalCoinReceived.length > 0 ? totalCoinReceived[0].receivedCoins : 0;

        res.json({
            totalCoins: earnedCoins - expended - sent + received,
            expendedCoins: expended
        });
    } catch (error) {
        console.error("Error fetching total coin reward:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getTop3CustomersByCoinReward = async (req, res) => {
    try {
        const topCustomers = await CustomerRequest.aggregate([
            {
                $group: {
                    _id: "$customerId",
                    totalCoins: { $sum: "$coinReward" }
                }
            },
            {
                $sort: { totalCoins: -1 } // Sort descending
            },
            {
                $limit: 4 // Top 3
            },
            {
                $lookup: {
                    from: "wastecustomers", // name of the customer collection
                    localField: "_id",
                    foreignField: "_id",
                    as: "customerInfo"
                }
            },
            {
                $unwind: "$customerInfo"
            },
            {
                $project: {
                    _id: 0,
                    customerId: "$_id",
                    name: "$customerInfo.username",
                    email: "$customerInfo.email",
                    totalCoins: 1
                }
            }
        ]);

        console.log("this is the check on server", topCustomers)

        res.json({ topCustomers });
    } catch (error) {
        console.error("Error fetching top customers:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getRequestsCount = asyncHandler(async (req, res) => {
    const { customerId } = req.body
    if (!customerId) throw new APIError(400, 'Customer id is required');
    const count = await CustomerRequest.countDocuments({ customerId: customerId, status: "approved" });
    res.json({
        requestCount: count || 0
    })
})

const purchaseItem = asyncHandler(async (req, res) => {
    const { customerId, productId, productName, productPrice } = req.body;
    if (!customerId || !productId || !productName || !productPrice) {
        throw new APIError(400, 'No empty fields are allowed');
    }
    const createdEntry = purchaseModel.create({
        customerId,
        productId,
        productName,
        productPrice
    })
    if (!createdEntry) throw new APIError(500, "Unable to create the request");
    res.json({
        message: "Purchase successfully",
        success: true
    })
})

const getPurchaseHistory = asyncHandler(async (req, res) => {
    const { customerId } = req.body;
    console.log("customerID", customerId)
    // Use find() instead of findMany() for MongoDB/Mongoose
    const purchaseHistory = await purchaseModel.find({ customerId });
    console.log("This is the purchaseHistory", purchaseHistory);

    res.json({
        purchaseHistory,
        success: true,
    })
})

const transferCoin = asyncHandler(async (req, res) => {
    const { senderId, recipientEmail, amount, note } = req.body;
    console.log("555", senderId, recipientEmail, amount, note)
    const transfered = await transferModel.create({
        senderId,
        recipientEmail,
        amount,
        note
    })
    if (!transfered) throw new APIError(400, "Failed to send");
    res.json({
        success: true,
        transfered
    })
})
const getRecentTransaction = asyncHandler(async (req, res) => {
    const { customerId } = req.body;
    console.log(customerId)
    const history = await transferModel.find({ senderId: customerId });
    if (!history) {
        res.json({
            history: []
        })
    }
    res.json({
        success: true,
        history
    })
})
export {
    demo,
    registerCustomer,
    loginCustomer,
    createRequest,
    getCustomerCoinRewardSum,
    getTop3CustomersByCoinReward,
    getRequestsCount,
    purchaseItem,
    getPurchaseHistory,
    transferCoin,
    getRecentTransaction
}

