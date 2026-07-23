import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { gsap } from 'gsap'
import { useNavigate } from 'react-router-dom'


function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const formRef = useRef(null)

    useEffect(() => {
        const context = gsap.context(() => {
            gsap.from(formRef.current, { 
                autoAlpha: 0, 
                duration: 0.85, 
                scale: 0.9, 
                y: 30, 
                ease: 'back.out(1.7)' 
            })
        })
        return () => context.revert()
    }, [])

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

        setLoading(true)
        try {
            const result = await axios.post('http://localhost:1100/user/login', form)
            const token = result?.data?.token
            const currentuser = result?.data?.user
            
            localStorage.setItem('currentuser', JSON.stringify(currentuser))
            
            if (token) {
                localStorage.setItem('token', token)
                navigate('/home')
                setForm({ email: "", password: "" })
            } else {
                setError("Password is incorrect")
            }
        } catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page-wrapper">
            {/* Ambient Background Gradient Orbs */}
            <div className="gradient-orb orb-1"></div>
            <div className="gradient-orb orb-2"></div>
            <div className="gradient-orb orb-3"></div>

            {/* Login Glass Card */}
            <div ref={formRef} className="auth-card">
                <div className="auth-header">
                    <h2 className="auth-title">Welcome Back</h2>
                    <p className="auth-subtitle">Please sign in to continue to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <input
                            type="email"
                            placeholder="name@company.com"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="auth-input"
                        />
                    </div>

                    <div className="input-group">
                        <div className="label-row">
                            <label className="input-label">Password</label>
                            <span 
                                onClick={() => navigate('/forget')} 
                                className="forgot-link"
                            >
                                Forgot?
                            </span>
                        </div>
                        <input
                            type="password"
                            placeholder="••••••••"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            className="auth-input"
                        />
                    </div>

                    {error && <div className="error-banner">{error}</div>}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="btn-primary"
                    >
                        {loading ? "Signing in..." : "Login"}
                    </button>

                    <p className="signup-prompt">
                        Don't have an account?{" "}
                        <strong 
                            onClick={() => navigate("/signup")}
                            className="signup-link"
                        >
                            Sign up
                        </strong>
                    </p>

                    <div className="divider">
                        <span>OR</span>
                    </div>

                    <button 
                        type="button"
                        onClick={() => navigate('/adminform')}
                        className="btn-secondary"
                    >
                        Admin Request
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Login