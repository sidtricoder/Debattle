import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../stores/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';

interface RegisterFormInputs {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
  photo: FileList;
}

const RegisterPage: React.FC = () => {
  const { signup, loginWithGoogle } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterFormInputs>();

  const onSubmit = async (data: RegisterFormInputs) => {
    setError(null);
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    let photoURL = '';
    if (data.photo && data.photo.length > 0) {
      const file = data.photo[0];
      photoURL = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    }
    const success = await signup({
      displayName: data.displayName,
      email: data.email,
      password: data.password,
      photoURL,
      preferences: { theme: 'light', notifications: {}, privacy: {} },
      stats: { totalArgumentsPosted: 0, averageResponseTime: 0, favoriteTopics: [], strongestCategories: [] },
    } as any); // Type assertion to satisfy the store signature
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Email already in use.');
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    const success = await loginWithGoogle();
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Google sign-in failed.');
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => setAvatar(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary via-accent to-primary">
      <motion.form
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white dark:bg-dark rounded-xl shadow-xl p-8 w-full max-w-md flex flex-col gap-6"
        aria-label="Register form"
      >
        <h2 className="text-3xl font-bold text-center mb-2">Sign Up</h2>
        {error && <div className="text-red-600 bg-red-100 dark:bg-red-900 rounded p-2 text-center">{error}</div>}
        <div className="flex flex-col items-center gap-2">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            {...register('photo')}
            ref={fileInputRef}
            onChange={handleAvatarChange}
          />
          <div
            className="w-20 h-20 rounded-full bg-secondary-light dark:bg-secondary flex items-center justify-center cursor-pointer overflow-hidden border-2 border-accent mb-2"
            onClick={() => fileInputRef.current?.click()}
            tabIndex={0}
            aria-label="Upload avatar"
            role="button"
          >
            {avatar ? (
              <img src={avatar} alt="Avatar preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-secondary">Upload</span>
            )}
          </div>
        </div>
        <div>
          <label htmlFor="displayName" className="block font-semibold mb-1">Display Name</label>
          <input
            id="displayName"
            type="text"
            {...register('displayName', { required: 'Display name is required' })}
            className="w-full px-4 py-2 rounded border border-secondary focus:ring-2 focus:ring-accent"
            aria-invalid={!!errors.displayName}
            aria-describedby="displayName-error"
          />
          {errors.displayName && <span id="displayName-error" className="text-red-500 text-xs">{errors.displayName.message}</span>}
        </div>
        <div>
          <label htmlFor="email" className="block font-semibold mb-1">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email', { required: 'Email is required' })}
            className="w-full px-4 py-2 rounded border border-secondary focus:ring-2 focus:ring-accent"
            aria-invalid={!!errors.email}
            aria-describedby="email-error"
          />
          {errors.email && <span id="email-error" className="text-red-500 text-xs">{errors.email.message}</span>}
        </div>
        <div>
          <label htmlFor="password" className="block font-semibold mb-1">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
            className="w-full px-4 py-2 rounded border border-secondary focus:ring-2 focus:ring-accent"
            aria-invalid={!!errors.password}
            aria-describedby="password-error"
          />
          {errors.password && <span id="password-error" className="text-red-500 text-xs">{errors.password.message}</span>}
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block font-semibold mb-1">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword', { required: 'Please confirm your password' })}
            className="w-full px-4 py-2 rounded border border-secondary focus:ring-2 focus:ring-accent"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby="confirmPassword-error"
          />
          {errors.confirmPassword && <span id="confirmPassword-error" className="text-red-500 text-xs">{errors.confirmPassword.message}</span>}
        </div>
        <button
          type="submit"
          className="w-full py-3 rounded bg-button-gradient text-white font-bold text-lg shadow hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-accent"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing up...' : 'Sign Up'}
        </button>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full py-3 rounded flex items-center justify-center gap-2 border border-secondary bg-white dark:bg-dark text-foreground font-bold text-lg shadow hover:scale-105 transition-transform mt-2 focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Sign up with Google"
        >
          <FcGoogle size={22} /> Sign up with Google
        </button>
        <div className="flex justify-between text-sm mt-2">
          <Link to="/login" className="text-accent hover:underline">Already have an account?</Link>
        </div>
      </motion.form>
    </main>
  );
};

export default RegisterPage;
