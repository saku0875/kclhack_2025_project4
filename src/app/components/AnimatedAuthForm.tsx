'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase'
import styles from './AnimatedAuthForm.module.css';
import AuthButton from './AuthButton';

export default function AnimatedAuthForm() {
  const [isLoginActive, setIsLoginActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // ページ読み込み時にセッションをチェック
  useEffect(() => {
    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            router.push('/auth/dashboard');
        }
    }
  })

  // ログイン処理
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error: any) {
      setError(error.message || 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // サインアップ処理
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const passwordConfirm = formData.get('password-confirm') as string;

    // パスワード確認
    if (password !== passwordConfirm) {
      setError('パスワードが一致しません');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      // メール確認が必要な場合
      if (data.user && !data.session) {
        setMessage('確認メールを送信しました。メールをチェックしてください。');
      } else if (data.session) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error: any) {
      setError(error.message || 'サインアップに失敗しました');
    } finally {
      setLoading(false);
    }
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
            onClick={() => {
              setIsLoginActive(true);
              setError(null);
              setMessage(null);
            }}
          >
            log in
            <span className={styles.underline}></span>
          </button>
          <form className={`${styles.form} ${styles.formLogin}`} onSubmit={handleLogin}>
            <fieldset>
              <legend>ソーシャルアカウントまたはメールアドレスでログイン</legend>
              <div className={styles.inputBlock}>
                <label htmlFor="login-email">メールアドレス</label>
                <input 
                  id="login-email" 
                  name="email"
                  type="email" 
                  required 
                  disabled={loading}
                />
              </div>
              <div className={styles.inputBlock}>
                <label htmlFor="login-password">パスワード</label>
                <input 
                  id="login-password" 
                  name="password"
                  type="password" 
                  required 
                  disabled={loading}
                />
              </div>
            </fieldset>
            <button 
              type="submit" 
              className={styles.btnLogin}
              disabled={loading}
            >
              {loading ? 'ログイン中...' : 'メールアドレスでログイン'}
            </button>
             
            <div className={styles.divider}>
              <span>または</span>
            </div>
            <div className={styles.socialLogin}>
              <AuthButton />
            </div>
          </form>
        </div>

        {/* Signup Form Wrapper */}
        <div className={`${styles.formWrapper} ${!isLoginActive ? styles.isActive : ''}`}>
          <button
            type="button"
            className={`${styles.switcher} ${styles.switcherSignup}`}
            onClick={() => {
              setIsLoginActive(false);
              setError(null);
              setMessage(null);
            }}
          >
            sign up
            <span className={styles.underline}></span>
          </button>
          <form className={`${styles.form} ${styles.formSignup}`} onSubmit={handleSignup}>
            <fieldset>
              <legend>メールアドレスでサインアップ</legend>
              <div className={styles.inputBlock}>
                <label htmlFor="signup-email">メールアドレス</label>
                <input 
                  id="signup-email" 
                  name="email"
                  type="email" 
                  required 
                  disabled={loading}
                />
              </div>
              <div className={styles.inputBlock}>
                <label htmlFor="signup-password">パスワード</label>
                <input 
                  id="signup-password" 
                  name="password"
                  type="password" 
                  required 
                  minLength={6}
                  disabled={loading}
                />
              </div>
              <div className={styles.inputBlock}>
                <label htmlFor="signup-password-confirm">パスワード（確認用）</label>
                <input 
                  id="signup-password-confirm" 
                  name="password-confirm"
                  type="password" 
                  required 
                  minLength={6}
                  disabled={loading}
                />
              </div>
            </fieldset>
            <button 
              type="submit" 
              className={styles.btnSignup}
              disabled={loading}
            >
              {loading ? 'サインアップ中...' : '続ける'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}