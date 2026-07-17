import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ResetPassword() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: "",
        password: "",
        newpassword: "",
        confirmpassword: ""
    });
    const [error, setError] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        let obj = {};
        
        if (!form.email) obj.email = "Email is required";
        if (!form.password) obj.password = "Password is required";
        if (!form.newpassword) obj.newpassword = "New Password is required";
        if (!form.confirmpassword) obj.confirmpassword = "Confirm Password is required";

        // ✅ CHANGE: Added validation to check if the new passwords actually match
        if (form.newpassword && form.confirmpassword && form.newpassword !== form.confirmpassword) {
            obj.confirmpassword = "Passwords do not match";
        }

        setError(obj);

        if (Object.keys(obj).length === 0) {
            try {
                const result = await axios.post("http://localhost:1100/user/reset", form);
                console.log(result.data);
                alert("Password changed successfully, please login again.");
                
                localStorage.removeItem("token");
                // ✅ CHANGE: Also remove currentuser to completely clear the session
                localStorage.removeItem("currentuser"); 
                
                navigate("/login");
            } catch (error) {
                console.error(error.response?.data.message);
                alert(`Error : ${error.response?.data.message || "Failed to reset password"}`);
            }
        }
    };

    // ✅ CHANGE: Fixed spelling from hanldeChange to handleChange
    function handleChange(e) {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    }

    return (
        <div>
            <div>
                <button className="btn btn-logout-nav" onClick={() => navigate(-1)}>
                    ⬅ Back
                </button>
            </div>
            <div className="reset-container">
                <h2>Reset Password</h2>
                <form onSubmit={handleSubmit}>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className={error.email ? "input error-input" : "input"}
                    />
                    {error.email && <p className="error-text">{error.email}</p>}

                    <input
                        type="password"
                        placeholder="Current Password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className={error.password ? "input error-input" : "input"}
                    />
                    {error.password && <p className="error-text">{error.password}</p>}

                    <input
                        type="password"
                        placeholder="New Password"
                        name="newpassword"
                        value={form.newpassword}
                        onChange={handleChange}
                        className={error.newpassword ? "input error-input" : "input"}
                    />
                    {error.newpassword && <p className="error-text">{error.newpassword}</p>}

                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={form.confirmpassword}
                        name="confirmpassword"
                        onChange={handleChange}
                        className={error.confirmpassword ? "input error-input" : "input"}
                    />
                    {error.confirmpassword && <p className="error-text">{error.confirmpassword}</p>}

                    <button type="submit" className="submit-btn">Reset Password</button>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;