import { NextResponse } from 'next/server'
import { CookieCore } from './utils/lib/cookie';

export async function middleware(request, event) {
    const { pathname, origin, searchParams } = request.nextUrl;

    // Nhận token từ mobile qua query param và lưu vào cookie để các request sau dùng được
    // Ví dụ: /manufacture/productions-orders-mobile?token=...&x_api_key=...
    const tokenFromUrl = searchParams?.get('token');
    const apiKeyFromUrl = searchParams?.get('x_api_key') || searchParams?.get('databaseappFMRP') || searchParams?.get('api_key');

    const isMobileRoute = pathname.startsWith('/manufacture/productions-orders-mobile') || pathname.startsWith('/manufacture/production-plan-mobile') || pathname.startsWith('/piecework-wage/import-output-mobile');

    // Nếu là mobile route và có token/x-api-key từ URL:
    // - Nếu cookie còn thiếu thì set cookie
    // - KHÔNG return sớm, để middleware tiếp tục chạy bước authentication bên dưới
    if (isMobileRoute && (tokenFromUrl || apiKeyFromUrl)) {
        const hasTokenCookie = !!request.cookies.get('tokenFMRP')?.value;
        const hasApiKeyCookie = !!request.cookies.get('databaseappFMRP')?.value;

        if ((tokenFromUrl && !hasTokenCookie) || (apiKeyFromUrl && !hasApiKeyCookie)) {
            const res = NextResponse.next();

            if (tokenFromUrl && !hasTokenCookie) {
                res.cookies.set('tokenFMRP', tokenFromUrl, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                });
            }

            if (apiKeyFromUrl && !hasApiKeyCookie) {
                res.cookies.set('databaseappFMRP', apiKeyFromUrl, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                });
            }

            return res;
        }
    }

    // Ưu tiên dùng token/x-api-key từ query cho request hiện tại (lần đầu mở webview),
    // fallback về cookie cho các request sau.
    const tokenCookie = request.cookies.get("tokenFMRP") ?? ""
    const databaseCookie = request.cookies.get("databaseappFMRP") ?? ""

    const tokenValue = tokenFromUrl || tokenCookie?.value || "";
    const databaseValue = apiKeyFromUrl || databaseCookie?.value || "";

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api_web/Api_Authentication/authentication?csrf_protection=true`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokenValue}`,
                "x-api-key": databaseValue
            },
            signal: event.signal
        });

        const data = await response.json();
        if (data.isSuccess) {
            // return NextResponse.next();
            if ((!tokenValue || tokenValue == "") || (!databaseValue || databaseValue == "")) {
                if (
                    pathname.startsWith('/manufacture/productions-orders-mobile') ||
                    pathname.startsWith('/manufacture/production-plan-mobile') ||
                    pathname.startsWith('/piecework-wage/import-output-mobile')
                ) {
                    return NextResponse.next();
                }
                return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL_API_AUTH_LOGIN}`);
            } else {
                if (
                    pathname.startsWith('/manufacture/productions-orders-mobile') ||
                    pathname.startsWith('/manufacture/production-plan-mobile') ||
                    pathname.startsWith('/piecework-wage/import-output-mobile')
                ) {
                    return NextResponse.next();
                }
                if (pathname.startsWith("/auth")) {
                    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL_API_DASHBOARD}`);
                }
                return NextResponse.next();
            }
        } else {
            if (
                    pathname.startsWith('/manufacture/productions-orders-mobile') ||
                    pathname.startsWith('/manufacture/production-plan-mobile') ||
                    pathname.startsWith('/piecework-wage/import-output-mobile')
                ) {
                return NextResponse.next();
            }
            CookieCore.remove("tokenFMRP");
            CookieCore.remove("databaseappFMRP");
            // return NextResponse.redirect(new URL("/auth/login", request.url))
        }
    } catch (error) {
    }

    if (pathname.startsWith("/")) {
        if ((!tokenValue || tokenValue == "") || (!databaseValue || databaseValue == "")) {
            return NextResponse.next();
        } else {
            if (pathname.startsWith("/auth")) {
                return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL_API_DASHBOARD}`);
            }
            return NextResponse.next();
        }

    }
    return NextResponse.next();
}

export const config = {
    matcher: '/:path*',
}