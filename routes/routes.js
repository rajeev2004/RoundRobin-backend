import express from "express";
const router=express.Router();
import Authenticate from "../middleware/Authenticate.js";
import {addCoupon, adminLogin, adminSignUp, claimCoupon, claimedCoupons, getAllCoupons, getCoupon, getEditingCoupon, logout, updateCoupon} from '../controllers/userController.js';
router.post('/adminLogin',adminLogin);
router.get('/getCoupon',getCoupon);
router.post('/claimCoupon/:id',claimCoupon);
router.get('/getAllCoupons',Authenticate,getAllCoupons);
router.put('/updateCoupon/:id',Authenticate,updateCoupon);
router.post('/logout',logout);
router.post('/addCoupon',Authenticate,addCoupon);
router.post('/adminSignUp',adminSignUp);
router.get('/editingCoupon/:id',getEditingCoupon);
router.get('/claimedCoupons',Authenticate,claimedCoupons);
export default router;