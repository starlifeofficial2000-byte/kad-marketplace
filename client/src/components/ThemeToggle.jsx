import { useTheme } from "../context/ThemeContext";

function ThemeToggle() {

    const { darkMode, toggleTheme } = useTheme();

    return (

        <button

            className="theme-btn"

            onClick={toggleTheme}

        >

            {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}

        </button>

    );

}

export default ThemeToggle;