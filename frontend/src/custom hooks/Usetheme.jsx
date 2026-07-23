import { useEffect, useState } from "react";
import axios from "axios";

function UseTheme() {
  const currentUser = JSON.parse(localStorage.getItem("currentuser"));

  const [theme, setTheme] = useState(
    currentUser?.theme || "light"
  );

  useEffect(() => {
    // Apply dark class to <html> for Tailwind's darkMode: 'class'
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  }, [theme]);

  const changeTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";

    try {
      const result = await axios.patch(
        `http://localhost:1100/user/theme?id=${currentUser._id}`,
        { theme: newTheme }
      );

      setTheme(newTheme);

      const updatedUser = result.data.user;
      localStorage.setItem("currentuser", JSON.stringify(updatedUser));
    } catch (error) {
      console.log(error);
      // Still update UI even if API fails
      setTheme(newTheme);
    }
  };

  return { theme, changeTheme };
}

export default UseTheme;