import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" })
    const [error, setError] = useState("")

    function handleChange(e) {
        const { name, value } = e.target
        setForm({ ...form, [name]: value })
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")
        if (!form.email || !form.password) {
            setError("Email and Password are required")
            return;
        }
        try {
            const result = await axios.post('http://localhost:1100/user/login', form)
            console.log(`>>>>login`, result.data)
            const token = result?.data?.token
            const currentuser = result?.data?.user
            console.log(currentuser)
            localStorage.setItem('currentuser', JSON.stringify(currentuser))
            if (token) {
                localStorage.setItem('token', token)
                navigate('/home')
                setForm({ email: "", password: "" })
            } else {
                setError("password is incorrect")
            }
        } catch (error) {
            console.log("Backend Error:", error.response?.data);
            if (error.response) {
                setError(error.response.data.message);
            } else {
                setError("Something went wrong");
            }
        }
    }

    return (
        <div className="auth-container">
            <h2 className="auth-title">Login</h2>
            <form onSubmit={handleSubmit} className="auth-form">
                <input
                    type="email"
                    placeholder="Enter Email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="auth-input"
                />
                <input
                    type="password"
                    placeholder="Enter Password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="auth-input"
                />
                <p>Don't have a account? <strong onClick={() => navigate("/signup")}>signup</strong></p>
                <button type="submit" className="auth-btn">Login</button>
                <p onClick={() => navigate('/forget')} className="auth-link-text">Forget Password ?</p>
                {error && <p className="auth-error-msg">{error}</p>}

                <button className='auth-btn' onClick={()=>navigate('/hotelform')}>Request Adding Hotel</button>
            </form>
        </div>
    )
}

export default Login