import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/db.js";
import {v4 as uuidv4} from "uuid";
export async function adminLogin(req,res){
    const ADMIN_KEY=process.env.Admin_Key;
    const {email,password,adminKey}=req.body;
    try{
        const response=await db.query('select * from admins where email=$1',[email]);
        if(response.rows.length===0){
            throw new Error('Incorrect Email');
        }
        const isPasswordCorrect=await bcrypt.compare(password,response.rows[0].password);
        if(!isPasswordCorrect){
            throw new Error('Incorrect password');
        }
        if(adminKey!==ADMIN_KEY){
            throw new Error('Incorrect admin key');
        }
        const token=jwt.sign({id:response.rows[0].id},process.env.SECRET_KEY,{expiresIn:'24h'});
        res.cookie("adminCookie",token,{httpOnly:true,secure:true,maxAge:24*60*60*1000});
        return res.status(200).json({login:true});
    }catch(err){
        res.status(500).json({error:err.message});
    }
}
export async function adminSignUp(req,res){
    const ADMIN_KEY=process.env.Admin_Key;
    const {email,password,adminKey}=req.body;
    try{
        const response=await db.query('select * from admins where email=$1',[email]);
        if(response.rows.length>0){
            throw new Error('Email already exist');
        }
        const hashedPass=await bcrypt.hash(password,10);
        if(adminKey!==ADMIN_KEY){
            throw new Error('Incorrect admin key');
        }
        const adminSignUp=await db.query('insert into admins (email,password) values($1,$2) RETURNING *',[email,hashedPass]);
        const token=jwt.sign({id:adminSignUp.rows[0].id},process.env.SECRET_KEY,{expiresIn:'24h'});
        res.cookie("adminCookie",token,{httpOnly:true,secure:true,maxAge:24*60*60*1000});
        return res.status(200).json({signUp:true});
    }catch(err){
        res.status(500).json({error:err.message});
    }
}
export async function getCoupon(req,res){
    const limit=1;
    try{
        const result=await db.query(`select * from coupons where claimed=false order by id ASC limit $1`,[limit]);
        const coupon=result.rows[0];
        if(!coupon){
            throw new Error('No coupons Available');
        }
        res.status(200).json({coupon});
    }catch(err){
        return res.status(500).json({error:err.message});
    }
}
export async function claimCoupon(req,res){
    const {id}=req.params;
    const ip=req.headers["x-forwarded-for"]?.split(",")[0]||req.connection.remoteAddress||req.ip;
    const browserSession=req.cookies.session || uuidv4();
    res.cookie('session',browserSession,{httpOnly:true,secure:true});
    try{
        const isClaimed=await db.query('select claimed from coupons where id=$1',[id]);
        if(isClaimed.rows[0].claimed){
            throw new Error('This coupon is already been claimed refresh the page to get a new Coupon');
        }
        const existingClaim=await db.query("SELECT * FROM claims WHERE session_id=$1 AND claim_time>NOW() - INTERVAL '1 minute'",[browserSession]);
        if(existingClaim.rows.length>0){
            throw new Error("You have already claimed a coupon in this session. Waiting time is 1 minute to claim another coupon");
        }
        await db.query('insert into claims (coupon_id,ip_address,session_id,claim_time) values($1,$2,$3,NOW())',[id,ip,browserSession]);
        await db.query('update coupons set claimed=true where id=$1',[id]);
        return res.status(200).json({message:'successful'});
    }catch(err){
        return res.status(500).json({error:err.message});
    }
}
export async function getAllCoupons(req,res){
    try{
        const coupons=await db.query('select * from coupons order by claimed ASC, id ASC');
        return res.status(200).json({coupons:coupons.rows});
    }catch(err){
        res.status(500).json({error:err.message});
    }
}
export async function updateCoupon(req,res){
    const {id}=req.params;
    const {claimed,code}=req.body;
    try{
        const updateCouponResponse=await db.query('update coupons set code=$1,claimed=$2 where id=$3 RETURNING *',[code,claimed,id]);
        if(updateCouponResponse.rows.length===0){
            throw new Error('coupon not found');
        }
        return res.status(200).json({message:'coupon updates successfully',coupon:updateCouponResponse.rows[0]})
    }catch(err){
        res.status(500).json({error:err.message});
    }
}
export async function logout(req,res){
    res.clearCookie("adminCookie",{httpOnly:true,secure:true});
    res.status(200).json({message:'logout successful'})
}
export async function addCoupon(req,res){
    try{
        const {code}=req.body;
        const newCoupon=await db.query('INSERT INTO coupons (code,claimed) VALUES ($1,false) RETURNING *',[code]);
        res.status(201).json({newCoupon:newCoupon.rows[0]});
    }catch(err){
        res.status(500).json({error:err.message});
    }
}
export async function getEditingCoupon(req,res){
    const {id}=req.params;
    try{
        const coupon=await db.query('select * from coupons where id=$1',[id]);
        if(coupon.rows.length===0){
            throw new Error('Cannot find coupon! Try again')
        }
        return res.status(200).json({coupon:coupon.rows[0]});
    }catch(err){
        return res.status(500).json({error:err.message});
    }
}
export async function claimedCoupons(req,res){
    try{
        const claimedCoupons=await db.query(`SELECT c.id,c.code,cl.claim_time FROM claims cl JOIN coupons c ON cl.coupon_id=c.id ORDER BY cl.claim_time DESC`);
        return res.status(200).json({coupons:claimedCoupons.rows});
    }catch(err){
        return res.status(500).json({error:err.message});
    }
}