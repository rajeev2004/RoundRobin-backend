import jwt from "jsonwebtoken";
function Authenticate(req,res,next){
    const token=req.cookies.adminCookie;
    if(!token){
        return res.status(401).json({error:'Unauthorized: No token available'})
    }
    try{
        const decoded=jwt.verify(token,process.env.SECRET_KEY);
        req.user=decoded;
        next();
    }catch(err){
        return res.status(500).json({error:err.message});
    }
}
export default Authenticate;