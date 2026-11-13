import api from "../../../../config/axios";
export const uploadBrandingFile = async (type,file)=>{if(!(file instanceof File))throw new TypeError("A valid image file is required.");const formData=new FormData();formData.append("image",file);formData.append("type",type);const response=await api.post("/settings/upload-logo",formData);return response.data;};
