//chat history for GPT code
//https:chatgpt.com/share/69b4fba9-4fb0-800e-8318-3b9f6cdf3139
// medium react form hook with ZOD validation tutorial
//medium.com/@vmaineng/how-i-implemented-zod-and-react-hook-form-for-register-component-and-lessons-i-ve-learned-3a51c4dd3894
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { z } from "zod";
import { useForm, Resolver } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { AxiosError } from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
export { default as ProtectedRoute } from "./ProtectedRoute";

const formSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email format").min(1, "Email is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .refine((password: string) => /[0-9]/.test(password), {
      message: "Password must contain at least one number.",
    })
    .refine((password: string) => /[!@#$%^&*(),.?":{}|<>]/.test(password), {
      message: "Password must contain at least one special character",
    })
    .optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AuthUIProps {}

export default function AuthUI(): JSX.Element {
  const [form, setForm] = useState("login");
  const [theme, setTheme] = useState("dark");

  const [showPassword, setShowPassword] = useState(false);

  const zodResolver: Resolver<FormData> = async (values) => {
    const result = formSchema.safeParse(values);
    if (result.success) {
      return { values: result.data, errors: {} };
    }

    const fieldErrors = result.error.flatten().fieldErrors;
    const errors = Object.entries(fieldErrors).reduce(
      (acc, [key, messages]) => {
        if (messages && messages.length) {
          acc[key as keyof FormData] = {
            type: "validation",
            message: messages[0],
          };
        }
        return acc;
      },
      {} as Record<keyof FormData, any>,
    );

    return { values: {}, errors };
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver,
    defaultValues: { name: "", email: "", password: "" },
    //shouldUnregister: true,
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = (): void => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const onSubmit = async (data: FormData): Promise<void> => {
    let url = "/api/login";
    try {
      if (form === "register") url = "/api/register";
      if (form === "forgot") url = "/api/forgot-password";

      await axios.post(url, data);
      alert("Success");
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        // Axios specific error handling
        const axiosError = error as AxiosError;
        const message =
          (axiosError.response?.data as any)?.message || axiosError.message;
        setError("root", { type: "api", message });
        alert(`API Error: ${message}`);
      } else {
        alert("API Error");
      }
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <button
          className="btn btn-sm btn-secondary theme-btn"
          onClick={toggleTheme}
        >
          Toggle
        </button>

        <AnimatePresence mode="wait">
          <motion.form
            key={form}
            onSubmit={handleSubmit(onSubmit)}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
          >
            <h3 className="text-center mb-4 text-capitalize">
              {form === "login" && "Login"}
              {form === "register" && "Register"}
              {form === "forgot" && "Reset Password"}
            </h3>

            {/* NAME */}

            {form === "register" && (
              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control"
                  //name="name"
                  placeholder="Name"
                  {...register("name")}
                />
                <label>Name</label>
                {errors.name?.message && (
                  <small className="text-danger">
                    {String(errors.name.message)}
                  </small>
                )}
              </div>
            )}

            {/* EMAIL */}

            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                //name="email"
                placeholder="Email"
                {...register("email")}
              />{" "}
              <label>Email</label>
              {errors.email?.message && (
                <small className="text-danger">
                  {String(errors.email.message)}
                </small>
              )}
            </div>

            {/* PASSWORD */}

            {form !== "forgot" && (
              <div className="mb-3 password-field">
                <div className="form-floating">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    //name="password"
                    placeholder="Password"
                    {...register("password")}
                  />{" "}
                  <label>Password</label>
                </div>

                <span
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {" "}
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>

                {errors.password?.message && (
                  <small className="text-danger">
                    {String(errors.password.message)}
                  </small>
                )}
              </div>
            )}

            <button className="btn btn-primary w-100" disabled={isSubmitting}>
              {isSubmitting ? "Please wait..." : "Submit"}
            </button>

            <div className="text-center mt-3 small">
              {form === "login" && (
                <>
                  <span
                    className="auth-link text-primary me-3"
                    onClick={() => setForm("forgot")}
                  >
                    Forgot?
                  </span>

                  <span
                    className="auth-link text-primary"
                    onClick={() => setForm("register")}
                  >
                    Create account
                  </span>
                </>
              )}

              {form === "register" && (
                <span
                  className="auth-link text-primary"
                  onClick={() => setForm("login")}
                >
                  Already have account
                </span>
              )}

              {form === "forgot" && (
                <span
                  className="auth-link text-primary"
                  onClick={() => setForm("login")}
                >
                  Back to login
                </span>
              )}
            </div>
          </motion.form>
        </AnimatePresence>
      </div>

      <style>{`

html[data-theme="dark"]{
--bg:#0f0f10;
--card:#1b1b1d;
--text:#fff;
--input:#262629;
--border:#3a3a3a;
}

html[data-theme="light"]{
--bg:#f5f6f9;
--card:#fff;
--text:#111;
--input:#fff;
--border:#ddd;
}

.auth-wrapper{
background:var(--bg);
min-height:100vh;
display:flex;
align-items:center;
justify-content:center;
}

.auth-card{
background:var(--card);
padding:40px;
border-radius:16px;
max-width:420px;
width:100%;
color:var(--text);
position:relative;
box-shadow:0 20px 60px rgba(0,0,0,.35);
}

.form-control{
background:var(--input);
border:1px solid var(--border);
color:var(--text);
}

.form-control:focus{
background:var(--input);
color:var(--text);
box-shadow:none;
}

.auth-link{
cursor:pointer;
}

.theme-btn{
position:absolute;
top:10px;
right:10px;
}

.password-field{
position:relative;
}

.password-toggle{
position:absolute;
right:15px;
top:18px;
cursor:pointer;
opacity:.7;
}

`}</style>
    </div>
  );
}
