import { useEffect, useState } from "react";
import axios from "axios";

function UseTheme() {
  const currentUser = JSON.parse(localStorage.getItem("currentuser"));

  const [theme, setTheme] = useState(
    currentUser?.theme || "light"
  );

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const changeTheme = async () => {
    const newTheme =
      theme === "light" ? "dark" : "light";

    try {
      const result = await axios.patch(
        `http://localhost:1100/user/theme?id=${currentUser._id}`,
        {
          theme: newTheme,
        }
      );

      setTheme(newTheme);

      const updatedUser = result.data.user;

      localStorage.setItem(
        "currentuser",
        JSON.stringify(updatedUser)
      );
    } catch (error) {
      console.log(error);
    }
  };

  return {
    theme,
    changeTheme,
  };
}

export default UseTheme;