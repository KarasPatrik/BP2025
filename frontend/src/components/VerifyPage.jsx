import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import http from '../lib/http';

export default function VerifyPage() {
    const [params] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const verify = async () => {
            try {
                const signedUrl = params.get('url');
                if (!signedUrl) return navigate('/');

                // Call Laravel backend via the original verification URL
                await http.get(signedUrl.replace('http://localhost:8080', ''));

                navigate('/verify-complete');
            } catch (err) {
                console.error('Verification failed:', err);
                navigate('/');
            }
        };

        verify();
    }, [navigate, params]);

    return <p>Verifying your email...</p>;
}