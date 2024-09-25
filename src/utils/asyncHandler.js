  
  const asyncHandler = (requestHandler)=>{

    return (req, res, next)=>{
        process.resolve((requestHandler(req, res, next))).catch((error)=>next(error))
        
      }
 

  }




export{ asyncHandler }





//Second way 

/*
// const asyncHandler = (fn)=> async (req, res, next)=>{
//     try {
//         await fn(req, res, next)
        
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }

// }
*/