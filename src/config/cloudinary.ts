import { v2 as cloudinary } from "cloudinary";
import { envVars } from "./env.ts";
import AppError from "../errorHelper/AppError.ts";

cloudinary.config({
    cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
    api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
    api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET,
});

export const cloudinaryUpload = cloudinary;

export const deleteImageFromCloudinary = async (url: string): Promise<void> => {
    try {
        const regex = /\/v\d+\/(.*?)\.(jpg|jpeg|png|gif|webp|avif)$/i;

        const match = url.match(regex);

        if (match && match[1]) {
            const public_id = match[1];
            await cloudinary.uploader.destroy(public_id);
            console.log(`File ${public_id} is deleted from cloudinary`);
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        throw new AppError(401, "Cloudinary image deletion failed", message);
    }
};