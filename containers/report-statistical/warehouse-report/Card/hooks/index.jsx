"use client";
import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, CheckCircle2, FlaskConical, HeartHandshake, Layers3, Lock, Package, Ship, TrendingUp, Users, ShieldCheck, Zap, Globe, GitCommit, Target, Coins } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from "recharts";

/***** Interactive Background Component (with mouse interaction) *****/
const InteractiveBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles = [];
    let resizeTimer = 0;
    let rafId = 0;
    const mouse = {
      x: null,
      y: null,
      radius: 150
    };

    const handleMouseMove = (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    };

    const handleMouseLeave = () => {
        mouse.x = null;
        mouse.y = null;
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);


    const MAX_PARTICLES = 150;
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = 1;
        this.speedX = (Math.random() * 2 - 1) * 0.5;
        this.speedY = (Math.random() * 2 - 1) * 0.5;
      }
      update() {
        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
        this.x += this.speedX;
        this.y += this.speedY;
      }
      draw() {
        ctx.fillStyle = "rgba(107,114,128,0.8)";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      if (canvas.width > 0 && canvas.height > 0) {
        const numberOfParticles = Math.min(
          MAX_PARTICLES,
          Math.floor((canvas.width * canvas.height) / 9000)
        );
        for (let i = 0; i < numberOfParticles; i++) particles.push(new Particle());
      }
    };

    const connect = () => {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.hypot(dx, dy);
          if (distance < 120) {
            const opacityValue = 1 - distance / 120;
            ctx.strokeStyle = `rgba(107,114,128,${opacityValue})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }

      if (mouse.x != null && mouse.y != null) {
        particles.forEach(p => {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distance = Math.hypot(dx, dy);
          if (distance < mouse.radius) {
            const opacityValue = 1 - (distance / mouse.radius);
            ctx.strokeStyle = `rgba(59, 130, 246, ${opacityValue})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      connect();
      rafId = requestAnimationFrame(animate);
    };

    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        setCanvasSize();
        init();
      }, 150);
    };

    const ro = new ResizeObserver(() => onResize());
    ro.observe(document.documentElement);

    setCanvasSize();
    init();
    if (!prefersReduced) animate();

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.clearTimeout(resizeTimer);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};

/***** Minimal UI primitives (Tailwind-based) *****/
const Container = ({ children, className = "" }) => (
  <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
);

const Section = ({ id, className = "", children }) => (
  <section id={id} className={`py-16 sm:py-20 relative overflow-hidden ${className}`}>{children}</section>
);

const Card = ({ title, icon, children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)" }}
    transition={{ duration: 0.3 }}
    className={`rounded-2xl border border-gray-700 bg-gray-800/60 backdrop-blur-md shadow-lg p-6 h-full ${className}`}
  >
    {title || icon ? (
      <div className="flex items-center gap-3 mb-3">
        {icon ? <div className="p-2 rounded-xl bg-gray-700">{icon}</div> : null}
        {title ? <h3 className="text-lg font-semibold text-white">{title}</h3> : null}
      </div>
    ) : null}
    <div className="text-gray-300 text-sm leading-relaxed">{children}</div>
  </motion.div>
);

const Button = ({ children, variant = "primary", href, className = "", onClick }) => {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900";
  const styles = {
    primary: "bg-blue-500 text-white hover:bg-blue-400 focus:ring-blue-500",
    ghost: "bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white focus:ring-gray-600",
    outline: "border border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white",
  };
  const Comp = href ? "a" : "button";
  return (
    <Comp href={href} onClick={onClick} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </Comp>
  );
};

const Badge = ({ children }) => (
  <span className="inline-block rounded-full bg-blue-500/90 text-white text-xs px-3 py-1">{children}</span>
);

/***** Mock data for Trust Link radar chart *****/
const trustData = [
  { metric: "Ingredient Transparency", score: 92 },
  { metric: "Efficacy Evidence", score: 86 },
  { metric: "Price Fairness", score: 81 },
  { metric: "Review Integrity", score: 88 },
  { metric: "Logistics Reliability", score: 84 },
];

