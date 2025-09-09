import mongoose, {Schema} from "mongoose";

const roomSchema = new Schema({
    BuildingNo:{
        type:Number,
        required:true,
        unique:true
    },
    RoomNo:{
        type:Number,
        required:true,
    },
    isBooked:{
        type:Boolean,
        required:true
    },
    TeacherName:{
        type:Schema.Types.ObjectId,
        ref:"Faculty"
    }

},{timestamps:true})

export const Room = mongoose.model("Room",roomSchema)