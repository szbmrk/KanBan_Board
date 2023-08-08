import React from "react";

export const AuthContext = React.createContext({
    isLoggedIn: false,
    onLogout: () => { },
    onLogin: (data) => { },
});

export default AuthContext;