// import LoginForm from "@/components/LoginForm";
import LoginForm from "@/components/LoginForm/LoginForm";
import { GoogleOAuthProvider } from "@react-oauth/google";
import React from "react";

const LoginPage = async () => {
  return (
    <div>
      <GoogleOAuthProvider clientId="991152304248-nd5pct6di26gep2npmd8m6i0eguq4rrv.apps.googleusercontent.com">
        <LoginForm />
      </GoogleOAuthProvider>
    </div>
  );
};

export default LoginPage;
