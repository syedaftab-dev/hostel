import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const { signIn, signUp } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        if (!name.trim() || !rollNumber.trim()) {
          showToast('Please fill in all required fields', 'error');
          setIsLoading(false);
          return;
        }

        const { error } = await signUp(email, password, {
          name: name.trim(),
          roll_number: rollNumber.trim(),
          phone_number: phoneNumber.trim() || undefined,
        });

        if (error) {
          console.error('Signup error:', error);
          if (error.message.includes('already registered') || error.message.includes('already been registered')) {
            showToast('This email is already registered. Please sign in instead.', 'error');
          } else if (error.message.includes('Password should be at least 6 characters')) {
            showToast('Password should be at least 6 characters long.', 'error');
          } else if (error.message.includes('Invalid email')) {
            showToast('Please enter a valid email address.', 'error');
          } else {
            showToast(error.message || 'Failed to create account. Please try again.', 'error');
          }
        } else {
          showToast('Account created successfully! You can now sign in.', 'success');
          setIsSignUp(false);
          setName('');
          setRollNumber('');
          setPhoneNumber('');
        }
      } else {
        const { error } = await signIn(email, password);

        if (error) {
          console.error('Signin error:', error);
          if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_credentials')) {
            showToast('Invalid email or password. Please try again.', 'error');
          } else if (error.message.includes('Email not confirmed')) {
            showToast('Please check your email and confirm your account.', 'error');
          } else {
            showToast(error.message || 'Failed to sign in. Please try again.', 'error');
          }
        } else {
          showToast('Welcome back!', 'success');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      showToast('An unexpected error occurred. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex flex-col">
      {/* Header Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg mb-6">
          <img
            src="/image-2.png"
            alt="IIITDM Kurnool Logo"
            className="w-16 h-16 object-contain"
          />
        </div>
        
        <h1 className="text-2xl font-bold text-white text-center mb-2">
          Hostel Management
        </h1>
        <p className="text-blue-100 text-center mb-8">
          IIITDM Kurnool
        </p>

        {/* Auth Form */}
        <div className="w-full max-w-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent backdrop-blur-sm"
                    required
                  />
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Roll Number"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent backdrop-blur-sm"
                    required
                  />
                </div>

                <div className="relative">
                  <input
                    type="tel"
                    placeholder="Phone Number (Optional)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent backdrop-blur-sm"
                  />
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent backdrop-blur-sm"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent backdrop-blur-sm"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-blue-700 hover:bg-gray-100 font-semibold py-3 rounded-lg transition-colors"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-white/80 text-sm hover:text-white transition-colors"
              disabled={isLoading}
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 text-center">
        <p className="text-white/60 text-xs">
          © 2024 IIITDM Kurnool. All rights reserved.
        </p>
      </div>
    </div>
  );
};