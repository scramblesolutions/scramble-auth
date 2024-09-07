"use client";

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import useOAuth from '../hooks/useOAuth';

const CallbackPage = () => {
    const { state, error } = useOAuth();
    const router = useRouter();

    useEffect(() => {
        if (state === 'completed') {
            router.push('/user');
        }
    }, [state, router]);

    return (
        <Suspense fallback={<p>Loading...</p>}>
            <CallbackHandler />
            <div>
                {state === 'exchanging' && <p>Exchanging code for token...</p>}
                {state === 'fetching_user_info' && <p>Fetching user info...</p>}
                {error && <p>{error}</p>}
            </div>
        </Suspense>
    );
};

const CallbackHandler = () => {
    const { exchangeCodeForToken, state } = useOAuth();
    const searchParams = useSearchParams();

    useEffect(() => {
        const code = searchParams.get('code');
        if (code && state === 'idle') {
            exchangeCodeForToken(code);
        }
    }, [searchParams, exchangeCodeForToken, state]);

    return null;
};

export default CallbackPage;
