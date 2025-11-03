'use client';


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Database } from '@/lib/database.types'
import styles from './AnimatedAuthForm.module.css';
import AuthButton from './AuthButton';
import Loading from '@/src/app/loading';

// ログインフォームのバリデーションスキーマ
const loginSchema = z.object({
  email: z.string().email({ message: 'メールアドレスの形式ではありません。' }),
  password: z.string().min(6, { message: '6文字以上入力する必要があります。' }),
});

// サインアップフォームのバリデーションスキーマ
const signupSchema = z.object({
  email: z.string().email({ message: 'メールアドレスの形式ではありません。' }),
  password: z.string().min(6, { message: '6文字以上入力する必要があります。' }),
  passwordConfirm: z.string().min(6, { message: '6文字以上入力する必要があります。' }),
 }) // .refine((data) => data.password === data.passwordConfirm, {
//   message: 'パスワードが一致しません',
//   path: ['passwordConfirm'],
// });

type LoginSchema = z.infer<typeof loginSchema>;
type SignupSchema = z.infer<typeof signupSchema>;

export default function AnimatedAuthForm() {
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  const [isLoginActive, setIsLoginActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  // ログインフォーム
  const loginForm = useForm<LoginSchema>({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(loginSchema),
  });

  // サインアップフォーム
  const signupForm = useForm<SignupSchema>({
    defaultValues: { email: '', password: '', passwordConfirm: '' },
    resolver: zodResolver(signupSchema),
  });

  // ページ読み込み時にセッションをチェック
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/');
      }
    };
    checkSession();
  }, [router, supabase]);

  // ログイン処理
  const handleLogin: SubmitHandler<LoginSchema> = async (data) => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;

      if (authData.session) {
        router.push('/');
        router.refresh();
      }
    } catch (error: any) {
      setError(error.message || 'エラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  // サインアップ処理
  const handleSignup: SubmitHandler<SignupSchema> = async (data) => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });

      if (authError) throw authError;

      // メール確認が必要な場合
      if (authData.user && !authData.session) {
        setMessage('確認メールを送信しました。メールをチェックしてください。');
      } else if (authData.session) {
        router.push('/');
        router.refresh();
      }
    } catch (error: any) {
      setError(error.message || 'エラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  // フォーム切り替え時の処理
  const switchToLogin = () => {
    setIsLoginActive(true);
    setError(null);
    setMessage(null);
    loginForm.reset();
  };

  const switchToSignup = () => {
    setIsLoginActive(false);
    setError(null);
    setMessage(null);
    signupForm.reset();
  };

  return (
    <section className={styles.formsSection}>
      <div className={styles.forms}>
        {/* エラーメッセージ */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* 成功メッセージ */}
        {message && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
            {message}
          </div>
        )}

        {/* Login Form Wrapper */}
        <div className={`${styles.formWrapper} ${isLoginActive ? styles.isActive : ''}`}>
          <button
            type="button"
            className={`${styles.switcher} ${styles.switcherLogin}`}
            onClick={switchToLogin}
          >
            log in
            <span className={styles.underline}></span>
          </button>
          <form 
            className={`${styles.form} ${styles.formLogin}`} 
            onSubmit={loginForm.handleSubmit(handleLogin)}
          >
            <fieldset>
              <legend>ソーシャルアカウントまたはメールアドレスでログイン</legend>
              <div className={styles.inputBlock}>
                <label htmlFor="login-email">メールアドレス</label>
                <input 
                  id="login-email"
                  type="email"
                  disabled={loading}
                  {...loginForm.register('email')}
                />
                {loginForm.formState.errors.email && (
                  <div className="text-sm text-red-500 mt-1">
                    {loginForm.formState.errors.email.message}
                  </div>
                )}
              </div>
              <div className={styles.inputBlock}>
                <label htmlFor="login-password">パスワード</label>
                <input 
                  id="login-password"
                  type="password"
                  disabled={loading}
                  {...loginForm.register('password')}
                />
                {loginForm.formState.errors.password && (
                  <div className="text-sm text-red-500 mt-1">
                    {loginForm.formState.errors.password.message}
                  </div>
                )}
              </div>
            </fieldset>
            
            {loading ? (
              <div className="my-5">
                <Loading />
              </div>
            ) : (
              <button 
                type="submit" 
                className={styles.btnLogin}
                disabled={loading}
              >
                LOG IN
              </button>
            )}

            {message && <div className="my-5 text-center text-sm text-red-500">{message}</div>}
            
            <div className="text-center text-sm mb-5 mt-8">
                <Link href="/auth/reset-password" className="text-gray-500 font-bold">
                    パスワードを忘れた方はこちら
                </Link>
            </div>
            
             
            {/* <div className={styles.divider}>
              <span>または</span>
            </div>
            <div className={styles.socialLogin}>
              <AuthButton />
            </div> */}
          </form>
        </div>

        {/* Signup Form Wrapper */}
        <div className={`${styles.formWrapper} ${!isLoginActive ? styles.isActive : ''}`}>
          <button
            type="button"
            className={`${styles.switcher} ${styles.switcherSignup}`}
            onClick={switchToSignup}
          >
            sign up
            <span className={styles.underline}></span>
          </button>
          <form 
            className={`${styles.form} ${styles.formSignup}`} 
            onSubmit={signupForm.handleSubmit(handleSignup)}
          >
            <fieldset>
              <legend>メールアドレスでサインアップ</legend>
              <div className={styles.inputBlock}>
                <label htmlFor="signup-email">メールアドレス</label>
                <input 
                  id="signup-email"
                  type="email"
                  disabled={loading}
                  {...signupForm.register('email')}
                />
                {signupForm.formState.errors.email && (
                  <div className="text-sm text-red-500 mt-1">
                    {signupForm.formState.errors.email.message}
                  </div>
                )}
              </div>
              <div className={styles.inputBlock}>
                <label htmlFor="signup-password">パスワード</label>
                <input 
                  id="signup-password"
                  type="password"
                  disabled={loading}
                  {...signupForm.register('password')}
                />
                {signupForm.formState.errors.password && (
                  <div className="text-sm text-red-500 mt-1">
                    {signupForm.formState.errors.password.message}
                  </div>
                )}
              </div>
              <div className={styles.inputBlock}>
                <label htmlFor="signup-password-confirm">パスワード（確認用）</label>
                <input 
                  id="signup-password-confirm"
                  type="password"
                  disabled={loading}
                  {...signupForm.register('passwordConfirm')}
                />
                {signupForm.formState.errors.passwordConfirm && (
                  <div className="text-sm text-red-500 mt-1">
                    {signupForm.formState.errors.passwordConfirm.message}
                  </div>
                )}
              </div>
            </fieldset>
            
            {loading ? (
              <div className="my-5">
                <Loading />
              </div>
            ) : (
              <button 
                type="submit" 
                className={styles.btnSignup}
                disabled={loading}
              >
                SIGN UP
              </button>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}