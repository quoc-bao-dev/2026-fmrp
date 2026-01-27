import React from 'react';
import Head from 'next/head';
import ApplicationLayout from './components/ApplicationLayout';

export default function Application(props) {
    return (
        <ApplicationLayout>
            <Head>
                <title>Ứng dụng</title>
            </Head>
            <div />
        </ApplicationLayout>
    );
}

