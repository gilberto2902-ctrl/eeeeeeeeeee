import React, { useState } from 'react';
import Logo from './Logo';
import NetworkBackground from './NetworkBackground';
import { loginWithGoogle } from '../firebase';

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Erro ao fazer login com Google. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center relative overflow-hidden">
      <NetworkBackground />
      
      <div className="z-10 bg-gray-800/80 backdrop-blur-md p-8 rounded-lg shadow-2xl w-full max-w-md border border-gray-700 m-4">
        <div className="flex justify-center mb-8">
          <Logo className="h-16 text-orange-500" dark={true} />
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-6">Acesso ao Sistema</h2>

        <div className="space-y-6">
          <p className="text-gray-400 text-center text-sm">
            Bem-vindo ao Idealle System. Utilize sua conta Google para acessar o sistema de calibração.
          </p>

          {error && (
            <div className="p-3 bg-red-900/50 border border-red-700 rounded text-red-200 text-sm text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3 bg-white hover:bg-gray-100 text-gray-900 font-bold rounded shadow-lg transform transition hover:-translate-y-0.5 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="animate-spin h-5 w-5 border-2 border-orange-500 border-t-transparent rounded-full" />
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
                ENTRAR COM GOOGLE
              </>
            )}
          </button>
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
          &copy; 2025 Idealle Inspeções Industriais
        </div>
      </div>
    </div>
  );
};

export default Login;
