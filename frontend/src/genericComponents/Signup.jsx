import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { gsap } from 'gsap'
import { useNavigate } from 'react-router-dom'

function Signup() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: "", email: "", password: "" ,phone:"" })
    const [error, setError] = useState("")
    const formRef = useRef(null)

    useEffect(() => {
        const context = gsap.context(() => {
            gsap.from(formRef.current, { autoAlpha: 0, duration: 0.75, scale: 0.92, y: 24, ease: 'back.out(1.7)' })
        })
        return () => context.revert()
    }, [])

    function handleChange(e) {
        const { name, value } = e.target
        setForm({ ...form, [name]: value })
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!form.name || !form.email || !form.password) {
            setError("All fields are required")
        }
        try {
            const result = await axios.post('http://localhost:1100/user/signup', form)
            console.log(`>>>>signup`, result.data)
            navigate('/')
            setForm({ name: "", email: "", password: "" ,phone:""})
        } catch (error) {
            setError(error.response.data.message)
        }
    }
    
    return (
        <div className="auth-container">
            <h2 className="auth-title">Sign Up</h2>
            <form onSubmit={handleSubmit} className="auth-form" ref={formRef}>
                <input
                    type="text"
                    placeholder="Enter Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="auth-input"
                />
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
                 <input
                    type="phone"
                    placeholder="Enter phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="auth-input"
                />
                <button type="submit" className="auth-btn">Sign Up</button>
                {error && <p className="auth-error-msg">{error}</p>}
            </form>
        </div>
    )
}

export default Signup
