import express from "express";
import dotenv from 'dotenv';
import cors from 'cors';
import usersRouter from './routes/routes.js';
import cookieParser from "cookie-parser"; 
dotenv.config();
const app=express();
app.set("trust proxy",true);
app.use(express.json());
app.use(cors({
  origin:['http://localhost:5173','https://rajeev2004.github.io'],
  credentials: true,
}));
app.use(cookieParser());
app.use(usersRouter);
const PORT=process.env.PORT||5000;
app.listen(PORT,()=>{
  console.log(`Server is running on port ${PORT}`);
});
