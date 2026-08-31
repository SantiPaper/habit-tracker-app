import { useState } from 'react'

import { useLogin } from '../hooks/use-login'
import { useRegister } from '../hooks/use-register'

type Mode = 'login' | 'register'

const inputClass = 'border-border bg-bg text-text rounded-lg border px-3 py-2.5 text-sm'

export function LoginRegisterForm() {
    const [mode, setMode] = useState<Mode>('login')
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const loginMutation = useLogin()
    const registerMutation = useRegister()

    const mutation = mode === 'login' ? loginMutation : registerMutation
    const error = mutation.error instanceof Error ? mutation.error.message : null

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (mode === 'login') {
            loginMutation.mutate({ identifier: username, password })
        } else {
            registerMutation.mutate({ username, email, password })
        }
    }

    return (
        <div className='border-border bg-surface mx-auto flex w-full max-w-sm flex-col gap-5 rounded-2xl border p-8'>
            <div className='flex flex-col gap-1'>
                <span className='text-accent font-mono text-xs font-bold tracking-widest uppercase'>
                    {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                </span>
                <span className='text-text-muted text-sm'>
                    Para agregar amigos y que vean tu nivel necesitás una cuenta.
                </span>
            </div>

            <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
                <div className='flex flex-col gap-1.5'>
                    <label htmlFor='username' className='text-text-muted text-xs font-medium'>
                        {mode === 'login' ? 'Usuario o email' : 'Usuario'}
                    </label>
                    <input
                        id='username'
                        type='text'
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className={inputClass}
                        required
                    />
                </div>

                {mode === 'register' && (
                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor='email' className='text-text-muted text-xs font-medium'>
                            Email
                        </label>
                        <input
                            id='email'
                            type='email'
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className={inputClass}
                            required
                        />
                    </div>
                )}

                <div className='flex flex-col gap-1.5'>
                    <label htmlFor='password' className='text-text-muted text-xs font-medium'>
                        Contraseña
                    </label>
                    <input
                        id='password'
                        type='password'
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className={inputClass}
                        required
                        minLength={8}
                    />
                </div>

                {error && <span className='text-sm text-red-400'>{error}</span>}

                <button
                    type='submit'
                    disabled={mutation.isPending}
                    className='bg-accent text-accent-ink mt-1 rounded-lg px-4 py-2.5 text-sm font-bold transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50'
                >
                    {mutation.isPending ? 'Un momento...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
                </button>
            </form>

            <button
                type='button'
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className='text-text-muted hover:text-text text-center text-xs transition-colors'
            >
                {mode === 'login' ? '¿No tenés cuenta? Creá una' : '¿Ya tenés cuenta? Iniciá sesión'}
            </button>
        </div>
    )
}
