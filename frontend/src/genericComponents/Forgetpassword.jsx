import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Forgetpassword() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        otp: "",
        newpassword: "",
        confirmpassword: ""
    });

    const [error, setError] = useState({});
    const [otpSent, setOtpSent] = useState(false);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    }
    

    // Send OTP
    const sendOtp = async () => {
        if (!form.email) {
            setError({ email: "Email is required" });
            return;
        }

        try {
            const result = await axios.post("http://localhost:6100/taskuser/sendotp",{email: form.email});
            alert(result.data.message);
            setOtpSent(true);
            setError({});
        } catch (error) {
            console.log(error);
            alert(error.response?.data?.message || "Something went wrong");
        }
    };

    //  FORGET Password
    const handleSubmit = async (e) => {
        e.preventDefault();

        let obj = {};

        if (!form.email) obj.email = "Email is required";
        if (!form.otp) obj.otp = "OTP is required";
        if (!form.newpassword)
            obj.newpassword = "New Password is required";
        if (!form.confirmpassword)
            obj.confirmpassword = "Confirm Password is required";

        if (Object.keys(obj).length > 0) {
            setError(obj);
            return;
        }

        try {
            const result = await axios.post(
                "http://localhost:6100/taskuser/forget",
                form
            );

            alert(result.data.message);
            navigate("/login");
        } catch (error) {
            console.log(error);
            alert(error.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <div className="reset-container">
            <h2>Forgot Password</h2>

            <form onSubmit={handleSubmit}>

                <input
                    type="email"
                    placeholder="Enter your email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className={error.email ? "input error-input" : "input"}
                />

                {error.email && (
                    <p className="error-text">{error.email}</p>
                )}

                {!otpSent ? (
                    <button
                        type="button"
                        className="submit-btn"
                        onClick={sendOtp}
                    >
                        Send OTP
                    </button>
                ) : (
                    <>
                        <input
                            type="text"
                            placeholder="Enter OTP"
                            name="otp"
                            value={form.otp}
                            onChange={handleChange}
                            className={
                                error.otp ? "input error-input" : "input"
                            }
                        />

                        {error.otp && (
                            <p className="error-text">{error.otp}</p>
                        )}

                        <input
                            type="password"
                            placeholder="New Password"
                            name="newpassword"
                            value={form.newpassword}
                            onChange={handleChange}
                            className={
                                error.newpassword
                                    ? "input error-input"
                                    : "input"
                            }
                        />

                        {error.newpassword && (
                            <p className="error-text">
                                {error.newpassword}
                            </p>
                        )}

                        <input
                            type="password"
                            placeholder="Confirm Password"
                            name="confirmpassword"
                            value={form.confirmpassword}
                            onChange={handleChange}
                            className={
                                error.confirmpassword
                                    ? "input error-input"
                                    : "input"
                            }
                        />

                        {error.confirmpassword && (
                            <p className="error-text">
                                {error.confirmpassword}
                            </p>
                        )}

                        <button type="submit" className="submit-btn">
                            Reset Password
                        </button>
                    </>
                )}
            </form>
        </div>
    );
}

export default Forgetpassword;
