
// import { asyncHandler } from "../utils/asyncHandler.js"
import { asyncHandler } from "../utils/asyncHandler.js"
// import { admin } from "../models/admin.models.js"   
import { APIError } from "../utils/APIerror.js"
import admin from "../models/admin.model.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import CustomerRequest from "../models/customerRequest.model.js"
const registerAdmin = asyncHandler(async (req, res) => {
    console.log(req.body)
    const { username, password, email, phoneNumber } = req.body
    if (!username || !password) {
        throw new APIError(400, "No Empty fields are required.")
    }


    const createdAdmin = await admin.create({
        username,
        password,
        email,
        phoneNumber
    })
    // Hash the password before saving the admin
    const salt = await bcrypt.genSalt(10);
    createdAdmin.password = await bcrypt.hash(password, salt);
    await createdAdmin.save();
    if (!createdAdmin) {
        throw new APIError(500, "Internal server error")
    }
    res.json({
        success: true,
        message: "Admin created successfully"
    })
})

const loginAdmin = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        throw new APIError(400, "No empty fields are required");
    }

    const userExists = await admin.findOne({ username });


    if (!userExists) {
        throw new APIError(401, "Invalid username or password");
    }

    // Check if the password is correct
    const isPasswordCorrect = await bcrypt.compare(password, userExists.password);

    if (!isPasswordCorrect) {
        throw new APIError(401, "Invalid username or password");
    }

    // Generate JWT token
    const token = jwt.sign(
        { id: userExists._id, username: userExists.username, role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    res.status(200).json({
        success: true,
        message: "Admin logged in successfully",
        token,
        admin: {
            id: userExists._id,
            username: userExists.username,
            name: userExists.name,
            phoneNumber: userExists.phoneNumber,
            email: userExists.email
        }
    });
});

const getRequests = asyncHandler(async (req, res) => {
    const requests = await CustomerRequest.find();

    res.json({
        requests
    })
})
const getoneRequest = asyncHandler(async (req, res) => {
    // (`/admin/get-request/${requestId}`);
    const { requestId } = req.params
    const request = await CustomerRequest.findById(requestId)

    if (!request) {
        throw new APIError(404, "Request not found")
    }

    res.json({
        request
    })
});


// await Axios.post(`/admin/approve-request/${requestId}`, {
//     coinReward: parseInt(coinReward)
//   });
// approve-request
const approveRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params
    const { coinReward, adminId } = req.body
    if (!coinReward) {
        throw new APIError(400, "Coin reward is required")
    }
    const request = await CustomerRequest.findByIdAndUpdate(requestId, { status: "approved", coinReward, adminId }, { new: true })

    if (!request) {
        throw new APIError(404, "Request not found")
    }

    await request.save()

    res.json({
        success: true,
        request
    })
})

const rejectRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params
    const { rejectionReason, adminId } = req.body
    if (!rejectionReason) {
        throw new APIError(400, "Rejection Reason is required")
    }
    const request = await CustomerRequest.findByIdAndUpdate(requestId, { status: "rejected", rejectionReason, adminId }, { new: true })

    if (!request) {
        throw new APIError(404, "Request not found")
    }

    await request.save()

    res.json({
        success: true,
        request
    })
})



export {
    loginAdmin,
    registerAdmin,
    getRequests,
    getoneRequest,
    approveRequest,
    rejectRequest
}