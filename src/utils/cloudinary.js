import { v2 as cloudinary} from "cloudinary";
import fs from "fs"


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})




const uploadOnCloudinary  = async (localFilePath)=>{
    try {
        if(!localFilePath) return null
        const response =  await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        
        return response

    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null
    }
}

export { uploadOnCloudinary }


/*
import { v2 as cloudinary } from "cloudinary"
import fs from "fs"



cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret:  process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath)=>{
        try {
            if (!localFilePath)  
                return null
                // Upload file on cloudnary
                const response = await cloudinary.uploader.upload(localFilePath, {
                    resource_type:"auto"
                })
                // file has been uploaded successfully
                console.log("File is uploaded on Cloudinary.", response.url);
                return response
                
        } catch (error) {
            fs.unlinkSync(localFilePath) // ye method krta ye hai ke jb file upload kr rhi hai aur file upload nhi huee tb jo temp file locally save hai unko unlik kr deta hai     
            return null
        }
}


export { uploadOnCloudinary }

*/