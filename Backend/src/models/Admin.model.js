import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const adminSchema = new Schema({
    Name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    AdminID:{
        type:String,
        required: true,
        unique:true
    },
    password:{
        type: String,
        required: [true, 'Password is required']
    },
    refreshToken: {
        type: String
    },
    RoomNo:{
        type:Schema.Types.ObjectId,
        ref:"Room"
    }

},{timestamps:true})

adminSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return next() ;
    this.password = await bcrypt.hash(this.password,10)
    next()
})

adminSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}

adminSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            Name: this.Name,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
adminSchema.methods.generateRefreshToken = function(){
     return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const Admin = mongoose.model("Admin",adminSchema)