import { useState } from "react";
import { useAuthContext } from "../../contexts/AuthContext/AuthProvider";
import { CustomInputField, ChangePasswordCard } from "../../components/form";

const AdminProfilePage = () => {
  const { user } = useAuthContext();

  const [userInfo, setUserInfo] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
  });

  const handleInfoChange = (key: string, value: string) => {
    setUserInfo({
      ...userInfo,
      [key]: value,
    });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Admin Profile</h2>
        </div>

        {/* Profile info */}
        <div className="bg-white rounded-lg shadow p-6 w-2/3 mx-auto">
          <h3 className="text-xl font-semibold mb-4">Thông tin cá nhân</h3>
          <div className="grid grid-cols-2 gap-4">
            <CustomInputField
              label="Full Name"
              name="fullName"
              value={userInfo.fullName}
              placeHolderText="Your Full Name"
              onChange={(value) => handleInfoChange("fullName", value)}
            />

            <CustomInputField
              label="Email"
              name="email"
              type="email"
              value={userInfo.email}
              onChange={(value) => handleInfoChange("email", value)}
              placeHolderText="your.email@example.com"
            />
          </div>
        </div>

        {/* Change password */}
        <div className="w-2/3 mx-auto">
          <ChangePasswordCard />
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
