import React, { useEffect } from 'react';
import Head from 'next/head';
import ApplicationLayout from './components/ApplicationLayout';
import { useRouter } from 'next/router';
import { routerApplication } from '@/routers/application';

export default function Application(props) {
    const router = useRouter();

    useEffect(() => {
        // Mặc định vào /application sẽ trỏ về /application/all
        if (router.pathname === '/application') {
            router.replace(routerApplication.all);
        }
    }, [router.pathname]);

    return (
        <ApplicationLayout>
            <Head>
                <title>Ứng dụng</title>
            </Head>
            <div />
        </ApplicationLayout>
    );
}

