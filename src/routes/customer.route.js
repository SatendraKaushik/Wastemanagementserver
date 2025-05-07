import { Router } from 'express'
import {
    createRequest, demo, getCustomerCoinRewardSum, getTop3CustomersByCoinReward, loginCustomer, registerCustomer,
    getRequestsCount,
    purchaseItem,
    getPurchaseHistory,
    transferCoin,
    getRecentTransaction
} from '../controllers/customer.controller.js';
import { loginUser, registerUser } from '../controllers/user.controller.js';
import { registerAdmin } from '../controllers/admin.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
const router = Router();

router.get('/demo', demo);
router.post('/customer-register', registerCustomer)
router.post('/customer-login', loginCustomer)
router.post('/get-coins', getCustomerCoinRewardSum);
router.post('/get-top', getTop3CustomersByCoinReward);
router.post('/get-requests-count', getRequestsCount);
router.post('/purchase-product', purchaseItem)
router.post('/get-purchase-history', getPurchaseHistory)
router.post('/transfer-coins', transferCoin)
router.post('/get-recent-transfers', getRecentTransaction)
router.post('/create-request', upload.single('image'), createRequest)
// transfer-coins
export default router;
