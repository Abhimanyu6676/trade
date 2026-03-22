//medium.com/@vmaineng/how-i-implemented-zod-and-react-hook-form-for-register-component-and-lessons-i-ve-learned-3a51c4dd3894
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { authApi } from "../../api/auth";
import * as styles from "./index.module.scss";
import { FormData, zodResolver } from "./zodSchema";
import { navigate } from "gatsby";
import eventBus from "../../util/eventBus";

export default function AuthUI(): JSX.Element {
  const [form, setForm] = useState<"register" | "login" | "forgot">("login");
  const [theme, setTheme] = useState("dark");

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver,
    defaultValues: { name: "admin2", email: "iamlive247@gmail.com", password: "12345678" },
    //shouldUnregister: true,
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = (): void => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const onSubmit = async (data: FormData): Promise<void> => {
    try {
      if (form === "register") {
        await authApi.register({ ...data, name: data.name ?? "username" });
        setForm("login");
      }
      if (form === "login") {
        const loginResponse = await authApi.login({
          data,
          successCb: (props) => {
            eventBus.getEmitter("AUTH")({
              type: "AUTH",
              action: { type: "LOGIN", data: { ...props.user, userID: props.user.id } },
            });
            navigate("/", { replace: true, state: { from: location?.pathname ?? "/" } });
          },
        });
        //console.log("login response =", loginResponse);
      }
      if (form === "forgot") {
        // Handle forgot password
      }
    } catch (error: any) {}
  };

  return (
    <div className={styles.auth_wrapper}>
      <div className={styles.auth_card}>
        <button className={`btn btn-sm btn-secondary ${styles.theme_btn}`} onClick={toggleTheme}>
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
                <input type="text" className="form-control" placeholder="Name" {...register("name")} />
                <label>Name</label>
                {errors.name?.message && <small className="text-danger">{String(errors.name.message)}</small>}
              </div>
            )}

            {/* EMAIL */}

            <div className="form-floating mb-3">
              <input type="email" className="form-control" placeholder="Email" {...register("email")} />
              <label>Email</label>
              {errors.email?.message && <small className="text-danger">{String(errors.email.message)}</small>}
            </div>

            {/* PASSWORD */}

            {form !== "forgot" && (
              <div className={`mb-3 ${styles.password_field}`}>
                <div className="form-floating">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={"form-control"}
                    placeholder="Password"
                    {...register("password")}
                  />
                  <label>Password</label>
                </div>

                <span className={styles.password_toggle} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>

                {errors.password?.message && <small className="text-danger">{String(errors.password.message)}</small>}
              </div>
            )}

            <button className="btn btn-primary w-100" disabled={isSubmitting}>
              {isSubmitting ? "Please wait..." : "Submit"}
            </button>

            <div className="text-center mt-3 small">
              {form === "login" && (
                <>
                  <span className={`${styles.auth_link} text-primary me-3`} onClick={() => setForm("forgot")}>
                    Forgot?
                  </span>

                  <span className={`${styles.auth_link} text-primary`} onClick={() => setForm("register")}>
                    Create account
                  </span>
                </>
              )}

              {form === "register" && (
                <span className={`${styles.auth_link} text-primary`} onClick={() => setForm("login")}>
                  Already have account
                </span>
              )}

              {form === "forgot" && (
                <span className={`${styles.auth_link} text-primary`} onClick={() => setForm("login")}>
                  Back to login
                </span>
              )}
            </div>
          </motion.form>
        </AnimatePresence>
      </div>
    </div>
  );
}
