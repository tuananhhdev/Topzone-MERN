// import LoginForm from "@/components/LoginForm";
import LoginForm from "@/components/LoginForm/LoginForm";
import { getCsrfToken } from "next-auth/react";
import React from "react";

const LoginPage = async () => {
  const csrfToken = await getCsrfToken();
  return (
    <div>
      {/* <LoginForm csrfToken={csrfToken} /> */}
      <LoginForm />
    </div>
  );
};

export default LoginPage;
