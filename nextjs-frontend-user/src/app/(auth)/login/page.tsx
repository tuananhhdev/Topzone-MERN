import LoginForm from "@/components/LoginForm";
import { getCsrfToken } from "next-auth/react";
import React from "react";

const LoginPage = async () => {
  const csrfToken = await getCsrfToken();
  return (
    <div>
      <LoginForm csrfToken={csrfToken} />
    </div>
  );
};

export default LoginPage;
