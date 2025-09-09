'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock, User, IdCard, GraduationCap, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  enrollmentNumber: string
  batch: string
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  enrollmentNumber?: string
  batch?: string
  submit?: string
}

export function RegisterForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    enrollmentNumber: '',
    batch: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    // Enrollment number validation
    if (!formData.enrollmentNumber.trim()) {
      newErrors.enrollmentNumber = 'Enrollment number is required'
    } else if (formData.enrollmentNumber.trim().length < 5) {
      newErrors.enrollmentNumber = 'Please enter a valid enrollment number'
    }

    // Batch validation
    if (!formData.batch.trim()) {
      newErrors.batch = 'Batch is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/students/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.toLowerCase(),
          password: formData.password,
          enrollmentNumber: formData.enrollmentNumber.trim(),
          batch: formData.batch.trim()
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Account Created Successfully! 🎉",
          description: "Welcome to MIND MESH. You can now sign in with your credentials.",
        })
        
        // Redirect to login page after successful registration
        setTimeout(() => {
          router.push('/login')
        }, 1500)
      } else {
        setErrors({ submit: result.message || 'Registration failed' })
        toast({
          title: "Registration Failed",
          description: result.message || "Something went wrong. Please try again.",
        })
      }
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ submit: 'Network error. Please try again.' })
      toast({
        title: "Network Error",
        description: "Please check your connection and try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8, duration: 0.6 }}
    >
      <div className="space-y-4">
        {/* Full Name */}
        <motion.div 
          className="space-y-2"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <Label htmlFor="name" className="text-white/90 font-medium">
            Full Name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
            <Input 
              id="name" 
              name="name"
              type="text" 
              required 
              value={formData.name}
              onChange={handleInputChange}
              className={`pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-emerald-400 focus:ring-emerald-400/50 ${
                errors.name ? 'border-red-400' : ''
              }`}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <div className="flex items-center space-x-1 mt-1">
                <AlertCircle className="w-3 h-3 text-red-400" />
                <span className="text-red-400 text-xs">{errors.name}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Email */}
        <motion.div 
          className="space-y-2"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.5 }}
        >
          <Label htmlFor="email" className="text-white/90 font-medium">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
            <Input 
              id="email" 
              name="email"
              type="email" 
              required 
              value={formData.email}
              onChange={handleInputChange}
              className={`pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-emerald-400 focus:ring-emerald-400/50 ${
                errors.email ? 'border-red-400' : ''
              }`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <div className="flex items-center space-x-1 mt-1">
                <AlertCircle className="w-3 h-3 text-red-400" />
                <span className="text-red-400 text-xs">{errors.email}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Enrollment Number */}
        <motion.div 
          className="space-y-2"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
        >
          <Label htmlFor="enrollmentNumber" className="text-white/90 font-medium">
            Enrollment Number
          </Label>
          <div className="relative">
            <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
            <Input 
              id="enrollmentNumber" 
              name="enrollmentNumber"
              type="text" 
              required 
              value={formData.enrollmentNumber}
              onChange={handleInputChange}
              className={`pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-emerald-400 focus:ring-emerald-400/50 ${
                errors.enrollmentNumber ? 'border-red-400' : ''
              }`}
              placeholder="Enter your enrollment number"
            />
            {errors.enrollmentNumber && (
              <div className="flex items-center space-x-1 mt-1">
                <AlertCircle className="w-3 h-3 text-red-400" />
                <span className="text-red-400 text-xs">{errors.enrollmentNumber}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Batch */}
        <motion.div 
          className="space-y-2"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <Label htmlFor="batch" className="text-white/90 font-medium">
            Batch
          </Label>
          <div className="relative">
            <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
            <Input 
              id="batch" 
              name="batch"
              type="text" 
              required 
              value={formData.batch}
              onChange={handleInputChange}
              className={`pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-emerald-400 focus:ring-emerald-400/50 ${
                errors.batch ? 'border-red-400' : ''
              }`}
              placeholder="e.g., 2024-CSE, 2023-IT"
            />
            {errors.batch && (
              <div className="flex items-center space-x-1 mt-1">
                <AlertCircle className="w-3 h-3 text-red-400" />
                <span className="text-red-400 text-xs">{errors.batch}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Password */}
        <motion.div 
          className="space-y-2"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.5 }}
        >
          <Label htmlFor="password" className="text-white/90 font-medium">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
            <Input 
              id="password" 
              name="password"
              type={showPassword ? "text" : "password"} 
              required 
              value={formData.password}
              onChange={handleInputChange}
              className={`pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-emerald-400 focus:ring-emerald-400/50 ${
                errors.password ? 'border-red-400' : ''
              }`}
              placeholder="Create a password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            {errors.password && (
              <div className="flex items-center space-x-1 mt-1">
                <AlertCircle className="w-3 h-3 text-red-400" />
                <span className="text-red-400 text-xs">{errors.password}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Confirm Password */}
        <motion.div 
          className="space-y-2"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
        >
          <Label htmlFor="confirmPassword" className="text-white/90 font-medium">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
            <Input 
              id="confirmPassword" 
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"} 
              required 
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-emerald-400 focus:ring-emerald-400/50 ${
                errors.confirmPassword ? 'border-red-400' : ''
              }`}
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            {errors.confirmPassword && (
              <div className="flex items-center space-x-1 mt-1">
                <AlertCircle className="w-3 h-3 text-red-400" />
                <span className="text-red-400 text-xs">{errors.confirmPassword}</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-400 rounded-lg p-3 flex items-center space-x-2"
        >
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-red-400 text-sm">{errors.submit}</span>
        </motion.div>
      )}

      {/* Submit Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Account...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Create Account</span>
            </div>
          )}
        </Button>
      </motion.div>
    </motion.form>
  )
}
