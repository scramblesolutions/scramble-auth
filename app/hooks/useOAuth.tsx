"use client";

import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import queryString from 'query-string';
import { useRouter } from 'next/navigation';

const AUTH_SERVER_URL = process.env.NEXT_PUBLIC_AUTH_SERVER_URL;
const tokenURL = `${AUTH_SERVER_URL}/token`;
const userInfoURL = `${AUTH_SERVER_URL}/userinfo`;
const redirect_uri = process.env.NEXT_PUBLIC_REDIRECT_URI;
const clientID =process.env.NEXT_PUBLIC_CLIENT_ID;
const clientSecret = process.env.NEXT_PUBLIC_CLIENT_SECRET;

type OAuthState = 'idle' | 'authorizing' | 'exchanging' | 'fetching_user_info' | 'refreshing_token' | 'completed' | 'error';

type UserInfo = {
    given_name: string;
    family_name: string;
    nickname: string;
    email: string;
    picture: string;
    profile: string;
    bio: string;
}

const useOAuth = () => {
    const router = useRouter();
    const [state, setState] = useState<OAuthState>('idle');
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Utility function to check if token has expired
    const isTokenExpired = () => {
        const expiration = localStorage.getItem('tokenExpiration');
        if (!expiration) return true; // If no expiration, assume expired

        const expirationTime = parseInt(expiration, 10);
        return Date.now() > expirationTime;
    };

    // Refresh Token
    const refreshToken = useCallback(async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const params = queryString.stringify({
            client_id: clientID,
            client_secret: clientSecret,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        });

        const response = await axios.post(tokenURL, params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const { access_token, refresh_token, expires_in } = response.data;

        localStorage.setItem('authToken', access_token);
        localStorage.setItem('refreshToken', refresh_token);
        localStorage.setItem('tokenExpiration', (Date.now() + expires_in * 1000).toString());

        return access_token;
    }, []);

    // Fetch User Info
    const fetchUserInfo = useCallback(async (accessToken: string) => {
        try {
            const userInfoResponse = await axios.get(userInfoURL, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            localStorage.setItem('userInfo', JSON.stringify(userInfoResponse.data));
            setUserInfo(userInfoResponse.data);
            setState('completed');
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                // Token might be expired, try to refresh
                setState('refreshing_token');
                try {
                    const newAccessToken = await refreshToken();
                    await fetchUserInfo(newAccessToken);
                } catch (refreshError) {
                    console.error('Error refreshing token:', refreshError);
                    setError('Session expired. Please log in again.');
                    setState('error');
                }
            } else {
                console.error('Error fetching user info:', error);
                setError('Failed to fetch user info.');
                setState('error');
            }
        }
    }, [refreshToken]);

    // Exchange Authorization Code for Access Token
    const exchangeCodeForToken = useCallback(async (code: string) => {
        // Check if token already exists and is not expired
        const existingToken = localStorage.getItem('authToken');
        if (existingToken && !isTokenExpired()) {
            // If token exists and not expired, fetch user info with existing token
            setState('fetching_user_info');
            await fetchUserInfo(existingToken);
            return;
        }

        // Otherwise, exchange authorization code for token
        const params = queryString.stringify({
            code,
            client_id: clientID,
            client_secret: clientSecret,
            redirect_uri,
            grant_type: 'authorization_code',
        });

        try {
            setState('exchanging');
            const tokenResponse = await axios.post(tokenURL, params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });

            const { access_token, refresh_token, expires_in } = tokenResponse.data;

            // Cache the token and its expiration time
            localStorage.setItem('authToken', access_token);
            localStorage.setItem('refreshToken', refresh_token);
            localStorage.setItem('tokenExpiration', (Date.now() + expires_in * 1000).toString());

            setState('fetching_user_info');
            await fetchUserInfo(access_token);
        } catch (error) {
            console.error('Error during token exchange:', error);
            setError('Failed to authenticate. Please try again.');
            setState('error');
        }
    }, [fetchUserInfo]);

    // Logout Function
    const logout = useCallback(() => {
        // Clear all authentication-related data
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpiration');
        localStorage.removeItem('userInfo');

        setUserInfo(null);
        setState('idle');

    
        // Alternatively, if no logout URL is available, redirect to login
        router.push('/login');
    }, [router]);

    // Login to OAuth (Initiates the Flow)
    const login = useCallback(() => {
        setState('authorizing');
        const params = queryString.stringify({
            client_id: clientID,
            redirect_uri,
            response_type: 'code',
            scope: 'openid profile email', // Ensure proper scopes are set
        });

        router.push(`${AUTH_SERVER_URL}/authorize?${params}`);
    }, [router]);

    useEffect(() => {
        // On component mount, check if there's an existing token
        const existingToken = localStorage.getItem('authToken');
        if (existingToken && !isTokenExpired()) {
            setState('fetching_user_info');
            fetchUserInfo(existingToken);
        }
    }, [fetchUserInfo]);

    return { state, userInfo, error, login, exchangeCodeForToken, logout };
};

export default useOAuth;
