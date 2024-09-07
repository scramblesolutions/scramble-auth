"use client";

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import useOAuth from '../hooks/useOAuth';

const CallbackPage = () => {

    const { exchangeCodeForToken, state, error } = useOAuth();
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const code = searchParams.get('code');
        if (code) {
            exchangeCodeForToken(code);
        }
    }, [searchParams, exchangeCodeForToken]);


    useEffect(() => {
        if (state === 'completed') {
            router.push('/user');
        }
    }, [state, router]);

    return (
        <Suspense fallback={<p>Loading...</p>}>
            <div>
                {state === 'exchanging' && <p>Exchanging code for token...</p>}
                {state === 'fetching_user_info' && <p>Fetching user info...</p>}
                {error && <p>{error}</p>}
            </div>
        </Suspense>
    );
};

export default CallbackPage;
