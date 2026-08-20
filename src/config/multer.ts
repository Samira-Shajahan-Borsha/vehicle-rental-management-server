import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.ts";

const storage = new CloudinaryStorage({
    cloudinary: cloudinaryUpload,
    params: {
        public_id: (req, file) => {
            
            const baseName = file.originalname
                .toLowerCase()
                .replace(/\.[^.]+$/, "") 
                .replace(/\s+/g, "-") 
                .replace(/\.+/g, "-")
                .replace(/[^a-z0-9-]/g, "");
            const uniqueFileName =
                Math.random().toString(36).substring(2) + "-" + Date.now() + "-" + baseName;

            return "vehicle-rental-management/" + uniqueFileName;
        },
    },
});

export const multerUpload = multer({ storage });