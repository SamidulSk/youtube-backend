// this function we use further multiple time 
// aproach 1 using try catch
// const asyncHanler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     }
//     catch (error) {
//         res.status(err.code || 500).json({
//             succes: false,
//             message: err.message
//         })
//     }
// }

// aproach 2 using promise

const asyncHanler= (requesHandler)=>{
    (req,res,next)=>{
        Promise.resolve(requesHandler(req,res,next)).catch((err)=> next(err))
    }
}


export { asyncHanler }