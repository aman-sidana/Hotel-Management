import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { gsap } from 'gsap'
import { useNavigate, Link } from 'react-router-dom'

function Signup() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" })
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
        if (error) setError("")
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!form.name || !form.email || !form.password) {
            setError("All fields are required")
            return
        }
        try {
            const result = await axios.post('http://localhost:1100/user/signup', form)
            console.log(`>>>>signup`, result.data)
            navigate('/')
            setForm({ name: "", email: "", password: "", phone: "" })
        } catch (error) {
            setError(error.response?.data?.message || "An error occurred during signup")
        }
    }

    return (
        <div className="min-h-screen bg-[#F7F6F0] font-['Inter',sans-serif] flex items-center justify-center p-4">
            <div 
                ref={formRef} 
                className="w-full max-w-md bg-white border border-[#E5E2D5] rounded-lg shadow-sm p-8"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <p className="text-[11px] uppercase tracking-widest text-[#A2782E] font-semibold mb-1">
                        Create Account
                    </p>
                    <h2 className="text-3xl font-bold text-[#1B2537]">
                        Sign Up
                    </h2>
                    <p className="text-sm text-gray-500 mt-2">
                        Join us to explore and book your luxury stays
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            placeholder="John Doe"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full bg-[#F7F6F0] border border-[#E5E2D5] rounded px-4 py-3 text-sm text-[#1B2537] placeholder-gray-400 focus:outline-none focus:border-[#A2782E] focus:bg-white transition"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full bg-[#F7F6F0] border border-[#E5E2D5] rounded px-4 py-3 text-sm text-[#1B2537] placeholder-gray-400 focus:outline-none focus:border-[#A2782E] focus:bg-white transition"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full bg-[#F7F6F0] border border-[#E5E2D5] rounded px-4 py-3 text-sm text-[#1B2537] placeholder-gray-400 focus:outline-none focus:border-[#A2782E] focus:bg-white transition"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            className="w-full bg-[#F7F6F0] border border-[#E5E2D5] rounded px-4 py-3 text-sm text-[#1B2537] placeholder-gray-400 focus:outline-none focus:border-[#A2782E] focus:bg-white transition"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-xs text-center font-medium">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="w-full bg-[#1B2537] hover:bg-[#A2782E] text-white font-semibold text-xs uppercase tracking-wider py-3.5 rounded transition duration-200 cursor-pointer mt-2"
                    >
                        Sign Up
                    </button>
                </form>

                {/* Footer Link */}
                <div className="mt-6 border-t border-[#E5E2D5] pt-4 text-center">
                    <p className="text-xs text-gray-600">
                        Already have an account?{" "}
                        <Link to="/" className="text-[#A2782E] font-semibold hover:underline">
                            Log In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Signup