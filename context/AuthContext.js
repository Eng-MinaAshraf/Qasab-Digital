'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSupabaseBrowserClient } from '../lib/supabase/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  /**
   * جلب الملف الشخصي للمستخدم من جدول public.profiles
   * مع حظر إنشاء أي سجل للمستخدم في قاعدة البيانات حتى يتم تأكيد الـ OTP بنجاح
   */
  const loadUserProfile = useCallback(async (userId, userEmail, userMeta = {}, isConfirmed = false) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !userId) {
      setLoading(false);
      return null;
    }

    try {
      // 1. محاولة الاستعلام من جدول profiles (المعتمد رسمياً)
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileData && !profileErr) {
        setProfile(profileData);
        return profileData;
      }

      // 2. إذا لم يكن الحساب مؤكداً بعد بالـ OTP، لا ننشئ أي سجل في قاعدة البيانات إطلاقاً
      if (!isConfirmed) {
        setLoading(false);
        return null;
      }

      // 3. إذا كان مؤكداً، التحقق من جدول users المتوافق
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (userData) {
        const fallbackProfile = {
          id: userId,
          full_name: userData.full_name || userMeta.full_name || '',
          phone: userData.phone || userMeta.phone || '',
          account_type: 'customer',
          role: userData.role || 'customer',
          avatar_url: null,
          created_at: userData.created_at || new Date().toISOString(),
        };
        setProfile(fallbackProfile);
        return fallbackProfile;
      }

      // 4. إنشاء ملف مبدئي آمن فقط بعد التأكيد بالـ OTP
      const defaultRole = (userEmail === 'admin@qasab.eg' || userEmail === 'qasab.digital@gmail.com')
        ? 'admin'
        : 'customer';

      const initialProfile = {
        id: userId,
        full_name: userMeta.full_name || userMeta.name || userEmail?.split('@')[0] || 'عميل قصب',
        phone: userMeta.phone || '',
        account_type: userMeta.account_type === 'vendor' ? 'vendor_pending' : 'customer',
        role: defaultRole,
        avatar_url: userMeta.avatar_url || null,
        created_at: new Date().toISOString(),
      };

      try {
        await supabase.from('profiles').upsert(initialProfile);
      } catch (upsertErr) {
        console.warn('Silent profile upsert fallback:', upsertErr?.message);
      }

      setProfile(initialProfile);
      return initialProfile;
    } catch (err) {
      console.warn('Error loading user profile:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // تهيئة ومراقبة حالة الجلسة عبر Supabase Auth
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setLoading(false);
      return;
    }

    // استرجاع الجلسة الأولية
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const isConfirmed = !!(session.user.email_confirmed_at || session.user.confirmed_at);
        setUser(session.user);
        loadUserProfile(session.user.id, session.user.email, session.user.user_metadata, isConfirmed);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    // الاستماع لأي تغييرات في حالة المصادقة (دخول، خروج، تجديد التوكن، تأكيد البريد)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const isConfirmed = !!(session.user.email_confirmed_at || session.user.confirmed_at);
        setUser(session.user);
        await loadUserProfile(session.user.id, session.user.email, session.user.user_metadata, isConfirmed);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [loadUserProfile]);

  /**
   * 1. تسجيل الدخول عبر البريد الإلكتروني وكلمة المرور (Supabase Auth)
   */
  const signInWithPassword = useCallback(async ({ email, password }) => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return { success: false, error: 'خدمة المصادقة غير مهيأة حالياً' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      let friendlyMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      if (error.message.toLowerCase().includes('email not confirmed')) {
        friendlyMessage = 'يرجى تأكيد بريدك الإلكتروني أولاً عبر الرابط أو رمز التحقق المرسل إليك.';
      } else if (error.message.toLowerCase().includes('rate limit')) {
        friendlyMessage = 'المحاولات كثيرة حالياً. يرجى الانتظار بضع دقائق والمحاولة مجدداً.';
      }
      setAuthError(friendlyMessage);
      return { success: false, error: friendlyMessage, rawError: error };
    }

    setUser(data.user);
    if (data.user) {
      const isConfirmed = !!(data.user.email_confirmed_at || data.user.confirmed_at);
      await loadUserProfile(data.user.id, data.user.email, data.user.user_metadata, isConfirmed);
    }

    return { success: true, user: data.user, session: data.session };
  }, [loadUserProfile]);

  /**
   * 2. إنشاء حساب جديد مع البيانات الشخصية (Supabase Auth)
   * مع حماية عدم تصعيد الصلاحيات (Zero Trust)
   */
  const signUp = useCallback(async ({ email, password, full_name, phone, account_type = 'customer' }) => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone ? phone.trim() : '';
    const cleanName = full_name ? full_name.trim() : '';
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return { success: false, error: 'خدمة المصادقة غير متصلة' };
    }

    // الأمان: حساب البائع يتحول تلقائياً إلى vendor_pending بانتظار مراجعة الإدارة
    const safeAccountType = account_type === 'vendor' ? 'vendor' : 'customer';

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanName,
          phone: cleanPhone,
          account_type: safeAccountType,
          // role يتم تجاهله في التريجر ويُعيّن customer دائماً
        },
      },
    });

    if (error) {
      let friendlyMessage = error.message;
      if (error.message.toLowerCase().includes('already registered')) {
        friendlyMessage = 'هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول.';
      } else if (error.message.toLowerCase().includes('password')) {
        friendlyMessage = 'كلمة المرور لا تستوفي الشروط الأمنية (يجب أن تكون 6 خانات على الأقل).';
      }
      setAuthError(friendlyMessage);
      return { success: false, error: friendlyMessage };
    }

    const needsEmailVerification = !data.session && !!data.user;

    return {
      success: true,
      user: data.user,
      session: data.session,
      needsEmailVerification,
    };
  }, []);

  /**
   * 3. إرسال رمز OTP لتسجيل الدخول الفوري بدون كلمة مرور (Supabase Auth)
   */
  const signInWithOtp = useCallback(async (email) => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return { success: false, error: 'خدمة المصادقة غير مهيأة' };
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      let msg = error.message;
      if (error.message.toLowerCase().includes('rate limit')) {
        msg = 'تم تجاوز الحد المسموح لإرسال الرموز مؤقتاً لحماية أمان الحساب. يرجى الانتظار دقيقة والمحاولة مجدداً.';
      }
      setAuthError(msg);
      return { success: false, error: msg };
    }

    return { success: true, message: 'تم إرسال رمز التأكيد (OTP) إلى بريدك بنجاح' };
  }, []);

  /**
   * 4. التحقق من كود الـ OTP (Supabase Auth)
   */
  const verifyOtp = useCallback(async (email, token, type = 'email') => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = token.trim();
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return { success: false, error: 'خدمة المصادقة غير متصلة' };
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type,
    });

    if (error) {
      const msg = 'رمز التأكيد غير صحيح أو منتهي الصلاحية';
      setAuthError(msg);
      return { success: false, error: msg };
    }

    setUser(data.user);
    if (data.user) {
      await loadUserProfile(data.user.id, data.user.email, data.user.user_metadata, true);
    }

    return { success: true, user: data.user, session: data.session };
  }, [loadUserProfile]);

  /**
   * 5. استعادة كلمة المرور مع التحقق المسبق من وجود البريد في قاعدة البيانات
   */
  const resetPasswordForEmail = useCallback(async (email) => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return { success: false, error: 'خدمة المصادقة غير مهيأة' };
    }

    // 1. التحقق الفعلي من وجود البريد في قاعدة البيانات عبر الدالة الموثقة
    try {
      const { data: exists, error: rpcError } = await supabase.rpc('check_email_exists', {
        lookup_email: cleanEmail,
      });

      if (!rpcError && exists === false) {
        const notFoundMsg = 'هذا البريد الإلكتروني غير مسجل لدينا في قصب. يرجى التأكد من كتابة البريد بشكل صحيح أو إنشاء حساب جديد.';
        setAuthError(notFoundMsg);
        return {
          success: false,
          notFound: true,
          error: notFoundMsg,
        };
      }
    } catch (checkErr) {
      console.warn('Email existence check fallback:', checkErr);
    }

    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/reset-password`
      : 'https://qasab.eg/reset-password';

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl,
      });

      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }
    } catch (e) {
      return { success: false, error: 'تعذر إرسال رابط الاستعادة، يرجى المحاولة لاحقاً' };
    }

    return {
      success: true,
      message: 'تم التحقق من حسابك وإرسال رابط استعادة كلمة المرور بنجاح إلى بريدك الإلكتروني.',
    };
  }, []);

  /**
   * 6. تعيين وتحديث كلمة المرور الجديدة (Supabase Auth)
   */
  const updatePassword = useCallback(async (newPassword) => {
    setAuthError(null);
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return { success: false, error: 'خدمة المصادقة غير مهيأة' };
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setAuthError(error.message);
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
  }, []);

  /**
   * 7. تسجيل الخروج الآمن (Supabase Auth signOut)
   */
  const signOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Error during signout:', err);
      }
    }
    setUser(null);
    setProfile(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }, []);

  // الأدوار المحسوبة بأمان
  const isAdmin =
    profile?.role === 'admin' ||
    user?.app_metadata?.role === 'admin' ||
    user?.email === 'admin@qasab.eg' ||
    user?.email === 'qasab.digital@gmail.com' ||
    user?.email === 'engminaashraf019@gmail.com';

  const isVendor = profile?.account_type === 'vendor';
  const isVendorPending = profile?.account_type === 'vendor_pending';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        isVendor,
        isVendorPending,
        loading,
        authError,
        signInWithPassword,
        signUp,
        signInWithOtp,
        verifyOtp,
        resetPasswordForEmail,
        updatePassword,
        signOut,
        loadUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
