import { Router } from 'express';
import {
    getRequests, loginAdmin, registerAdmin,
    getoneRequest, approveRequest, rejectRequest
} from '../controllers/admin.controller.js';

const router = Router();

router.post('/admin-register', registerAdmin);
router.post('/admin-login', loginAdmin);
router.get('/get-requests', getRequests);
router.get('/get-request/:requestId', getoneRequest);
router.post('/approve-request/:requestId', approveRequest);
router.post('/reject-request/:requestId', rejectRequest);

export default router;