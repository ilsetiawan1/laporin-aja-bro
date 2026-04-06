"use client";

// import LiquidEther from "@/components/landing/LiquidEther";

import LightRays from './LightRays';

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 z-0 w-full h-full">
      <LightRays
    raysOrigin="top-center"
    raysColor="#ffffff"
    raysSpeed={1}
    lightSpread={1.9}
    rayLength={2.2}
    followMouse={true}
    mouseInfluence={0}
    noiseAmount={0.08}
    distortion={0}
    className="custom-rays"
    pulsating={false}
    fadeDistance={1}
    saturation={1.9}
/>
    </div>
  );
}