/***** Whitepaper Modal Component with full content and YouTube link *****/
const WhitepaperModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
  
    const SectionTitle = ({ children }) => <h3 className="text-xl font-bold text-white mb-3 mt-6 border-b border-gray-600 pb-2">{children}</h3>;
    const SubTitle = ({ children }) => <h4 className="text-md font-semibold text-blue-300 mb-2 mt-4">{children}</h4>;


    return (
        <AnimatePresence>
            {isOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    aria-labelledby="whitepaper-title"
                    role="dialog"
                    aria-modal="true"
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={onClose}
                    />
        
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="relative w-full max-w-4xl max-h-[90vh] bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl flex flex-col"
                    >
                        <header className="flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 bg-gray-800/80 backdrop-blur-sm z-10">
                            <h2 id="whitepaper-title" className="text-xl font-bold text-white">Beauty 3.0 White Paper</h2>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white transition"
                                aria-label="Close"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </header>
        
                        <main className="p-6 overflow-y-auto text-gray-300 text-sm leading-relaxed space-y-4">
                            <div className="text-center mb-4">
                                <h1 className="text-2xl font-bold text-white">Beauty 3.0 White Paper</h1>
                                <p className="text-md text-gray-400">신뢰와 참여로 구축하는 윤리적 뷰티 생태계</p>
                            </div>

                            <section>
                                <SectionTitle>0. Executive Summary</SectionTitle>
                                <p>뷰티 1.0(브랜드/유통 중심)과 2.0(플랫폼/인플루언서 중심)은 허위·과장 정보, 후기 어뷰징, 불투명한 수익 분배라는 구조적 한계를 남겼습니다. Beauty 3.0은 데이터·참여·투명성을 축으로 신뢰를 복원하고, 기여한 모든 주체에게 공정 보상(Fair Loop) 을 제공하는 새로운 질서입니다.</p>
                                <p className="mt-2">본 백서는 다음 3요소로 이루어진 상생 운영체제(OS) 를 제시합니다.</p>
                                <ul className="list-disc list-inside mt-2 space-y-1 pl-2">
                                    <li><strong>M4U:</strong> 체험·리뷰 커머스 허브(시장성 데이터 수집)</li>
                                    <li><strong>HaruBeauty:</strong> 15분 웰니스 루틴을 중심으로 한 온/오프 통합 성장 사다리</li>
                                    <li><strong>TrustLink:</strong> 가격·성분·윤리·정산을 투명화하는 신뢰 인프라(ECI·PBA)</li>
                                </ul>
                                <p className="mt-2">보상은 HARU(참여 보상/오프체인) 와 TRU(정산·거버넌스/온체인 준비) 의 음양 균형으로 설계됩니다.</p>
                            </section>
                            
                            <section>
                                <SubTitle>소개 영상</SubTitle>
                                <p className="mb-4">Beauty 3.0에 대한 자세한 소개를 영상으로 만나보세요.</p>
                                <a href="https://www.youtube.com/watch?v=TY53fl6L9TM" target="_blank" rel="noopener noreferrer" className="relative block aspect-video w-full rounded-lg overflow-hidden border border-gray-700 group">
                                    <img
                                        src="https://img.youtube.com/vi/TY53fl6L9TM/hqdefault.jpg"
                                        alt="Beauty 3.0 Introduction Video Thumbnail"
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                                        <svg className="w-16 h-16 text-white/80" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </a>
                            </section>

                            <section>
                                <SectionTitle>1. 문제 정의: 신뢰의 붕괴와 불공정 분배</SectionTitle>
                                <ul className="list-disc list-inside mt-2 space-y-1 pl-2">
                                    <li><strong>소비자:</strong> 조작·과장된 후기와 불투명한 정보로 신뢰 상실</li>
                                    <li><strong>브랜드(특히 인디):</strong> 높은 CAC, 파편화된 채널, 파트너십 불균형</li>
                                    <li><strong>생태계:</strong> 수익이 플랫폼/중개에 집중, 기여자 보상 미흡</li>
                                </ul>
                                 <p className="mt-2 font-semibold">핵심 질문: ① 무엇을 신뢰할 것인가? ② 누가 어떤 가치를 만들었고, 어떻게 보상할 것인가?</p>
                            </section>

                            <section>
                                <SectionTitle>2. 철학: 음양(陰陽)·오행(五行)의 상생</SectionTitle>
                                <ul className="list-disc list-inside mt-2 space-y-1 pl-2">
                                  <li><strong>陽 – HARU / M4U:</strong> 참여·확산·에너지(외향 활동)</li>
                                  <li><strong>陰 – TRU / TrustLink:</strong> 신뢰·안정·정산(보이지 않는 인프라)</li>
                                </ul>
                                 <p className="mt-2"><strong>오행 순환 모델:</strong> 木(브랜드 씨앗) → 火(참여·확산) → 土(신뢰의 토대) → 金(가치·정산) → 水(재투자·확장) → 木…</p>
                                 <p className="mt-2 font-semibold">결론: 에너지(陽)가 신뢰(陰)에 뿌리내릴 때 성장은 지속 가능해집니다.</p>
                            </section>

                            <section>
                                <SectionTitle>3. 생태계 구성(상생 OS)</SectionTitle>
                                <SubTitle>3.1 M4U — Experience & Market Proof</SubTitle>
                                <p><strong>역할:</strong> 체험·리뷰 커머스 허브, 시장성(PMF) 데이터 생성</p>
                                <ul className="list-disc list-inside mt-2 space-y-1 pl-2">
                                    <li><strong>체험단 운영(온라인/오프라인) 및 리뷰 작성</strong></li>
                                    <li><strong>리뷰 성실도 엔진:</strong> 메타/유사·표절/이미지EXIF/세션시간/구매연동 검증 → Quality Score</li>
                                    <li><strong>레퍼럴 트래킹(R0/네트워크 확산도)</strong></li>
                                    <li><strong>HARU 코인(오프체인) 보상</strong> — 참여·리뷰·레퍼럴</li>
                                </ul>
                                <p className="mt-1"><strong>주요 지표:</strong> Trial→Review→Purchase 전환율, 재구매 의향, 리뷰 성실도, 레퍼럴 확산지수</p>

                                <SubTitle>3.2 HaruBeauty — Wellness & Growth (Omnichannel)</SubTitle>
                                <p><strong>역할:</strong> 지속 참여·성장을 만드는 웰니스 커뮤니티/거점</p>
                                 <ul className="list-disc list-inside mt-2 space-y-1 pl-2">
                                    <li><strong>15분 루틴 챌린지</strong>(마스크팩+명상/피트니스/스킨룩 기록) → HARU 보상</li>
                                    <li><strong>온/오프 결제·예약:</strong> 제휴 뷰티샵·체험존·방문 뷰티</li>
                                    <li><strong>성장 사다리:</strong> User → Seller → Beauty Consultant → Leader</li>
                                    <li><strong>포용적 성장:</strong> 싱글맘/경력여성 교육·매칭(방문 뷰티·협동조합 모델)</li>
                                </ul>
                                 <p className="mt-1"><strong>주요 지표:</strong> 루틴 완주율, 오프라인 전환율, 셀러·컨설턴트 활성도, 커뮤니티 유지율</p>

                                <SubTitle>3.3 TrustLink — Trust Infrastructure</SubTitle>
                                 <p><strong>역할:</strong> 가격·성분·윤리·정산의 투명 레이어</p>
                                <ul className="list-disc list-inside mt-2 space-y-1 pl-2">
                                    <li><strong>Price Transparency:</strong> 원가·마케팅·리워드·정산 구조 오픈뷰</li>
                                    <li><strong>Ingredient Transparency:</strong> INCI·함량·원산지·MSDS·비건/FSC/소이잉크 등 인증</li>
                                    <li><strong>ECI (Ethical Contribution Index):</strong> 유통 윤리, 생산 윤리, 정보 투명성, 사회적 기여, 파트너 보상 공정성 → 가중합 점수로 시각화</li>
                                    <li><strong>PBA (Partnership-Based Accreditation):</strong> PBA = f(ECI, M4U 성과, ESG 준수, 소비자 만족) → A/B/C/D 등급</li>
                                    <li><strong>정산 레이어:</strong> B2B 거래는 TRU 코인(온체인 준비) + 스마트컨트랙트로 즉시·투명 정산(법인 KYC)</li>
                                </ul>
                                <p className="mt-1"><strong>주요 지표:</strong> ECI, PBA 등급, 가격 수용도, 성분 신뢰도, 분쟁/반품율</p>
                            </section>

                            <section>
                                <SectionTitle>4. 토큰 & 보상 체계</SectionTitle>
                                <div className="overflow-x-auto mt-2">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-700/50">
                                                <th className="p-2 border border-gray-600">항목</th>
                                                <th className="p-2 border border-gray-600">HARU</th>
                                                <th className="p-2 border border-gray-600">TRU</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="p-2 border border-gray-600 font-semibold">레이어</td>
                                                <td className="p-2 border border-gray-600">오프체인(앱 경제)</td>
                                                <td className="p-2 border border-gray-600">온체인(정산·거버넌스)</td>
                                            </tr>
                                            <tr className="bg-gray-900/50">
                                                <td className="p-2 border border-gray-600 font-semibold">역할</td>
                                                <td className="p-2 border border-gray-600">참여·리뷰·레퍼럴 보상(陽)</td>
                                                <td className="p-2 border border-gray-600">B2B 정산·상생 펀드·DAO 투표(陰)</td>
                                            </tr>
                                            <tr>
                                                <td className="p-2 border border-gray-600 font-semibold">사용</td>
                                                <td className="p-2 border border-gray-600">루틴/체험/콘텐츠 보상·쿠폰</td>
                                                <td className="p-2 border border-gray-600">파트너 정산·인센티브·펀드 집행</td>
                                            </tr>
                                             <tr className="bg-gray-900/50">
                                                <td className="p-2 border border-gray-600 font-semibold">가치 연결</td>
                                                <td className="p-2 border border-gray-600">활동 데이터 기반</td>
                                                <td className="p-2 border border-gray-600">TrustLink 검증 데이터 기반</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p className="mt-2"><strong>Fair Loop(선순환):</strong> 수익·수수료 일부 + 참여 보상의 일부 → 상생 펀드(TRU) 적립 → 신규 브랜드 테스트/교육/기부로 재투자</p>
                            </section>
                             
                            <section>
                                <SectionTitle>5. ROI & 투명성 대시보드(브랜드)</SectionTitle>
                                <ul className="list-disc list-inside mt-2 space-y-1 pl-2">
                                    <li><strong>실시간 퍼널:</strong> Trial → Review → Purchase CR → Retention → LTV</li>
                                    <li><strong>비용·효율:</strong> CAC(리워드 포함 순비용), ROAS/ROI, Cohort 잔존</li>
                                    <li><strong>신뢰 시각화:</strong> 성분 신뢰, 가격 수용도, ECI/PBA 상태</li>
                                    <li><strong>예시 규칙:</strong> ECI = Σ(지표i × 가중치i), PBA 등급 = f(ECI, M4U 성과, ESG), ROI = (증분매출 – (리워드+수수료+물류)) ÷ 리워드</li>
                                </ul>
                            </section>

                             <section>
                                <SectionTitle>6. 기술 아키텍처(개요)</SectionTitle>
                                 <ul className="list-disc list-inside mt-2 space-y-1 pl-2">
                                     <li><strong>앱/웹 레이어:</strong> React/Next.js, 모바일 우선, i18n(EN/KR/VI)</li>
                                     <li><strong>데이터 레이어:</strong> 이벤트 스트리밍(Kafka 등) → 데이터 버즈/웨어하우스</li>
                                     <li><strong>검증 엔진:</strong> 리뷰 성실도(중복/표절/세션/이미지/구매연동)·이상탐지</li>
                                     <li><strong>TrustLink API:</strong> 가격/성분/ECI·PBA/정산 모듈 오픈 API</li>
                                     <li><strong>정산 레이어:</strong> TRU 정산(법인 KYC), 스마트컨트랙트(거버넌스/펀드)</li>
                                 </ul>
                            </section>
                            
                            <section>
                                <SectionTitle>7. 개인정보·규제 준수</SectionTitle>
                                 <ul className="list-disc list-inside mt-2 space-y-1 pl-2">
                                     <li>개인정보 최소 수집·가명처리·목적 제한·보관기간 정책</li>
                                     <li>KYC/AML: 정산·DAO 의사결정은 법인/승인 사용자 한정</li>
                                     <li>지역 규제: 국가별 화장품/전자상거래/데이터 이전 규정 준수</li>
                                     <li>광고 표시: 체험/협찬/보상 시 명확한 라벨링 표준 적용</li>
                                 </ul>
                            </section>

                            <section>
                                <SectionTitle>8. 생태계 거버넌스(DAO 지향)</SectionTitle>
                                 <ul className="list-disc list-inside mt-2 space-y-1 pl-2">
                                     <li><strong>참여:</strong> 제안 → 토론 → 투표 → 집행(온/오프체인 혼합)</li>
                                     <li><strong>지표 기반 의사결정:</strong> M4U·TrustLink 실적을 근거로 펀드 배분</li>
                                     <li><strong>투명성:</strong> 펀드 적립/집행·PBA/ECI 변경 이력 공개(감사 로그)</li>
                                 </ul>
                            </section>

                             <section>
                                <SectionTitle>9. 사회적 가치 & 포용적 성장</SectionTitle>
                                 <ul className="list-disc list-inside mt-2 space-y-1 pl-2">
                                    <li>싱글맘/경력여성 교육·매칭(방문 뷰티, 커뮤니티 리더)</li>
                                    <li>포용적 뷰티: 피부톤/연령/성별을 초월한 접근성</li>
                                    <li>투명 기부: 상생 펀드 집행 내역 공개, 영향 측정(임팩트 리포트)</li>
                                 </ul>
                            </section>

                             <section>
                                <SectionTitle>10. 로드맵(요약)</SectionTitle>
                                 <ul className="list-disc list-inside mt-2 space-y-1 pl-2">
                                    <li><strong>Phase 1:</strong> M4U 리뷰 성실도·레퍼럴, HaruBeauty 15분 루틴, TrustLink v1(가격/성분)</li>
                                    <li><strong>Phase 2:</strong> ECI 계산·PBA 발급, 오프라인 결제·예약, 상생 펀드 가동</li>
                                    <li><strong>Phase 3:</strong> TRU 정산·DAO 투표, 다국가 확장(EN/VI/JP), 온/오프 융합 캠페인</li>
                                 </ul>
                            </section>
                             <section>
                                <SectionTitle>11. 핵심 지표(KPI)</SectionTitle>
                                 <ul className="list-disc list-inside mt-2 space-y-1 pl-2">
                                    <li><strong>신뢰:</strong> ECI/PBA 분포, 성분 신뢰·가격 수용도, 분쟁율</li>
                                    <li><strong>성장:</strong> Trial→Purchase CR, 루틴 완주율, 재구매/잔존, 레퍼럴 R0</li>
                                    <li><strong>수익:</strong> CAC/LTV, ROI, 오프라인 전환율, 상생 펀드 유입/집행</li>
                                 </ul>
                            </section>

                             <section>
                                <SectionTitle>12. 용어 정의(Glossary)</SectionTitle>
                                 <ul className="list-disc list-inside mt-2 space-y-1 pl-2">
                                    <li><strong>ECI (Ethical Contribution Index):</strong> 유통·생산·정보·사회 기여·보상 공정성 기반 윤리 지수</li>
                                    <li><strong>PBA (Partnership-Based Accreditation):</strong> ECI·성과·ESG를 반영한 파트너 신뢰 등급</li>
                                    <li><strong>HARU:</strong> 오프체인 참여 보상 토큰(陽)</li>
                                    <li><strong>TRU:</strong> 온체인 정산·거버넌스 토큰(陰)</li>
                                    <li><strong>Fair Loop:</strong> 수익과 보상이 생태계로 재순환되는 구조</li>
                                    <li><strong>Growth Ladder:</strong> User → Seller → Consultant → Leader</li>
                                 </ul>
                            </section>

                             <section>
                                <SectionTitle>결론</SectionTitle>
                                <p>Beauty 3.0은 “광고보다 데이터, 수수료보다 공정 보상, 상품보다 공동체”를 선택합니다.</p>
                                <p className="mt-2">M4U–HaruBeauty–TrustLink가 만드는 상생 OS 위에서, HARU(陽) 와 TRU(陰) 의 균형은 신뢰와 성장을 동시에 견인합니다.</p>
                                <p className="mt-2 font-semibold">이 백서는 신뢰를 설계하고, 보상을 표준화하며, 성장을 포용하는 차세대 윤리 뷰티 생태계의 기술·운영·거버넌스 기준입니다.</p>
                            </section>

                        </main>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};


/***** Header with Scroll Effect & Mobile Nav (a11y improved) *****/
const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "unset";
  }, [isMenuOpen]);

  const navLinks = [
    { href: "#intro", text: "Why Beauty 3.0?" },
    { href: "#ecosystem", text: "Ecosystem" },
    { href: "#trust", text: "Trustlink" },
    { href: "#logistics", text: "Logistics" },
    { href: "#social", text: "Social Value" },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full bg-gray-900/80 backdrop-blur-md transition-shadow ${
          scrolled ? "shadow-lg shadow-black/20 border-transparent" : "border-b border-gray-700"
        }`}
        role="banner"
      >
        <Container>
          <div className="flex h-16 items-center justify-between">
            <a href="#home" className="flex items-center gap-2" aria-label="Go to home">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400" />
              <span className="font-extrabold tracking-tight text-white">ROMANA</span>
            </a>
            <nav className="hidden md:flex items-center gap-6 text-sm text-gray-300" aria-label="Primary">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="hover:text-white">
                  {link.text}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-1 md:gap-3">
              <Button variant="ghost" href="#partner" className="hidden sm:inline-flex">
                For Partners
              </Button>
              <Button href="#get-started">Get Started</Button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-md hover:bg-gray-800"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
              </button>
            </div>
          </div>
        </Container>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900/90 backdrop-blur-sm md:hidden" role="dialog" aria-modal="true">
          <div className="flex justify-end p-4">
            <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-md hover:bg-gray-800" aria-label="Close menu">
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <nav className="flex flex-col items-center justify-center gap-6 mt-16 text-lg" aria-label="Mobile">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-white py-2">
                {link.text}
              </a>
            ))}
            <div className="mt-8 border-t border-gray-700 w-4/5 pt-8 flex flex-col items-center gap-4">
              <Button variant="outline" href="#partner" onClick={() => setIsMenuOpen(false)}>
                For Partners
              </Button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
};

/***** Hero Component *****/
const Hero = ({ onOpenWhitepaper }) => (
  <Section id="home" className="pt-10 sm:pt-16">
    <Container className="relative z-10">
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Badge>A Vision of Co-Prosperity</Badge>
          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            팍스 로마나를 넘어, <span className="bg-gradient-to-r from-blue-400 to-teal-300 bg-clip-text text-transparent">상생의 제국으로</span>
          </h1>
          <p className="mt-4 text-gray-300 leading-relaxed">
            저희의 시작은 '로마나(Romana)'라는 이름, 그리고 평화와 번영의 시대 '팍스 로마나(Pax Romana)'의 비전이었습니다. 로마가 도로와 법률이라는 인프라와 표준으로 전례 없는 번영을 이끌었듯, 우리는 데이터(Trustlink)와 참여(M4U)라는 새로운 길을 열어 K-뷰티 시장의 신뢰를 구축합니다. '로마나'가 꿈꾼 상생의 제국은 이제 모든 참여자가 주인이 되는 Beauty 3.0 생태계를 통해 현실이 됩니다.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="#ecosystem">생태계 참여하기</Button>
            <Button variant="outline" onClick={onOpenWhitepaper}>뷰티3.0 백서</Button>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
          className="relative aspect-[4/3] w-full rounded-3xl border border-gray-700 bg-gray-800/60 backdrop-blur-md shadow-2xl shadow-black/20 overflow-hidden p-6"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(60,130,255,0.1),transparent_40%),radial-gradient(circle_at_70%_80%,rgba(60,200,200,0.1),transparent_35%)]" />
          <div className="relative z-10 flex flex-col justify-center h-full text-center">
            <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-blue-400 to-teal-300 bg-clip-text text-transparent">ROMANA</h2>
            <p className="text-gray-400 mt-2">The Co-Prosperity Empire</p>
            <div className="mt-4 text-sm text-gray-400 flex justify-center items-center gap-2 sm:gap-4">
              <span>
                Beauty 1.0 <br />
                (Brand-centric)
              </span>
              <span className="text-blue-400">&rarr;</span>
              <span>
                Beauty 2.0 <br />
                (Influencer-centric)
              </span>
              <span className="text-blue-400">&rarr;</span>
              <span className="text-white font-bold">
                Beauty 3.0 <br />
                (Participant-centric)
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </Container>
  </Section>
);

/***** Intro: Why Beauty 3.0? *****/
const Intro = () => (
  <Section id="intro">
    <Container>
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">왜 Beauty 3.0인가?</h2>
        <p className="mt-4 text-lg text-gray-400">
          지난 10년간 뷰티 산업의 화려한 성장 이면에는 깊은 그림자가 있었습니다. 막대한 마케팅 비용, 진정성 잃은 후기들 속에서 소비자는 '신뢰의 위기'를 맞았습니다. Beauty 3.0은 이 위기 속에서 탄생한 필연적인 흐름입니다.
        </p>
      </div>
      <div className="mt-12 overflow-x-auto" role="region" aria-label="Beauty eras comparison table">
        <table className="w-full min-w-max text-left border-collapse">
          <thead>
            <tr>
              <th className="p-4 border-b border-gray-700 text-sm font-semibold text-white">시대 키워드</th>
              <th className="p-4 border-b border-gray-700 text-sm font-semibold text-white">특징</th>
              <th className="p-4 border-b border-gray-700 text-sm font-semibold text-white">한계 및 문제점</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-400">
            <tr className="bg-gray-800/30">
              <td className="p-4 font-bold">Beauty 1.0: 브랜드 중심</td>
              <td className="p-4">대규모 광고, 대형 유통 채널</td>
              <td className="p-4">허위·과장 정보, 소비자와의 불통, 신뢰 붕괴</td>
            </tr>
            <tr>
              <td className="p-4 font-bold">Beauty 2.0: 인플루언서 중심</td>
              <td className="p-4">SNS·MCN 기반의 리뷰 콘텐츠 확산</td>
              <td className="p-4">신뢰성 불균형 심화, 어뷰징 및 허위 후기 증가</td>
            </tr>
            <tr className="bg-gray-800/30">
              <td className="p-4 font-bold text-blue-400">Beauty 3.0: 참여·투명성 중심</td>
              <td className="p-4 text-white">데이터 기반 신뢰 인증, 분산형 참여</td>
              <td className="p-4 text-white">소비자가 생태계의 주체로 전환되는 시대</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-center mt-8 text-lg text-gray-300">"광고보다 신뢰를, 가격보다 가치를, 브랜드보다 공동체를."</p>
    </Container>
  </Section>
);

/***** Philosophy Section *****/
const Philosophy = () => (
  <Section id="philosophy">
    <Container>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Beauty 3.0 핵심 철학</h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Trust First (신뢰 우선)" icon={<ShieldCheck className="h-5 w-5 text-blue-400" />}>브랜드의 주장이 아닌, 검증된 소비자 경험과 객관적 데이터를 기반으로 신뢰를 쌓습니다.</Card>
        <Card title="Fair Loop (공정한 선순환)" icon={<Zap className="h-5 w-5 text-blue-400" />}>플랫폼의 수익이 생태계에 기여한 참여자(소비자, 리뷰어)와 파트너에게 공정하게 분배되는 구조를 지향합니다.</Card>
        <Card title="Ethical Beauty (윤리적 가치)" icon={<HeartHandshake className="h-5 w-5 text-blue-400" />}>제품의 성분, 생산, 유통 과정은 물론, 사회적 기여까지 투명하게 공개하여 소비자의 가치 소비를 돕습니다.</Card>
        <Card title="Inclusive Growth (포용적 성장)" icon={<Users className="h-5 w-5 text-blue-400" />}>인디 브랜드, KOC·KOL, 그리고 경력단절 인력까지 누구나 참여하고 성장할 수 있는 기회를 제공합니다.</Card>
        <Card title="DAO & Web3 Ready (미래 확장성)" icon={<Globe className="h-5 w-5 text-blue-400" />}>장기적으로 커뮤니티가 주도하는 DAO로의 전환을 통해 지속 가능한 글로벌 생태계를 구축합니다.</Card>
        <Card title="Executive Summary" icon={<Target className="h-5 w-5 text-blue-400" />}>데이터와 참여 기반의 투명한 신뢰 시스템(Trustlink)과 공정한 보상(Fair Loop)을 통해 소비자가 주체가 되는 글로벌 'Trust Beauty' 시장을 선도합니다.</Card>
      </div>
    </Container>
  </Section>
);

/***** Ecosystem Cards with Hover Effects and Animations *****/
const Ecosystem = () => (
  <Section id="ecosystem">
    <Container>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Beauty 3.0 생태계</h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="M4U (Experience Platform)" icon={<FlaskConical className="h-5 w-5 text-blue-400" />}>참여의 시작점. 뷰티 제품 체험단 및 리뷰 커머스 허브로, 소비자가 생태계에 첫발을 들이는 온보딩 채널입니다.</Card>
        <Card title="하루뷰티 (Wellness & Growth)" icon={<TrendingUp className="h-5 w-5 text-blue-400" />}>성장의 공간. 온·오프라인을 연계하여 사용자의 지속적인 참여와 성장을 지원하는 웰니스 커뮤니티입니다.</Card>
        <Card title="트러스트링크 (Trust Layer)" icon={<Lock className="h-5 w-5 text-blue-400" />}>신뢰의 인프라. 브랜드, 유통사, 소비자 간의 정보를 투명하게 연결하여 생태계 전체의 신뢰도를 높이는 기술 기반 인프라입니다.</Card>
      </div>
    </Container>
  </Section>
);

/***** M4U Section with Animations *****/
const M4U = () => (
  <Section id="m4u">
    <Container className="relative z-10">
      <div className="grid lg:grid-cols-2 gap-10 items-start">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }}>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">M4U — 소비자가 만드는 신뢰 데이터 허브</h2>
          <p className="mt-3 text-gray-300">"Me for You, You for Me." 소비자는 정직한 리뷰로 보상을 받고, 브랜드는 실제 데이터를 얻습니다. 체험단, 리뷰 미션, AI 기반 개인 맞춤 추천을 통해 신뢰를 쌓아갑니다.</p>
          <ul className="mt-6 space-y-4 text-sm text-gray-300">
            <li className="flex items-start gap-3"><Layers3 className="h-5 w-5 text-blue-400 mt-1 shrink-0" />
              <div><strong className="text-white">체험 및 리뷰:</strong> 신제품, 인디 브랜드 제품을 체험하고 진솔한 후기를 작성합니다.</div>
            </li>
            <li className="flex items-start gap-3"><Coins className="h-5 w-5 text-blue-400 mt-1 shrink-0" />
              <div><strong className="text-white">리워드 시스템:</strong> 리뷰의 질과 기여도에 따라 하루코인(Haru Coin)으로 보상받습니다.</div>
            </li>
            <li className="flex items-start gap-3"><GitCommit className="h-5 w-5 text-blue-400 mt-1 shrink-0" />
              <div><strong className="text-white">수익화 루프:</strong> 우수 리뷰어에게는 자동 추천 코드가 발급되어 레퍼럴 수익 창출이 가능합니다.</div>
            </li>
          </ul>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-2xl border border-gray-700 bg-gray-800/60 backdrop-blur-md shadow-xl p-6"
        >
          <h4 className="font-semibold mb-3 text-white">리뷰 신뢰 예시</h4>
          <div className="space-y-3 text-sm text-gray-300">
            <motion.div whileHover={{ scale: 1.02, backgroundColor: "#374151" }} transition={{ duration: 0.2 }} className="p-3 rounded-xl bg-gray-800 border border-gray-700 cursor-pointer">
              <strong className="text-white">나이아신아마이드 4% 세럼</strong>: 30일 사용 후, 20-30대 건성 피부 사용자 128명 중 23%가 "피부 톤 개선"에 긍정적이라고 응답했습니다.
            </motion.div>
            <motion.div whileHover={{ scale: 1.02, backgroundColor: "#374151" }} transition={{ duration: 0.2 }} className="p-3 rounded-xl bg-gray-800 border border-gray-700 cursor-pointer">
              <strong className="text-white">CICA 진정 패드</strong>: 2주 사용 후, 민감성 피부 사용자 76명 중 18%가 "홍조 감소"를 체감했다고 보고했습니다.
            </motion.div>
            <motion.div whileHover={{ scale: 1.02, backgroundColor: "#374151" }} transition={{ duration: 0.2 }} className="p-3 rounded-xl bg-gray-800 border border-gray-700 cursor-pointer">
              <strong className="text-white">AGE-R 홈케어 디바이스</strong>: 4주 사용 후, 40대 이상 사용자 54명을 대상으로 한 "탄력 만족도" 조사에서 평균 4.6점(5점 만점)을 기록했습니다.
            </motion.div>
          </div>
        </motion.div>
      </div>
    </Container>
  </Section>
);

/***** Haru Beauty Section with Animations *****/
const HaruBeauty = () => (
  <Section id="haru" className="relative overflow-hidden">
    <Container className="relative z-10">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">하루뷰티 (Wellness & Growth)</h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">온·오프라인을 연계하여 사용자의 지속적인 참여와 성장을 지원하는 웰니스 커뮤니티입니다.</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }} className="space-y-6">
          <Card title="온·오프라인 통합">오프라인 뷰티샵(거점)과 앱 결제·예약 시스템을 연동하여 끊김 없는 O2O 경험을 제공합니다.</Card>
          <Card title="루틴 챌린지">‘15분 마스크팩 + 웰니스 콘텐츠’와 같은 챌린지를 통해 꾸준한 참여를 유도하고 보상을 지급합니다.</Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }}>
          <Card title="성장 사다리" className="h-full">User → Seller → Consultant → Leader로 이어지는 성장 경로를 제공하여 누구나 전문가로 발돋움할 수 있습니다. 특히 방문 뷰티, 협동조합 모델을 통해 여성과 싱글맘의 경제적 자립을 적극적으로 지원합니다.</Card>
        </motion.div>
      </div>
    </Container>
  </Section>
);

/***** Trust Link Section with Animations and interactive chart *****/
const TrustLink = () => (
  <Section id="trust" className="relative overflow-hidden">
    <Container className="relative z-10">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">트러스트링크 (Trust Layer)</h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">생태계 전체의 신뢰도를 높이는 기술 기반 인프라입니다.</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }} className="space-y-6">
          <Card title="💰 가격 구성 모듈">제품 원가, 마케팅 비용, 리워드 구조를 투명하게 공개합니다.</Card>
          <Card title="🧪 성분 공개 모듈">INCI 전성분, 핵심 성분 함량, 원산지, 각종 인증 정보를 누구나 쉽게 확인할 수 있도록 제공합니다.</Card>
          <Card title="🧭 ECI (Ethical Contribution Index) 지수">생산, 유통, 사회적 기여 등 브랜드의 윤리적 가치를 객관적인 지표로 시각화합니다.</Card>
          <Card title="🪪 PBA (Partnership Based Accreditation) 인증">소비자 경험 데이터, ESG 지표, 유통 투명성을 종합하여 브랜드와 파트너에게 신뢰 등급을 부여합니다.</Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, delay: 0.2 }} className="rounded-2xl border border-gray-700 bg-gray-800/60 backdrop-blur-md shadow-xl p-6 h-[400px]">
          <h4 className="font-semibold mb-4 text-white text-center">브랜드 신뢰도 대시보드</h4>
          <ResponsiveContainer width="100%" height="90%" role="figure" aria-label="Brand Trustworthiness Radar Chart">
            <RadarChart data={trustData} outerRadius="80%">
              <PolarGrid stroke="#4B5563" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "#9CA3AF" }} />
              <PolarRadiusAxis angle={30} domain={[50, 100]} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
              <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #4B5563", fontSize: "12px", borderRadius: "0.75rem" }} labelStyle={{ color: "#F9FAFB" }} />
              <Radar name="Brand A" dataKey="score" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </Container>
  </Section>
);

/***** Logistics Section *****/
const Logistics = () => {
  const locations = [
    { name: "Seoul, KR (HQ)", top: "35%", left: "80%", delay: 0.5 },
    { name: "Ho Chi Minh, VN", top: "65%", left: "75%", delay: 0.6 },
    { name: "Bangkok, TH", top: "60%", left: "70%", delay: 0.7 },
    { name: "Tokyo, JP", top: "36%", left: "88%", delay: 0.8 },
    { name: "Frankfurt, DE", top: "25%", left: "40%", delay: 0.9 },
  ];
  return (
    <Section id="logistics">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">트러스트 허브 & 공유 물류</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">인디 브랜드 연합을 통해 개별 브랜드가 감당하기 어려운 글로벌 물류의 부담을 해결합니다.</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }}>
            <p className="text-gray-300">Trust Hub Korea(한국)를 중심으로 베트남, 태국, 일본, EU 등 주요 거점을 연결하는 공유 물류망은 Beauty 3.0 생태계의 혈관입니다. '상생의 길'을 통해 잠재력 있는 K-뷰티 인디 브랜드들은 더 이상 고립되지 않고, 저렴하고 효율적으로 전 세계 소비자들을 만날 수 있게 됩니다.</p>
            <ul className="mt-6 space-y-4 text-sm text-gray-300">
              <li className="flex items-start gap-3"><Ship className="h-5 w-5 text-blue-400 mt-1 shrink-0" /><div><strong>공동 재고관리 및 출고:</strong> 여러 브랜드의 물량을 한 곳에서 처리하여 규모의 경제를 실현하고, 실시간 재고 추적을 제공합니다.</div></li>
              <li className="flex items-start gap-3"><Package className="h-5 w-5 text-blue-400 mt-1 shrink-0" /><div><strong>물류비 절감 및 리드타임 단축:</strong> 공동 운송을 통해 물류비를 평균 18% 절감하고, 현지 거점 배송으로 리드타임을 획기적으로 단축합니다.</div></li>
              <li className="flex items-start gap-3"><Lock className="h-5 w-5 text-blue-400 mt-1 shrink-0" /><div><strong>Trustlink 계약과 자동 연동:</strong> B2B 계약이 체결되면, 물류 시스템에 주문이 자동으로 연동되어 신속하고 정확한 배송이 시작됩니다.</div></li>
            </ul>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, delay: 0.2 }} className="rounded-2xl border border-gray-700 bg-gray-800/40 backdrop-blur-md shadow-xl p-6">
            <div className="aspect-[16/10] w-full rounded-xl bg-gray-900/50 border border-gray-700 grid place-items-center relative overflow-hidden">
              <span className="text-sm font-semibold text-gray-400 z-10">Global Trust Hub Network</span>
              {locations.map((loc) => (
                <motion.div key={loc.name} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5, delay: loc.delay }} title={loc.name} className="absolute w-3 h-3 rounded-full bg-blue-400" style={{ top: loc.top, left: loc.left }}>
                  <div className="absolute w-3 h-3 rounded-full bg-blue-400 animate-ping opacity-75" />
                </motion.div>
              ))}
            </div>
            <div className="mt-4 grid sm:grid-cols-3 gap-3 text-center">
              <Card className="p-4"><div className="text-2xl font-bold text-white">-18%</div><div className="text-xs text-gray-400">Avg. Logistics Cost</div></Card>
              <Card className="p-4"><div className="text-2xl font-bold text-white">+27%</div><div className="text-xs text-gray-400">Inventory Turnover</div></Card>
              <Card className="p-4"><div className="text-2xl font-bold text-white">+3.2x</div><div className="text-xs text-gray-400">Global Reach</div></Card>
            </div>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
};

/***** Tokenomics Section *****/
const Tokenomics = () => (
  <Section id="tokenomics">
    <Container>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Token & Reward 시스템: 기여에 대한 보상</h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">이원화된 토큰 시스템은 앱 내 참여자에게 안정적인 보상을 제공하고, 장기적으로는 생태계의 윤리적 가치를 실질적인 자산 가치로 연결하는 다리 역할을 합니다.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-max text-left border-collapse">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="p-4 border-b border-gray-700 text-sm font-semibold text-white">구분</th>
              <th className="p-4 border-b border-gray-700 text-sm font-semibold text-white">하루코인 (Haru Coin) - 오프체인</th>
              <th className="p-4 border-b border-gray-700 text-sm font-semibold text-white">트루코인 (True Coin) - 온체인</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-400">
            <tr>
              <td className="p-4 font-bold align-top">용도</td>
              <td className="p-4 align-top">앱 내 활동(리뷰, 추천, 챌린지)에 대한 리워드</td>
              <td className="p-4 align-top">DAO 거버넌스 참여, 글로벌 파트너십 펀드</td>
            </tr>
            <tr className="bg-gray-800/30">
              <td className="p-4 font-bold align-top">특징</td>
              <td className="p-4 align-top">안정적인 가치를 지닌 포인트 시스템</td>
              <td className="p-4 align-top">ESG·CSR 기여도에 따라 가치가 부여되는 토큰</td>
            </tr>
            <tr>
              <td className="p-4 font-bold align-top">연결(Bridge)</td>
              <td className="p-4 align-top">소비자 활동 데이터 → 브랜드 가치 증명</td>
              <td className="p-4 align-top">Trustlink 인증 데이터 → DAO 펀드 및 투자 연결</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Container>
  </Section>
);

/***** Social Value Section *****/
const SocialValue = () => (
  <Section id="social">
    <Container>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">사회적 가치와 포용적 성장 구조</h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">Beauty 3.0은 단순한 뷰티 플랫폼을 넘어 사회적 가치를 창출하는 것을 목표로 합니다.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <h3 className="font-bold text-white mb-2">💪 여성 경제 자립 지원</h3>
          <p>방문 뷰티, 셀러 시스템 등 유연한 수익 모델을 통해 싱글맘과 경력 보유 여성에게 새로운 경제 활동의 기회를 제공합니다.</p>
        </Card>
        <Card>
          <h3 className="font-bold text-white mb-2">🌏 포용적 성장 생태계</h3>
          <p>누구나 자본 없이 자신의 경험과 신뢰를 바탕으로 크리에이터, 셀러, 리더로 성장할 수 있는 사다리를 놓습니다.</p>
        </Card>
        <Card>
          <h3 className="font-bold text-white mb-2">🪙 투명한 기부와 CSR</h3>
          <p>브랜드와 소비자의 활동이 ECI 지수를 통해 사회적 기여로 연결되고, 이 과정이 투명하게 공개됩니다.</p>
        </Card>
      </div>
    </Container>
  </Section>
);

/***** Competitive Edge Section *****/
const CompetitiveEdge = () => (
  <Section id="competitive-edge">
    <Container>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">시장 기회 및 경쟁력</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-max text-left border-collapse">
          <thead>
            <tr>
              <th className="p-4 border-b border-gray-700 text-sm font-semibold text-white">항목</th>
              <th className="p-4 border-b border-gray-700 text-sm font-semibold text-white">기존 Beauty 2.0 생태계</th>
              <th className="p-4 border-b border-gray-700 text-sm font-semibold text-white bg-blue-500/10">Beauty 3.0 생태계</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-400">
            <tr>
              <td className="p-4 font-bold">마케팅</td>
              <td className="p-4">소수 인플루언서 중심</td>
              <td className="p-4 text-white bg-blue-500/10">다수의 참여자 보상 기반 (Community-driven)</td>
            </tr>
            <tr className="bg-gray-800/30">
              <td className="p-4 font-bold">신뢰</td>
              <td className="p-4">후기·광고의 신뢰도 저하</td>
              <td className="p-4 text-white bg-blue-500/10">투명성 + 데이터 기반 지수 인증 (Trust-Layer)</td>
            </tr>
            <tr>
              <td className="p-4 font-bold">수익 구조</td>
              <td className="p-4">플랫폼·브랜드 중심의 불투명 구조</td>
              <td className="p-4 text-white bg-blue-500/10">기여도에 따른 공정 분배 구조 (Fair Loop)</td>
            </tr>
            <tr className="bg-gray-800/30">
              <td className="p-4 font-bold">ESG</td>
              <td className="p-4">일회성, 형식적 캠페인</td>
              <td className="p-4 text-white bg-blue-500/10">데이터화된 기여 모델 (ECI Index)</td>
            </tr>
            <tr>
              <td className="p-4 font-bold">확장성</td>
              <td className="p-4">로컬 시장에 국한</td>
              <td className="p-4 text-white bg-blue-500/10">글로벌 DAO를 통한 무한 확장 가능성</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Container>
  </Section>
);

/***** Partners Section *****/
const Partners = () => (
    <Section id="partner">
        <Container>
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">파트너 참여</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">브랜드와 바이어를 위한 상생의 기회</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-stretch">
                <Card title="For Brands" icon={<Package className="h-5 w-5 text-blue-400" />}>
                    <p className="mb-4">Beauty 3.0 생태계에 합류하여 K-뷰티의 새로운 미래를 함께 만드세요. 투명한 데이터, 글로벌 물류망, 그리고 진성 팬 커뮤니티가 기다립니다.</p>
                    <ul className="space-y-2 text-sm mb-6">
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" /><span>신뢰 기반 브랜드 가치 상승</span></li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" /><span>공유 물류를 통한 비용 절감</span></li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" /><span>글로벌 시장 진출 지원</span></li>
                    </ul>
                    <Button variant="outline" className="w-full">브랜드 입점 문의</Button>
                </Card>
                <Card title="For Buyers & Distributors" icon={<Ship className="h-5 w-5 text-blue-400" />}>
                    <p className="mb-4">Trustlink를 통해 검증된 잠재력 있는 K-뷰티 브랜드를 만나보세요. 투명한 정보와 안정적인 공급망을 제공하여 성공적인 비즈니스를 지원합니다.</p>
                    <ul className="space-y-2 text-sm mb-6">
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" /><span>PBA 인증 브랜드 소싱</span></li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" /><span>데이터 기반 제품 추천</span></li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" /><span>안정적인 물류 파트너십</span></li>
                    </ul>
                    <Button variant="outline" className="w-full">바이어 등록하기</Button>
                </Card>
            </div>
        </Container>
    </Section>
);


/***** [MODIFIED] Roadmap & Join Section removed and replaced with a new final section *****/
const Roadmap = () => {
    const phases = [
        {
            icon: "🚀",
            phase: "Phase 1. Beauty 3.0 — 신뢰의 인프라 구축 (NOW)",
            subtitle: "“신뢰는 모든 시작의 기반이다.”",
            points: [
                "M4U 론칭 — 체험단 & 리뷰 커머스 운영",
                "Haru Coin (Off-chain) 보상 시스템 도입",
                "TrustLink 개발 — 가격 공개, 성분 모듈, ECI 지수 시각화",
                "PBA 인증 체계 구축 — 브랜드 신뢰 등급화",
                "인디 브랜드 온보딩 & 초기 생태계 유저 확보",
            ],
            goal: "초기 사용자 1만 명, 브랜드 100개 이상, 신뢰 지수 표준화 기반 마련"
        },
        {
            icon: "🌿",
            phase: "Phase 2. Haru Wellness — 온·오프라인 통합 생태계 확장",
            subtitle: "“디지털과 오프라인을 연결하다.”",
            points: [
                "웰니스 센터 & 뷰티샵 오프라인 거점 개설",
                "뷰티 자판기 X 앱 연동 → 유입 루프 강화",
                "15분 루틴 챌린지 & 리워드 강화",
                "싱글맘 협동조합 & 방문 뷰티 서비스 시작",
                "AI 기반 개인 루틴 추천 기능 탑재",
            ],
            goal: "앱 활성 유저 10만 명, 오프라인 파트너 300개, 루틴 참여율 60%"
        },
        {
            icon: "🪙",
            phase: "Phase 3. HARU DAO — 상생 경제 네트워크 전환",
            subtitle: "“참여와 신뢰를 자산으로.”",
            points: [
                "TRU Coin 발행 — 실물 자산 연동형 스테이블 토큰",
                "물류센터 & 공장 RWA(실물자산토큰)화",
                "DAO 거버넌스 개시 — 커뮤니티 주도 투자 결정",
                "글로벌 파트너십(한국·베트남·태국) 확장",
                "브랜드 성장 DeVC 투자 펀드 가동",
            ],
            goal: "DAO 회원 5만 명, 실물 자산 100억 규모 확보, TRU 스테이블코인 상용화"
        },
        {
            icon: "🌏",
            phase: "Phase 4. Global Trust Beauty — 상생 제국의 확장",
            subtitle: "“Trust Beauty — 세계로 확장하다.”",
            points: [
                "글로벌 DAO 네트워크 확장",
                "ECI·PBA 국제 표준화",
                "지역별 공동 물류허브 운영 (아시아 → 유럽 → 미국)",
                "브랜드 × 커뮤니티 공동 투자 모델 고도화",
                "K-Beauty → Trust Beauty 글로벌 표준 수립",
            ],
            goal: "글로벌 50만 커뮤니티, DAO 자산 1,000억 규모, 신뢰 뷰티 표준화 선도"
        }
    ];

    return (
        <Section id="roadmap">
            <Container>
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">새로운 질서를 향한 여정</h2>
                </div>

                <div className="relative max-w-3xl mx-auto">
                    <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-700 hidden sm:block"></div>

                    {phases.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="relative pl-14 mb-12 sm:pl-16"
                        >
                            <div className="absolute left-5 top-1 w-5 h-5 rounded-full bg-blue-500 border-4 border-gray-900 -translate-x-1/2"></div>
                            <div className="flex items-center gap-4">
                               <span className="text-2xl">{item.icon}</span>
                                <h3 className="font-bold text-lg text-white">{item.phase}</h3>
                            </div>
                            <div className="pl-10">
                                <p className="text-sm text-blue-300 italic mt-1">{item.subtitle}</p>
                                <ul className="mt-3 space-y-1 text-sm text-gray-400">
                                    {item.points.map((point, pIndex) => (
                                        <li key={pIndex} className="relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-blue-400">{point}</li>
                                    ))}
                                </ul>
                                <p className="mt-3 text-sm text-gray-300 bg-gray-800/50 p-2 rounded-md inline-block">
                                    <span className="font-bold">💡 성과목표:</span> {item.goal}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Container>
        </Section>
    );
};

/***** Footer *****/
const Footer = () => (
  <footer className="border-t border-gray-700 bg-gray-900 relative z-10">
    <Container>
      <div className="py-10 grid md:grid-cols-4 gap-6 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-blue-500 to-teal-400" />
            <span className="font-bold text-white">ROMANA</span>
          </div>
          <p className="text-gray-400">Global Trust Beauty Platform</p>
        </div>
        <div>
          <div className="font-semibold mb-2 text-white">Platform</div>
          <ul className="space-y-1 text-gray-400">
            <li>
              <a href="#m4u" className="hover:text-white">
                M4U
              </a>
            </li>
            <li>
              <a href="#haru" className="hover:text-white">
                Haru Beauty
              </a>
            </li>
            <li>
              <a href="#trust" className="hover:text-white">
                Trustlink
              </a>
            </li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2 text-white">For Partners</div>
          <ul className="space-y-1 text-gray-400">
            <li>
              <a href="#partner" className="hover:text-white">
                Brand Onboarding
              </a>
            </li>
            <li>
              <a href="#partner" className="hover:text-white">
                Buyer Registration
              </a>
            </li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2 text-white">Contact</div>
          <ul className="space-y-1 text-gray-400">
            <li>hello@romana.global</li>
            <li>Seoul · Ho Chi Minh · Bangkok</li>
          </ul>
        </div>
      </div>
      <div className="py-6 border-t border-gray-700 text-xs text-gray-500 flex items-center justify-between">
        <span>© {new Date().getFullYear()} ROMANA. All rights reserved.</span>
        <span>Trust · Wellness · Co-Prosperity</span>
      </div>
    </Container>
  </footer>
);

/***** Main App Component *****/
export default function App() {
  const [isWhitepaperOpen, setIsWhitepaperOpen] = useState(false);

  useEffect(() => {
    document.title = "ROMANA | 상생의 제국";
  }, []);

  useEffect(() => {
    document.body.style.overflow = isWhitepaperOpen ? "hidden" : "";
    return () => {
        document.body.style.overflow = "";
    };
  }, [isWhitepaperOpen]);

  return (
    <>
      <style>{`
        html { scroll-behavior: smooth; }
      `}</style>
      <div className="min-h-screen bg-gray-900 text-gray-200 font-sans relative" lang="ko">
        <InteractiveBackground />
        <Header />
        <main className="relative z-10">
          <Hero onOpenWhitepaper={() => setIsWhitepaperOpen(true)} />
          <Intro />
          <Philosophy />
          <Ecosystem />
          <M4U />
          <HaruBeauty />
          <TrustLink />
          <Logistics />
          <Tokenomics />
          <SocialValue />
          <CompetitiveEdge />
          <Partners />
          <Roadmap />
        </main>
        <Footer />
        <WhitepaperModal isOpen={isWhitepaperOpen} onClose={() => setIsWhitepaperOpen(false)} />
      </div>
    </>
  );
}