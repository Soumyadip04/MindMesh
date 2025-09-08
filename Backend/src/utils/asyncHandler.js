//This one way to represent wrapper function . These functions would be used a lot in our project thats why we inserted this in our utilities folder
//This is represented in promise format
const asyncHandler = (requestHandler) => {
   return (req, res, next) => {
        Promise.resolve(requestHandler(req,res,next)).catch((err) => next(err))
    }
}




export {asyncHandler}

