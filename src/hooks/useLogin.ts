import { useState, useEffect } from "react";
import firebase from "firebase";
import { IUser } from "../models/User";

export const useLogin = () => {
  const [user, setUser] = useState<IUser | null>(null);

  useEffect(() => {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        setUser({
          email: user.email || "",
          firstName: user.displayName || "",
          lastName: user.displayName || "",
          username: user.email || ""
        });
      } else {
        setUser(null);
      }
    });
  }, []);

  return user;
};
