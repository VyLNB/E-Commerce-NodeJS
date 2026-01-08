import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { CustomInputField } from "../../components/form/index.ts";
import { useAuthContext } from "../../contexts/AuthContext/AuthProvider.tsx";

// Xử lý validation sau
// const SigninSchema = z.object({
//   email: z
//     .email("Email không hợp lệ")
//     .min(1, { message: "Email không được để trống" }),
//   password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
// });

// type SigninFormData = z.infer<typeof SigninSchema>;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { user, login } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/admin/home");
    }
  }, [user]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await login(email, password);
    } catch (error) {
      setError(error?.message);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left form */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white p-4 sm:p-6 md:p-10">
        <div className="w-full max-w-sm">
          <h2 className="text-xl sm:text-2xl font-bold text-teal-600 mb-2">
            Chào mừng trở lại
          </h2>
          <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">
            Vui lòng nhập email và password để đăng nhập
          </p>

          {error && (
            <p
              className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded-md border border-red-200"
              data-testid="error"
            >
              {error}
            </p>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <CustomInputField
              type="text"
              label="Email"
              placeHolderText="Địa chỉ email của bạn"
              name="email"
              value={email}
              onChange={setEmail}
            />

            <CustomInputField
              type="password"
              label="Password"
              placeHolderText="Mật khẩu của bạn"
              name="password"
              value={password}
              onChange={setPassword}
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <label className="flex items-center text-sm text-gray-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-teal-600 border-gray-300 rounded"
                />
                <span className="ml-2">Ghi nhớ đăng nhập</span>
              </label>
              <a href="#" className="text-sm text-teal-600 hover:underline">
                Quên mật khẩu?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded-md text-sm sm:text-base"
            >
              Đăng nhập
            </button>
          </form>
        </div>
      </div>

      {/* Right side */}
      <div className="flex w-full md:w-1/2 bg-teal-400 items-center justify-center p-4 sm:p-6">
        <div className="text-white text-2xl sm:text-3xl font-bold flex items-center space-x-2">
          <span className="text-3xl sm:text-4xl">⚡</span>
          <span>GearUp</span>
        </div>
      </div>
    </div>
  );
}
