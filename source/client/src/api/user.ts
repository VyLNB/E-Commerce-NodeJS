import { apiFormDataRequest, apiRequest } from "./client";

interface UploadAvatarResponse {
  message: string;
  success: boolean;
  error: boolean;
  data: {
    _id: string;
    avatar: string;
  };
}

interface ChangePasswordResponse {
  message: string;
  success: boolean;
  error: boolean;
  data: {
    _id: string;
  };
}

interface PasswordRecoveryResponse {
  message: string;
  success: boolean;
  error: boolean;
  timestamp: Date;
}

export async function uploadAvatar(
  formData: FormData
): Promise<UploadAvatarResponse> {
  return apiFormDataRequest<UploadAvatarResponse>(
    "put",
    "/users/me/avatar",
    formData
  );
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<ChangePasswordResponse> {
  return apiRequest<ChangePasswordResponse>("put", "/users/change-password", {
    currentPassword,
    newPassword,
  });
}

export async function recoverPassword(
  email: string
): Promise<PasswordRecoveryResponse> {
  return apiRequest<PasswordRecoveryResponse>(
    "post",
    "/users/password-recovery",
    {
      email,
    }
  );
}
