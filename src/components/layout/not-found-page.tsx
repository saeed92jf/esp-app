"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  const t = useTranslations("NotFound");

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full px-0 overflow-hidden bg-background min-h-full">
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes float-spaceman {
          0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
          33% { transform: translate(-10px, -15px) rotate(2deg); }
          66% { transform: translate(15px, 5px) rotate(-1.5deg); }
        }
        @keyframes wobble-cord {
          0%, 100% { transform: rotate(0deg) scaleY(1); }
          50% { transform: rotate(4deg) scaleY(1.05); }
        }
        @keyframes float-crater-small {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(-3px); }
        }
        @keyframes float-crater-big {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(3px); }
        }
        @keyframes rotate-planet {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-2deg); }
        }
        @keyframes rotate-stars {
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(10deg); }
        }
        @keyframes scale-stars {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.6); opacity: 0.5; }
        }
        @keyframes float-circles-small {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes float-circles-big {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
        @keyframes shine-glass {
          0%, 100% { transform: translateX(-68px) rotate(0deg); }
          10%, 90% { transform: translateX(80px) rotate(-30deg); }
        }

        .anim-spaceman { animation: float-spaceman 12s ease-in-out infinite; transform-origin: center; }
        .anim-cord { animation: wobble-cord 6s ease-in-out infinite; transform-origin: 273px 410px; }
        .anim-crater-small { animation: float-crater-small 3s ease-in-out infinite; }
        .anim-crater-big { animation: float-crater-big 3s ease-in-out infinite; }
        .anim-planet { animation: rotate-planet 4s ease-in-out infinite; transform-origin: 572px 108px; }
        
        .anim-star-1 { animation: rotate-stars 12s ease-in-out infinite; transform-origin: 518px 256px; }
        .anim-star-2 { animation: rotate-stars 15s ease-in-out infinite reverse; transform-origin: 154.5px 242px; }
        .anim-star-3 { animation: rotate-stars 18s ease-in-out infinite; transform-origin: 320px 143px; }
        .anim-star-4 { animation: rotate-stars 10s ease-in-out infinite reverse; transform-origin: 200px 493px; }

        .anim-circles-small { animation: float-circles-small 3s ease-in-out infinite; }
        .anim-circles-big { animation: float-circles-big 3.5s ease-in-out infinite; }
        .anim-glass-shine { animation: shine-glass 8s ease-in-out infinite; transform-origin: center; }
        
        .svg-404 { overflow: visible !important; }
      `}} />

      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-5 gap-0 md:gap-2 items-center h-full flex-1">
        
        {/* Left Side: SVG Animation */}
        <div className="w-full flex items-center justify-center md:justify-end h-full px-0 md:pr-0 md:col-span-3">
          <svg version="1.1" viewBox="-200 0 1000 600" preserveAspectRatio="xMaxYMid slice" shapeRendering="geometricPrecision" textRendering="geometricPrecision" className="w-full h-auto max-w-[800px] svg-404">
            <g>
              <defs>
                <clipPath id="GlassClip">
                  <path d="M380.857,346.164c-1.247,4.651-4.668,8.421-9.196,10.06c-9.332,3.377-26.2,7.817-42.301,3.5s-28.485-16.599-34.877-24.192c-3.101-3.684-4.177-8.66-2.93-13.311l7.453-27.798c0.756-2.82,3.181-4.868,6.088-5.13c6.755-0.61,20.546-0.608,41.785,5.087s33.181,12.591,38.725,16.498c2.387,1.682,3.461,4.668,2.705,7.488L380.857,346.164z" />
                </clipPath>
              </defs>

              <g className="anim-planet">
                <circle fill="none" className="stroke-foreground" strokeWidth="3" strokeMiterlimit="10" cx="572.859" cy="108.803" r="90.788" />
                <circle className="anim-crater-big stroke-foreground" fill="none" strokeWidth="3" strokeMiterlimit="10" cx="548.891" cy="62.319" r="13.074" />
                <circle className="anim-crater-small stroke-foreground" fill="none" strokeWidth="3" strokeMiterlimit="10" cx="591.743" cy="158.918" r="7.989" />
                <path className="stroke-foreground" fill="none" strokeWidth="3" strokeLinecap="round" strokeMiterlimit="10" d="M476.562,101.461c-30.404,2.164-49.691,4.221-49.691,8.007c0,6.853,63.166,12.408,141.085,12.408s141.085-5.555,141.085-12.408c0-3.378-15.347-4.988-40.243-7.225" />
                <path className="stroke-foreground" opacity="0.5" fill="none" strokeWidth="3" strokeLinecap="round" strokeMiterlimit="10" d="M483.985,127.43c23.462,1.531,52.515,2.436,83.972,2.436c36.069,0,68.978-1.19,93.922-3.149" />
              </g>

              <g>
                <g className="stroke-foreground">
                  <g className="anim-star-1">
                    <line fill="none" strokeWidth="3" strokeLinecap="round" strokeMiterlimit="10" x1="518.07" y1="245.375" x2="518.07" y2="266.581" />
                    <line fill="none" strokeWidth="3" strokeLinecap="round" strokeMiterlimit="10" x1="508.129" y1="255.978" x2="528.01" y2="255.978" />
                  </g>
                  <g className="anim-star-2">
                    <line fill="none" strokeWidth="3" strokeLinecap="round" strokeMiterlimit="10" x1="154.55" y1="231.391" x2="154.55" y2="252.598" />
                    <line fill="none" strokeWidth="3" strokeLinecap="round" strokeMiterlimit="10" x1="144.609" y1="241.995" x2="164.49" y2="241.995" />
                  </g>
                  <g className="anim-star-3">
                    <line fill="none" strokeWidth="3" strokeLinecap="round" strokeMiterlimit="10" x1="320.135" y1="132.746" x2="320.135" y2="153.952" />
                    <line fill="none" strokeWidth="3" strokeLinecap="round" strokeMiterlimit="10" x1="310.194" y1="143.349" x2="330.075" y2="143.349" />
                  </g>
                  <g className="anim-star-4">
                    <line fill="none" strokeWidth="3" strokeLinecap="round" strokeMiterlimit="10" x1="200.67" y1="483.11" x2="200.67" y2="504.316" />
                    <line fill="none" strokeWidth="3" strokeLinecap="round" strokeMiterlimit="10" x1="210.611" y1="493.713" x2="190.73" y2="493.713" />
                  </g>
                </g>
                <g className="anim-circles-big stroke-foreground">
                  <circle fill="none" strokeWidth="3" strokeLinecap="round" strokeMiterlimit="10" cx="588.977" cy="255.978" r="7.952" />
                  <circle fill="none" strokeWidth="3" strokeLinecap="round" strokeMiterlimit="10" cx="450.066" cy="320.259" r="7.952" />
                  <circle fill="none" strokeWidth="3" strokeLinecap="round" strokeMiterlimit="10" cx="168.303" cy="353.753" r="7.952" />
                  <circle fill="none" strokeWidth="3" strokeLinecap="round" strokeMiterlimit="10" cx="429.522" cy="201.185" r="7.952" />
                  <circle fill="none" strokeWidth="3" strokeLinecap="round" strokeMiterlimit="10" cx="200.67" cy="176.313" r="7.952" />
                  <circle fill="none" strokeWidth="3" strokeLinecap="round" strokeMiterlimit="10" cx="133.343" cy="477.014" r="7.952" />
                  <circle fill="none" strokeWidth="3" strokeLinecap="round" strokeMiterlimit="10" cx="283.521" cy="568.033" r="7.952" />
                  <circle fill="none" strokeWidth="3" strokeLinecap="round" strokeMiterlimit="10" cx="413.618" cy="482.387" r="7.952" />
                </g>
                <g className="anim-circles-small fill-foreground">
                  <circle cx="549.879" cy="296.402" r="2.651" />
                  <circle cx="253.29" cy="229.24" r="2.651" />
                  <circle cx="434.824" cy="263.931" r="2.651" />
                  <circle cx="183.708" cy="544.176" r="2.651" />
                  <circle cx="382.515" cy="530.923" r="2.651" />
                  <circle cx="130.693" cy="305.608" r="2.651" />
                  <circle cx="480.296" cy="477.014" r="2.651" />
                </g>
              </g>

              <g className="anim-spaceman">
                <path className="stroke-foreground anim-cord" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M273.813,410.969 C100,450 -1500,500 -4000,200" />
                <path className="fill-background stroke-foreground" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M338.164,454.689l-64.726-17.353c-11.086-2.972-17.664-14.369-14.692-25.455l15.694-58.537c3.889-14.504,18.799-23.11,33.303-19.221l52.349,14.035c14.504,3.889,23.11,18.799,19.221,33.303l-15.694,58.537C360.647,451.083,349.251,457.661,338.164,454.689z" />
                
                <g id="antenna">
                  <line className="fill-background stroke-foreground" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" x1="323.396" y1="236.625" x2="295.285" y2="353.753" />
                  <circle className="fill-background stroke-foreground" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" cx="323.666" cy="235.617" r="6.375" />
                </g>
                <g id="armR">
                  <path className="fill-background stroke-foreground" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M360.633,363.039c1.352,1.061,4.91,5.056,5.824,6.634l27.874,47.634c3.855,6.649,1.59,15.164-5.059,19.02l0,0c-6.649,3.855-15.164,1.59-19.02-5.059l-5.603-9.663" />
                  <path className="fill-background stroke-foreground" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M388.762,434.677c5.234-3.039,7.731-8.966,6.678-14.594c2.344,1.343,4.383,3.289,5.837,5.793c4.411,7.596,1.829,17.33-5.767,21.741c-7.596,4.411-17.33,1.829-21.741-5.767c-1.754-3.021-2.817-5.818-2.484-9.046C375.625,437.355,383.087,437.973,388.762,434.677z" />
                </g>
                <g id="armL">
                  <path className="fill-background stroke-foreground" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M301.301,347.66c-1.702,0.242-5.91,1.627-7.492,2.536l-47.965,27.301c-6.664,3.829-8.963,12.335-5.134,18.999h0c3.829,6.664,12.335,8.963,18.999,5.134l9.685-5.564" />
                  <path className="fill-background stroke-foreground" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M241.978,395.324c-3.012-5.25-2.209-11.631,1.518-15.977c-2.701-0.009-5.44,0.656-7.952,2.096c-7.619,4.371-10.253,14.09-5.883,21.71c4.371,7.619,14.09,10.253,21.709,5.883c3.03-1.738,5.35-3.628,6.676-6.59C252.013,404.214,245.243,401.017,241.978,395.324z" />
                </g>
                <g id="body">
                  <path className="fill-background stroke-foreground" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M353.351,365.387c-7.948,1.263-16.249,0.929-24.48-1.278c-8.232-2.207-15.586-6.07-21.836-11.14c-17.004,4.207-31.269,17.289-36.128,35.411l-1.374,5.123c-7.112,26.525,8.617,53.791,35.13,60.899l0,0c26.513,7.108,53.771-8.632,60.883-35.158l1.374-5.123C371.778,395.999,365.971,377.536,353.351,365.387z" />
                  <path className="stroke-foreground" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M269.678,394.912L269.678,394.912c26.3,20.643,59.654,29.585,93.106,25.724l2.419-0.114" />
                </g>
                <g id="legs">
                  <g id="legR">
                    <path className="fill-background stroke-foreground" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M312.957,456.734l-14.315,53.395c-1.896,7.07,2.299,14.338,9.37,16.234l0,0c7.07,1.896,14.338-2.299,16.234-9.37l17.838-66.534C333.451,455.886,323.526,457.387,312.957,456.734z" />
                    <line className="stroke-foreground" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" x1="304.883" y1="486.849" x2="330.487" y2="493.713" />
                  </g>
                  <g id="legL">
                    <path className="fill-background stroke-foreground" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M296.315,452.273L282,505.667c-1.896,7.07-9.164,11.265-16.234,9.37l0,0c-7.07-1.896-11.265-9.164-9.37-16.234l17.838-66.534C278.993,441.286,286.836,447.55,296.315,452.273z" />
                    <line className="stroke-foreground" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" x1="262.638" y1="475.522" x2="288.241" y2="482.387" />
                  </g>
                </g>
                <g id="head">
                  <ellipse transform="matrix(0.259 -0.9659 0.9659 0.259 -51.5445 563.2371)" className="fill-background stroke-foreground" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" cx="341.295" cy="315.211" rx="61.961" ry="60.305" />
                  <path id="headStripe" className="stroke-foreground" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M330.868,261.338c-7.929,1.72-15.381,5.246-21.799,10.246" />
                  <path className="fill-background stroke-foreground" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M380.857,346.164c-1.247,4.651-4.668,8.421-9.196,10.06c-9.332,3.377-26.2,7.817-42.301,3.5s-28.485-16.599-34.877-24.192c-3.101-3.684-4.177-8.66-2.93-13.311l7.453-27.798c0.756-2.82,3.181-4.868,6.088-5.13c6.755-0.61,20.546-0.608,41.785,5.087s33.181,12.591,38.725,16.498c2.387,1.682,3.461,4.668,2.705,7.488L380.857,346.164z" />
                  <g clipPath="url(#GlassClip)">
                    <polygon className="anim-glass-shine stroke-foreground" fill="none" strokeWidth="3" strokeMiterlimit="10" points="278.436,375.599 383.003,264.076 364.393,251.618 264.807,364.928" />
                  </g>
                </g>
              </g>
            </g>
          </svg>
        </div>

        {/* Right Side: Text Content */}
        <div className="flex flex-col justify-start items-center md:items-start text-center md:text-start px-8 md:pl-0 md:col-span-2 -mt-10 md:mt-0 z-10">
          <h1 className="text-6xl lg:text-8xl font-black tracking-tighter text-foreground mb-2">404</h1>
          <h2 className="text-xl lg:text-2xl font-bold text-foreground mb-2">
            {t("title")}
          </h2>
          <p className="text-muted-foreground text-xs lg:text-sm mb-8 max-w-sm leading-relaxed">
            {t("description")}
          </p>
          <Button asChild variant="secondary" size="lg" className="rounded-full px-10 font-medium">
            <Link href="/">
              {t("backHome")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
