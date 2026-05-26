/* ═══════════════════════════════════════════════════════════
   P3X — FULL VANILLA JS
   Animations ported from React Bits:
     1. ElectricBorder  (Canvas 2D noise path around profile pic)
     2. LaserFlow       (THREE.js WebGL beam — full-page background)
     3. ShapeBlur       (THREE.js WebGL shape hover — hero overlay)
     4. GradualBlur     (Layered backdrop-filter divs on links)
     5. FadeContent     (IntersectionObserver scroll-reveal with blur)
     6. StarBorder      (Radial-gradient animated star border on buttons/links)
   Plus all existing site logic.
═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── DOM refs ─────────────────────────────────────────────────────── */
  const loadingScreen   = document.getElementById('loading-screen');
  const loadingProgress = document.getElementById('loading-progress');
  const loadingContent  = document.querySelector('.loading-content');
  const profilePic      = document.querySelector('.profile-pic');
  const username        = document.querySelector('.username');
  const bio             = document.querySelector('.bio');
  const links           = document.querySelectorAll('.link-item');
  const discordBtn      = document.getElementById('discordBtn');
  const copyNotif       = document.getElementById('copyNotification');
  const modHeaders      = document.querySelectorAll('.mod-header');
  const themeSwitch     = document.getElementById('theme-switch');
  const backgroundEl    = document.querySelector('.background');
  const navButtons      = document.querySelectorAll('.nav-button');
  const contactsHeading = document.querySelector('.contacts-heading');
  const mobileToggle    = document.querySelector('.mobile-menu-toggle');
  const mobileMenu      = document.querySelector('.mobile-menu');
  const parallaxText    = document.querySelector('.parallax-text');
  const textGlow        = document.querySelector('.text-glow');
  const homeContainer   = document.querySelector('.home-container');
  const stackImages     = document.querySelectorAll('.stack-image');

  const isDesktop = () => window.innerWidth > 768;

  /* ═══════════════════════════════════════════════════════════
     1. STAR BORDER — inject animated star divs into nav buttons & links
     Ported from StarBorder.jsx + StarBorder.css
  ═══════════════════════════════════════════════════════════ */
  function initStarBorder() {
    // Nav buttons
    document.querySelectorAll('.star-btn, .star-link').forEach(el => {
      // Avoid double-init
      if (el.querySelector('.star-bottom')) return;
      const b = document.createElement('div');
      const t = document.createElement('div');
      b.className = 'star-bottom';
      t.className = 'star-top';
      // Speed variation per element
      const spd = (4 + Math.random() * 3).toFixed(1) + 's';
      b.style.animationDuration = spd;
      t.style.animationDuration = spd;
      el.prepend(b, t);
    });
  }

  /* ═══════════════════════════════════════════════════════════
     2. ELECTRIC BORDER — Canvas noise path around profile pic
     Ported from ElectricBorder.jsx + ElectricBorder.css
  ═══════════════════════════════════════════════════════════ */
  function initElectricBorder() {
    const canvas    = document.getElementById('eb-canvas');
    const container = document.querySelector('.electric-border-wrapper');
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    let animId = null;
    let timeVal = 0;
    let lastFrame = 0;

    // Noise helpers (ported from React component)
    function rand(x) { return ((Math.sin(x * 12.9898) * 43758.5453) % 1 + 1) % 1; }

    function noise2D(x, y) {
      const i = Math.floor(x), j = Math.floor(y);
      const fx = x - i, fy = y - j;
      const a = rand(i + j * 57), b = rand(i + 1 + j * 57);
      const c = rand(i + (j + 1) * 57), d = rand(i + 1 + (j + 1) * 57);
      const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
      return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
    }

    function octNoise(x, octaves, lac, gain, amp, freq, t, seed, flatness) {
      let y = 0, amplitude = amp, frequency = freq;
      for (let i = 0; i < octaves; i++) {
        const oct = i === 0 ? amplitude * flatness : amplitude;
        y += oct * noise2D(frequency * x + seed * 100, t * frequency * 0.3);
        frequency *= lac; amplitude *= gain;
      }
      return y;
    }

    function cornerPoint(cx, cy, r, startAngle, arcLen, progress) {
      const angle = startAngle + progress * arcLen;
      return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    }

    function roundRectPoint(t, left, top, w, h, r) {
      const sw = w - 2 * r, sh = h - 2 * r;
      const ca = (Math.PI * r) / 2;
      const perim = 2 * sw + 2 * sh + 4 * ca;
      const dist = t * perim;
      let acc = 0;
      if (dist <= acc + sw) {
        const p = (dist - acc) / sw;
        return { x: left + r + p * sw, y: top };
      } acc += sw;
      if (dist <= acc + ca) {
        return cornerPoint(left + w - r, top + r, r, -Math.PI / 2, Math.PI / 2, (dist - acc) / ca);
      } acc += ca;
      if (dist <= acc + sh) {
        const p = (dist - acc) / sh;
        return { x: left + w, y: top + r + p * sh };
      } acc += sh;
      if (dist <= acc + ca) {
        return cornerPoint(left + w - r, top + h - r, r, 0, Math.PI / 2, (dist - acc) / ca);
      } acc += ca;
      if (dist <= acc + sw) {
        const p = (dist - acc) / sw;
        return { x: left + w - r - p * sw, y: top + h };
      } acc += sw;
      if (dist <= acc + ca) {
        return cornerPoint(left + r, top + h - r, r, Math.PI / 2, Math.PI / 2, (dist - acc) / ca);
      } acc += ca;
      if (dist <= acc + sh) {
        const p = (dist - acc) / sh;
        return { x: left, y: top + h - r - p * sh };
      } acc += sh;
      return cornerPoint(left + r, top + r, r, Math.PI, Math.PI / 2, (dist - acc) / ca);
    }

    const CFG = {
      octaves: 10, lacunarity: 1.6, gain: 0.7,
      amplitude: 0.12, frequency: 10, baseFlatness: 0,
      displacement: 60, borderOffset: 60,
      speed: 1, borderRadius: 500, // 500 = full circle (clamped later)
      color: getComputedStyle(document.documentElement).getPropertyValue('--c1').trim() || '#ff2d2d'
    };

    function updateColor() {
      CFG.color = getComputedStyle(document.documentElement).getPropertyValue('--c1').trim() || '#ff2d2d';
    }

    function resize() {
      const rect = container.getBoundingClientRect();
      const bOff = CFG.borderOffset;
      const w = rect.width + bOff * 2;
      const h = rect.height + bOff * 2;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width  = w + 'px';
      canvas.style.height = h + 'px';
      ctx.scale(dpr, dpr);
      return { w, h, dpr };
    }

    let { w, h, dpr } = resize();

    new ResizeObserver(() => { ({ w, h, dpr } = resize()); }).observe(container);

    function draw(now) {
      const dt = (now - lastFrame) / 1000;
      timeVal += dt * CFG.speed;
      lastFrame = now;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);

      updateColor();
      ctx.strokeStyle = CFG.color;
      ctx.lineWidth   = 1.5;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';

      const bOff = CFG.borderOffset;
      const scale = CFG.displacement;
      const bw = w - 2 * bOff, bh = h - 2 * bOff;
      const maxR = Math.min(bw, bh) / 2;
      const radius = Math.min(CFG.borderRadius, maxR);
      const approxPerim = 2 * (bw + bh) + 2 * Math.PI * radius;
      const samples = Math.floor(approxPerim / 2);

      ctx.beginPath();
      for (let i = 0; i <= samples; i++) {
        const prog = i / samples;
        const pt = roundRectPoint(prog, bOff, bOff, bw, bh, radius);
        const xn = octNoise(prog * 8, CFG.octaves, CFG.lacunarity, CFG.gain, CFG.amplitude, CFG.frequency, timeVal, 0, CFG.baseFlatness);
        const yn = octNoise(prog * 8, CFG.octaves, CFG.lacunarity, CFG.gain, CFG.amplitude, CFG.frequency, timeVal, 1, CFG.baseFlatness);
        const dx = pt.x + xn * scale;
        const dy = pt.y + yn * scale;
        i === 0 ? ctx.moveTo(dx, dy) : ctx.lineTo(dx, dy);
      }
      ctx.closePath();
      ctx.stroke();

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }

  /* ═══════════════════════════════════════════════════════════
     3. LASER FLOW — THREE.js WebGL beam, full-page canvas
     Ported from LaserFlow.jsx
  ═══════════════════════════════════════════════════════════ */
  function initLaserFlow() {
    if (typeof THREE === 'undefined') return;
    const canvas = document.getElementById('laser-canvas');
    if (!canvas) return;

    const VERT = `
precision highp float;
attribute vec3 position;
void main(){ gl_Position = vec4(position, 1.0); }`;

    const FRAG = `
#ifdef GL_ES
#extension GL_OES_standard_derivatives : enable
#endif
precision highp float;
precision mediump int;
uniform float iTime;
uniform vec3 iResolution;
uniform vec4 iMouse;
uniform float uWispDensity;
uniform float uTiltScale;
uniform float uFlowTime;
uniform float uFogTime;
uniform float uBeamXFrac;
uniform float uBeamYFrac;
uniform float uFlowSpeed;
uniform float uVLenFactor;
uniform float uHLenFactor;
uniform float uFogIntensity;
uniform float uFogScale;
uniform float uWSpeed;
uniform float uWIntensity;
uniform float uFlowStrength;
uniform float uDecay;
uniform float uFalloffStart;
uniform float uFogFallSpeed;
uniform vec3 uColor;
uniform float uFade;
#define PI 3.14159265359
#define TWO_PI 6.28318530718
#define EPS 1e-6
#define EDGE_SOFT (DT_LOCAL*4.0)
#define DT_LOCAL 0.0038
#define TAP_RADIUS 6
#define R_H 150.0
#define R_V 150.0
#define FLARE_HEIGHT 16.0
#define FLARE_AMOUNT 8.0
#define FLARE_EXP 2.0
#define TOP_FADE_START 0.1
#define TOP_FADE_EXP 1.0
#define FLOW_PERIOD 0.5
#define FLOW_SHARPNESS 1.5
#define W_BASE_X 1.5
#define W_LAYER_GAP 0.25
#define W_LANES 10
#define W_SIDE_DECAY 0.5
#define W_HALF 0.01
#define W_AA 0.15
#define W_CELL 20.0
#define W_SEG_MIN 0.01
#define W_SEG_MAX 0.55
#define W_CURVE_AMOUNT 15.0
#define W_CURVE_RANGE (FLARE_HEIGHT - 3.0)
#define W_BOTTOM_EXP 10.0
#define FOG_ON 1
#define FOG_CONTRAST 1.2
#define FOG_OCTAVES 5
#define FOG_BOTTOM_BIAS 0.8
#define FOG_TILT_MAX_X 0.35
#define FOG_TILT_SHAPE 1.5
#define FOG_BEAM_MIN 0.0
#define FOG_BEAM_MAX 0.75
#define FOG_MASK_GAMMA 0.5
#define FOG_EXPAND_SHAPE 12.2
#define FOG_EDGE_MIX 0.5
#define HFOG_EDGE_START 0.20
#define HFOG_EDGE_END 0.98
#define HFOG_EDGE_GAMMA 1.4
#define HFOG_Y_RADIUS 25.0
#define HFOG_Y_SOFT 60.0
#define EDGE_X0 0.22
#define EDGE_X1 0.995
#define EDGE_X_GAMMA 1.25
#define EDGE_LUMA_T0 0.0
#define EDGE_LUMA_T1 2.0
#define DITHER_STRENGTH 1.0
float g(float x){return x<=0.00031308?12.92*x:1.055*pow(x,1.0/2.4)-0.055;}
float bs(vec2 p,vec2 q,float powr){float d=distance(p,q),f=powr*uFalloffStart,r=(f*f)/(d*d+EPS);return powr*min(1.0,r);}
float bsa(vec2 p,vec2 q,float powr,vec2 s){vec2 d=p-q;float dd=(d.x*d.x)/(s.x*s.x)+(d.y*d.y)/(s.y*s.y),f=powr*uFalloffStart,r=(f*f)/(dd+EPS);return powr*min(1.0,r);}
float tri01(float x){float f=fract(x);return 1.0-abs(f*2.0-1.0);}
float tauWf(float t,float tmin,float tmax){float a=smoothstep(tmin,tmin+EDGE_SOFT,t),b=1.0-smoothstep(tmax-EDGE_SOFT,tmax,t);return max(0.0,a*b);}
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+34.123);return fract(p.x*p.y);}
float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);float a=h21(i),b=h21(i+vec2(1,0)),c=h21(i+vec2(0,1)),d=h21(i+vec2(1,1));vec2 u=f*f*(3.0-2.0*f);return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}
float fbm2(vec2 p){float v=0.0,amp=0.6;mat2 m=mat2(0.86,0.5,-0.5,0.86);for(int i=0;i<FOG_OCTAVES;++i){v+=amp*vnoise(p);p=m*p*2.03+17.1;amp*=0.52;}return v;}
float rGate(float x,float l){float a=smoothstep(0.0,W_AA,x),b=1.0-smoothstep(l,l+W_AA,x);return max(0.0,a*b);}
float flareY(float y){float t=clamp(1.0-(clamp(y,0.0,FLARE_HEIGHT)/max(FLARE_HEIGHT,EPS)),0.0,1.0);return pow(t,FLARE_EXP);}
float vWisps(vec2 uv,float topF){
  float y=uv.y,yf=(y+uFlowTime*uWSpeed)/W_CELL;
  float dRaw=clamp(uWispDensity,0.0,2.0),d=dRaw<=0.0?1.0:dRaw;
  float lanesF=floor(float(W_LANES)*min(d,1.0)+0.5);
  int lanes=int(max(1.0,lanesF));
  float sp=min(d,1.0),ep=max(d-1.0,0.0);
  float fm=flareY(max(y,0.0)),rm=clamp(1.0-(y/max(W_CURVE_RANGE,EPS)),0.0,1.0),cm=fm*rm;
  const float G=0.05;float xS=1.0+(FLARE_AMOUNT*W_CURVE_AMOUNT*G)*cm;
  float sPix=clamp(y/R_V,0.0,1.0),bGain=pow(1.0-sPix,W_BOTTOM_EXP),sum=0.0;
  for(int s=0;s<2;++s){float sgn=s==0?-1.0:1.0;for(int i=0;i<W_LANES;++i){if(i>=lanes)break;float off=W_BASE_X+float(i)*W_LAYER_GAP,xc=sgn*(off*xS);float dx=abs(uv.x-xc),lat=1.0-smoothstep(W_HALF,W_HALF+W_AA,dx),amp=exp(-off*W_SIDE_DECAY);float seed=h21(vec2(off,sgn*17.0)),yf2=yf+seed*7.0,ci=floor(yf2),fy=fract(yf2);float seg=mix(W_SEG_MIN,W_SEG_MAX,h21(vec2(ci,off*2.3)));float spR=h21(vec2(ci,off+sgn*31.0)),seg1=rGate(fy,seg)*step(spR,sp);if(ep>0.0){float spR2=h21(vec2(ci*3.1+7.0,off*5.3+sgn*13.0));float f2=fract(fy+0.5);seg1+=rGate(f2,seg*0.9)*step(spR2,ep);}sum+=amp*lat*seg1;}}
  float span=smoothstep(-3.0,0.0,y)*(1.0-smoothstep(R_V-6.0,R_V,y));
  return uWIntensity*sum*topF*bGain*span;
}
void mainImage(out vec4 fc,in vec2 frag){
  vec2 C=iResolution.xy*.5;float invW=1.0/max(C.x,1.0);
  vec2 sc=(512.0/iResolution.xy)*.4;
  vec2 uv=(frag-C)*sc,off=vec2(uBeamXFrac*iResolution.x*sc.x,uBeamYFrac*iResolution.y*sc.y);
  vec2 uvc=uv-off;
  float a=0.0,b=0.0;
  float basePhase=1.5*PI+uDecay*.5;float tauMin=basePhase-uDecay;float tauMax=basePhase;
  float cx=clamp(uvc.x/(R_H*uHLenFactor),-1.0,1.0),tH=clamp(TWO_PI-acos(cx),tauMin,tauMax);
  for(int k=-TAP_RADIUS;k<=TAP_RADIUS;++k){float tu=tH+float(k)*DT_LOCAL,wt=tauWf(tu,tauMin,tauMax);if(wt<=0.0)continue;float spd=max(abs(sin(tu)),0.02),u=clamp((basePhase-tu)/max(uDecay,EPS),0.0,1.0),env=pow(1.0-abs(u*2.0-1.0),0.8);vec2 p=vec2((R_H*uHLenFactor)*cos(tu),0.0);a+=wt*bs(uvc,p,env*spd);}
  float yPix=uvc.y,cy=clamp(-yPix/(R_V*uVLenFactor),-1.0,1.0),tV=clamp(TWO_PI-acos(cy),tauMin,tauMax);
  for(int k=-TAP_RADIUS;k<=TAP_RADIUS;++k){float tu=tV+float(k)*DT_LOCAL,wt=tauWf(tu,tauMin,tauMax);if(wt<=0.0)continue;float yb=(-R_V)*cos(tu),s=clamp(yb/R_V,0.0,1.0),spd=max(abs(sin(tu)),0.02);float env=pow(1.0-s,0.6)*spd;float cap=1.0-smoothstep(TOP_FADE_START,1.0,s);cap=pow(cap,TOP_FADE_EXP);env*=cap;float ph=s/max(FLOW_PERIOD,EPS)+uFlowTime*uFlowSpeed;float fl=pow(tri01(ph),FLOW_SHARPNESS);env*=mix(1.0-uFlowStrength,1.0,fl);float yp=(-R_V*uVLenFactor)*cos(tu),m=pow(smoothstep(FLARE_HEIGHT,0.0,yp),FLARE_EXP),wx=1.0+FLARE_AMOUNT*m;vec2 sig=vec2(wx,1.0),p=vec2(0.0,yp);float mask=step(0.0,yp);b+=wt*bsa(uvc,p,mask*env,sig);}
  float sPix=clamp(yPix/R_V,0.0,1.0),topA=pow(1.0-smoothstep(TOP_FADE_START,1.0,sPix),TOP_FADE_EXP);
  float L=a+b*topA;
  float w=vWisps(vec2(uvc.x,yPix),topA);
  float fog=0.0;
  #if FOG_ON
  vec2 fuv=uvc*uFogScale;
  vec2 dir=normalize(vec2(0.0,1.0));
  fuv+=uFogTime*uFogFallSpeed*dir;
  float n=fbm2(fuv+vec2(fbm2(fuv+vec2(7.3,2.1)),fbm2(fuv+vec2(-3.7,5.9)))*0.6);
  n=pow(clamp(n,0.0,1.0),FOG_CONTRAST);
  float pixW=1.0/max(iResolution.y,1.0);
  float wL=pixW;
  float m0=pow(smoothstep(FOG_BEAM_MIN-wL,FOG_BEAM_MAX+wL,L),FOG_MASK_GAMMA);
  float bm=1.0-pow(1.0-m0,FOG_EXPAND_SHAPE);bm=mix(bm*m0,bm,FOG_EDGE_MIX);
  float yP=1.0-smoothstep(HFOG_Y_RADIUS,HFOG_Y_RADIUS+HFOG_Y_SOFT,abs(yPix));
  float nxF=abs((frag.x-C.x)*invW),hE=1.0-smoothstep(HFOG_EDGE_START,HFOG_EDGE_END,nxF);hE=pow(clamp(hE,0.0,1.0),HFOG_EDGE_GAMMA);
  float hW=mix(1.0,hE,clamp(yP,0.0,1.0));
  float bBias=mix(1.0,1.0-sPix,FOG_BOTTOM_BIAS);
  float radialFade=1.0-smoothstep(0.0,0.7,length(uvc)/120.0);
  fog=n*uFogIntensity*1.8*bBias*bm*hW*radialFade;
  #endif
  float LF=L+fog;
  float dith=(h21(frag)-0.5)*(DITHER_STRENGTH/255.0);
  float tone=g(LF+w);
  vec3 col=tone*uColor+dith;
  float alpha=clamp(g(L+w*0.6)+dith*0.6,0.0,1.0);
  float nxE=abs((frag.x-C.x)*invW),xF=pow(clamp(1.0-smoothstep(EDGE_X0,EDGE_X1,nxE),0.0,1.0),EDGE_X_GAMMA);
  float scene=LF+max(0.0,w)*0.5,hi=smoothstep(EDGE_LUMA_T0,EDGE_LUMA_T1,scene);
  float eM=mix(xF,1.0,hi);
  col*=eM;alpha*=eM;
  col*=uFade;alpha*=uFade;
  fc=vec4(col,alpha);
}
void main(){vec4 fc;mainImage(fc,gl_FragCoord.xy);gl_FragColor=fc;}`;

    function hexToRGB(hex) {
      let c = hex.trim().replace('#', '');
      if (c.length === 3) c = c.split('').map(x => x + x).join('');
      const n = parseInt(c, 16) || 0xff2d2d;
      return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
    }

    const renderer = new THREE.WebGLRenderer({
      canvas, antialias: false, alpha: false, depth: false, stencil: false,
      powerPreference: 'high-performance', premultipliedAlpha: false,
      preserveDrawingBuffer: false
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 1);

    const scene  = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geo    = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1,-1,0, 3,-1,0, -1,3,0]), 3));

    function getColor() {
      const raw = getComputedStyle(document.documentElement).getPropertyValue('--c1').trim() || '#ff2d2d';
      return hexToRGB(raw);
    }

    let col = getColor();
    const uniforms = {
      iTime:          { value: 0 },
      iResolution:    { value: new THREE.Vector3(1,1,1) },
      iMouse:         { value: new THREE.Vector4(0,0,0,0) },
      uWispDensity:   { value: 1.0 },
      uTiltScale:     { value: 0.01 },
      uFlowTime:      { value: 0 },
      uFogTime:       { value: 0 },
      uBeamXFrac:     { value: 0.0 },
      uBeamYFrac:     { value: 0.0 },
      uFlowSpeed:     { value: 0.35 },
      uVLenFactor:    { value: 2.0 },
      uHLenFactor:    { value: 0.5 },
      uFogIntensity:  { value: 0.45 },
      uFogScale:      { value: 0.3 },
      uWSpeed:        { value: 15.0 },
      uWIntensity:    { value: 5.0 },
      uFlowStrength:  { value: 0.25 },
      uDecay:         { value: 1.1 },
      uFalloffStart:  { value: 1.2 },
      uFogFallSpeed:  { value: 0.6 },
      uColor:         { value: new THREE.Vector3(col.r, col.g, col.b) },
      uFade:          { value: 0 }
    };

    const mat = new THREE.RawShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, uniforms,
      transparent: false, depthTest: false, depthWrite: false
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    scene.add(mesh);

    const clock = new THREE.Clock();
    let prevT = 0, fade = 0, faded = false;

    function setSizeLaser() {
      const w = window.innerWidth, h = window.innerHeight;
      const pr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(pr);
      renderer.setSize(w, h, false);
      uniforms.iResolution.value.set(w * pr, h * pr, pr);
    }
    setSizeLaser();
    window.addEventListener('resize', setSizeLaser);

    let rafLaser;
    function animateLaser() {
      rafLaser = requestAnimationFrame(animateLaser);
      const t  = clock.getElapsedTime();
      const dt = Math.max(0, t - prevT);
      prevT = t;
      const cdt = Math.min(0.033, Math.max(0.001, dt));
      uniforms.iTime.value   = t;
      uniforms.uFlowTime.value += cdt;
      uniforms.uFogTime.value  += cdt;
      if (!faded) {
        fade = Math.min(1, fade + cdt / 1.2);
        uniforms.uFade.value = fade;
        if (fade >= 1) faded = true;
      }
      // Update color each frame (so theme switch works)
      const c = getColor();
      uniforms.uColor.value.set(c.r, c.g, c.b);
      renderer.render(scene, camera);
    }
    animateLaser();

    return () => { cancelAnimationFrame(rafLaser); renderer.dispose(); };
  }

  /* ═══════════════════════════════════════════════════════════
     4. SHAPE BLUR — THREE.js WebGL shape behind hero text
     Ported from ShapeBlur.jsx (variation 0 = rounded rect stroke)
  ═══════════════════════════════════════════════════════════ */
  function initShapeBlur() {
    if (typeof THREE === 'undefined') return;
    const canvas = document.getElementById('shape-blur-canvas');
    if (!canvas) return;

    const vertSrc = `
varying vec2 v_texcoord;
void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);v_texcoord=uv;}`;

    const fragSrc = `
varying vec2 v_texcoord;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_shapeSize;
uniform float u_roundness;
uniform float u_borderSize;
uniform float u_circleSize;
uniform float u_circleEdge;
#define PI 3.14159265359
#define TWO_PI 6.28318530718
vec2 coord(in vec2 p){
  p=p/u_resolution.xy;
  if(u_resolution.x>u_resolution.y){p.x*=u_resolution.x/u_resolution.y;p.x+=(u_resolution.y-u_resolution.x)/u_resolution.y/2.0;}
  else{p.y*=u_resolution.y/u_resolution.x;p.y+=(u_resolution.x-u_resolution.y)/u_resolution.x/2.0;}
  p-=0.5;p*=vec2(-1.0,1.0);return p;
}
float sdRoundRect(vec2 p,vec2 b,float r){vec2 d=abs(p-0.5)*4.2-b+vec2(r);return min(max(d.x,d.y),0.0)+length(max(d,0.0))-r;}
float sdCircle(in vec2 st,in vec2 center){return length(st-center)*2.0;}
float aastep(float threshold,float value){float afwidth=length(vec2(dFdx(value),dFdy(value)))*0.70710678118654757;return smoothstep(threshold-afwidth,threshold+afwidth,value);}
float fill(in float x){return 1.0-aastep(0.0,x);}
float fill(float x,float size,float edge){return 1.0-smoothstep(size-edge,size+edge,x);}
float strokeAA(float x,float size,float w,float edge){float afwidth=length(vec2(dFdx(x),dFdy(x)))*0.70710678;float d=smoothstep(size-edge-afwidth,size+edge+afwidth,x+w*0.5)-smoothstep(size-edge-afwidth,size+edge+afwidth,x-w*0.5);return clamp(d,0.0,1.0);}
void main(){
  vec2 st=coord(gl_FragCoord.xy)+0.5;
  vec2 posMouse=coord(u_mouse*u_pixelRatio)*vec2(1.,-1.)+0.5;
  float sdfCircle=fill(sdCircle(st,posMouse),u_circleSize,u_circleEdge);
  float sdf=sdRoundRect(st,vec2(u_shapeSize),u_roundness);
  sdf=strokeAA(sdf,0.0,u_borderSize,sdfCircle)*4.0;
  gl_FragColor=vec4(vec3(1.0),sdf);
}`;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setClearColor(0, 0);

    const scene  = new THREE.Scene();
    const camera = new THREE.OrthographicCamera();
    camera.position.z = 1;

    const geo = new THREE.PlaneGeometry(1, 1);
    const vMouseDamp = new THREE.Vector2();
    const vMouse     = new THREE.Vector2();
    const vRes       = new THREE.Vector2();

    const mat = new THREE.ShaderMaterial({
      vertexShader: vertSrc, fragmentShader: fragSrc,
      uniforms: {
        u_mouse:       { value: vMouseDamp },
        u_resolution:  { value: vRes },
        u_pixelRatio:  { value: 2 },
        u_shapeSize:   { value: 1.2 },
        u_roundness:   { value: 0.4 },
        u_borderSize:  { value: 0.05 },
        u_circleSize:  { value: 0.3 },
        u_circleEdge:  { value: 0.5 }
      },
      transparent: true
    });
    const quad = new THREE.Mesh(geo, mat);
    scene.add(quad);

    function resizeSB() {
      const w = homeContainer?.clientWidth  || window.innerWidth;
      const h = homeContainer?.clientHeight || window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio, 2);
      renderer.setSize(w, h);
      renderer.setPixelRatio(dpr);
      camera.left = -w/2; camera.right = w/2;
      camera.top  =  h/2; camera.bottom = -h/2;
      camera.updateProjectionMatrix();
      quad.scale.set(w, h, 1);
      vRes.set(w, h).multiplyScalar(dpr);
      mat.uniforms.u_pixelRatio.value = dpr;
    }
    resizeSB();
    window.addEventListener('resize', resizeSB);

    document.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      vMouse.set(e.clientX - rect.left, e.clientY - rect.top);
    }, { passive: true });

    let lastSBT = 0, rafSB;
    function animSB(now) {
      rafSB = requestAnimationFrame(animSB);
      const dt = (now - lastSBT) * 0.001;
      lastSBT = now;
      ['x','y'].forEach(k => {
        vMouseDamp[k] += (vMouse[k] - vMouseDamp[k]) * Math.min(1, 8 * dt);
      });
      renderer.render(scene, camera);
    }
    animSB(0);
    return () => { cancelAnimationFrame(rafSB); renderer.dispose(); };
  }

  /* ═══════════════════════════════════════════════════════════
     5. GRADUAL BLUR — layered backdrop-filter divs
     Ported from GradualBlur.jsx
  ═══════════════════════════════════════════════════════════ */
  function initGradualBlur() {
    const wrapper = document.getElementById('gradual-blur');
    if (!wrapper) return;

    const config = {
      position:    'bottom',
      strength:    2.5,
      height:      '80px',
      divCount:    6,
      exponential: true,
      curve:       'bezier',
      opacity:     1
    };

    function bezier(p) { return p * p * (3 - 2 * p); }
    function curveFunc(p) { return bezier(p); }

    const direction = 'to bottom';
    const inner = document.createElement('div');
    inner.style.cssText = 'position:relative;width:100%;height:100%;';

    const inc = 100 / config.divCount;
    for (let i = 1; i <= config.divCount; i++) {
      let progress = curveFunc(i / config.divCount);
      let blur;
      if (config.exponential) {
        blur = Math.pow(2, progress * 4) * 0.0625 * config.strength;
      } else {
        blur = 0.0625 * (progress * config.divCount + 1) * config.strength;
      }
      const p1 = Math.round((inc * i - inc) * 10) / 10;
      const p2 = Math.round(inc * i * 10) / 10;
      const p3 = Math.round((inc * i + inc) * 10) / 10;
      let grad = `transparent ${p1}%, black ${p2}%`;
      if (p3 <= 100) grad += `, black ${p3}%`;

      const d = document.createElement('div');
      d.style.cssText = `
        position:absolute; inset:0;
        mask-image:linear-gradient(${direction}, ${grad});
        -webkit-mask-image:linear-gradient(${direction}, ${grad});
        backdrop-filter:blur(${blur.toFixed(3)}rem);
        -webkit-backdrop-filter:blur(${blur.toFixed(3)}rem);
        opacity:${config.opacity};
      `;
      inner.appendChild(d);
    }

    wrapper.style.cssText = `
      position:absolute; bottom:0; left:0; right:0;
      height:${config.height};
      pointer-events:none; z-index:10;
    `;
    wrapper.appendChild(inner);
  }

  /* ═══════════════════════════════════════════════════════════
     6. FADE CONTENT — IntersectionObserver scroll reveal + blur
     Ported from FadeContent.jsx (uses CSS classes instead of GSAP)
  ═══════════════════════════════════════════════════════════ */
  function initFadeContent() {
    document.querySelectorAll('.fade-content').forEach(el => {
      const dur   = (el.dataset.fadeDuration || 900) + 'ms';
      const delay = (el.dataset.fadeDelay    || 0)   + 'ms';
      const blur  = el.dataset.fadeBlur === 'true';

      el.style.setProperty('--fc-dur', dur);
      el.style.transitionDelay = delay;

      if (blur) el.classList.add('fc-blur');

      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Small rAF so transition actually fires after display
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                el.classList.add('fc-visible');
              });
            });
            io.unobserve(el);
          }
        });
      }, { threshold: 0.1 });
      io.observe(el);
    });
  }

  /* ═══════════════════════════════════════════════════════════
     CURSOR TRAIL (desktop only)
  ═══════════════════════════════════════════════════════════ */
  function initCursor() {
    if (!isDesktop()) return;
    const canvas = document.createElement('canvas');
    canvas.id = 'cursor-canvas';
    Object.assign(canvas.style, {
      position:'fixed', top:'0', left:'0',
      width:'100%', height:'100%',
      pointerEvents:'none', zIndex:'9999',
      mixBlendMode:'screen'
    });
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    const mouse = { x:-300, y:-300 };
    let hue = 10;
    const particles = [], trail = [];
    const TRAIL_LEN = 26, MAX_P = 80;

    class Particle {
      constructor(x, y, h) {
        this.x = x; this.y = y; this.hue = h;
        this.size  = Math.random() * 3.5 + 1.2;
        this.life  = 1; this.decay = Math.random() * 0.018 + 0.012;
        this.vx = (Math.random()-0.5)*2; this.vy = (Math.random()-0.5)*2;
        this.grav = 0.04;
      }
      update() { this.vy += this.grav; this.x += this.vx; this.y += this.vy; this.life -= this.decay; this.size *= 0.97; }
      draw() {
        const a = Math.max(0, this.life);
        ctx.save(); ctx.globalAlpha = a;
        const g = ctx.createRadialGradient(this.x,this.y,0, this.x,this.y,this.size*2.8);
        g.addColorStop(0,   `hsla(${this.hue},100%,85%,1)`);
        g.addColorStop(0.4, `hsla(${this.hue},100%,65%,0.5)`);
        g.addColorStop(1,   `hsla(${this.hue},100%,45%,0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(this.x,this.y,this.size*2.8,0,Math.PI*2); ctx.fill(); ctx.restore();
      }
    }

    document.addEventListener('mousemove', e => {
      mouse.x = e.clientX; mouse.y = e.clientY;
      hue = (hue + 1.3) % 360;
      for (let i=0;i<2;i++) particles.push(new Particle(mouse.x+(Math.random()-.5)*6, mouse.y+(Math.random()-.5)*6, hue+(Math.random()*20-10)));
      trail.push({x:mouse.x, y:mouse.y, h:hue});
      if (trail.length > TRAIL_LEN) trail.shift();
    });

    document.addEventListener('click', e => {
      for (let i=0;i<22;i++) {
        const p = new Particle(e.clientX,e.clientY,hue+(Math.random()*60-30));
        p.vx=(Math.random()-.5)*8; p.vy=(Math.random()-.5)*8; p.size=Math.random()*5+2; p.decay=0.022; p.grav=0.06;
        particles.push(p);
      }
    });

    (function loop() {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      // trail
      if (trail.length >= 2) {
        for (let i=1;i<trail.length;i++) {
          const t=i/trail.length;
          ctx.save(); ctx.globalAlpha=t*0.6; ctx.strokeStyle=`hsl(${trail[i].h},100%,68%)`;
          ctx.lineWidth=t*2.8; ctx.lineCap='round';
          ctx.shadowBlur=12; ctx.shadowColor=`hsl(${trail[i].h},100%,68%)`;
          ctx.beginPath(); ctx.moveTo(trail[i-1].x,trail[i-1].y); ctx.lineTo(trail[i].x,trail[i].y); ctx.stroke(); ctx.restore();
        }
      }
      // orb
      if (mouse.x >= 0) {
        const g = ctx.createRadialGradient(mouse.x,mouse.y,0, mouse.x,mouse.y,16);
        g.addColorStop(0,    `hsla(${hue},100%,96%,1)`);
        g.addColorStop(0.25, `hsla(${hue},100%,75%,0.7)`);
        g.addColorStop(1,    `hsla(${hue},100%,50%,0)`);
        ctx.save(); ctx.shadowBlur=24; ctx.shadowColor=`hsl(${hue},100%,68%)`; ctx.fillStyle=g;
        ctx.beginPath(); ctx.arc(mouse.x,mouse.y,16,0,Math.PI*2); ctx.fill();
        ctx.globalAlpha=1; ctx.shadowBlur=0; ctx.fillStyle='#ffffff';
        ctx.beginPath(); ctx.arc(mouse.x,mouse.y,2.5,0,Math.PI*2); ctx.fill(); ctx.restore();
      }
      // particles
      for (let i=particles.length-1;i>=0;i--) {
        particles[i].update(); particles[i].draw();
        if (particles[i].life<=0||particles[i].size<0.2) particles.splice(i,1);
      }
      while (particles.length > MAX_P) particles.shift();
      requestAnimationFrame(loop);
    })();
  }

  /* ═══════════════════════════════════════════════════════════
     LOADING SCREEN
  ═══════════════════════════════════════════════════════════ */
  let progress = 0;
  const loadInterval = setInterval(() => {
    progress += Math.random() * 10;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loadInterval);
      if (loadingContent) loadingContent.style.setProperty('--load-pct','100%');
      setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
          loadingScreen.style.display = 'none';
          animateContent();
          startRotation();
        }, 700);
      }, 800);
    }
    loadingProgress.textContent = progress.toFixed(2);
    if (loadingContent) loadingContent.style.setProperty('--load-pct', progress + '%');
  }, 200);

  /* ─── Loading image stack ──────────────────────────────────────────── */
  let currentIdx = 0, rotTimer = null;
  function rotateImages() {
    stackImages.forEach((img, i) => {
      if (i === currentIdx) {
        img.style.zIndex='3'; img.style.transform='rotate(-4deg) scale(1.08)'; img.style.opacity='1';
      } else if (i === (currentIdx+1) % stackImages.length) {
        img.style.zIndex='2'; img.style.transform='rotate(4deg) scale(1.04)'; img.style.opacity='0.65';
      } else {
        img.style.zIndex='1'; img.style.transform='rotate(-2deg) scale(1)'; img.style.opacity='0.4';
      }
    });
    currentIdx = (currentIdx+1) % stackImages.length;
  }
  function startRotation() { rotateImages(); rotTimer = setInterval(rotateImages, 2000); }
  document.querySelector('.image-stack')?.addEventListener('click', () => {
    clearInterval(rotTimer); rotateImages(); rotTimer = setInterval(rotateImages, 2000);
  });

  /* ─── Theme toggle ─────────────────────────────────────────────────── */
  themeSwitch?.addEventListener('change', () => {
    document.body.classList.toggle('light-theme');
    updateTheme();
  });
  function updateTheme() {
    const light = document.body.classList.contains('light-theme');
    const set = (k,v) => document.documentElement.style.setProperty(k,v);
    if (light) {
      set('--c1','#0057ff'); set('--c2','#00c2ff');
      set('--c1-dim','rgba(0,87,255,0.12)'); set('--c1-glow','rgba(0,87,255,0.4)');
      set('--text','#0d0d14'); set('--eb-color','#0057ff');
      if (backgroundEl) backgroundEl.style.backgroundImage = "url('./assets/background12.gif')";
    } else {
      set('--c1','#ff2d2d'); set('--c2','#ff6b00');
      set('--c1-dim','rgba(255,45,45,0.18)'); set('--c1-glow','rgba(255,45,45,0.5)');
      set('--text','#f0ece8'); set('--eb-color','#ff2d2d');
      if (backgroundEl) backgroundEl.style.backgroundImage = "url('./assets/background.gif')";
    }
  }

  /* ─── Content entrance ─────────────────────────────────────────────── */
  function animateContent() {
    if (profilePic) {
      profilePic.style.opacity='0'; profilePic.style.transform='scale(0.6)';
      setTimeout(() => {
        profilePic.style.transition='opacity 0.8s ease, transform 0.8s cubic-bezier(0.34,1.56,0.64,1)';
        profilePic.style.opacity='1'; profilePic.style.transform='scale(1)';
      }, 80);
    }
    [username, bio, contactsHeading].forEach((el, i) => {
      if (!el) return;
      el.style.opacity='0'; el.style.transform='translateY(12px)';
      setTimeout(() => {
        el.style.transition='opacity 0.7s ease, transform 0.7s ease';
        el.style.opacity='1'; el.style.transform='translateY(0)';
      }, 260 + i*140);
    });
    links.forEach((link, i) => {
      link.style.opacity='0'; link.style.transform='translateX(-14px)';
      setTimeout(() => {
        link.style.transition='opacity 0.6s ease, transform 0.6s cubic-bezier(0.34,1.3,0.64,1)';
        link.style.opacity='1'; link.style.transform='translateX(0)';
      }, 550 + i*80);
    });
  }

  /* ─── Discord copy ─────────────────────────────────────────────────── */
  discordBtn?.addEventListener('click', e => {
    e.preventDefault();
    navigator.clipboard?.writeText('px93').then(() => {
      copyNotif.classList.add('show');
      setTimeout(() => copyNotif.classList.remove('show'), 2200);
    });
  });

  /* ─── Mods accordion ───────────────────────────────────────────────── */
  modHeaders.forEach(header => {
    const content = header.nextElementSibling;
    const icon    = header.querySelector('.toggle-icon');
    header.addEventListener('click', () => {
      const isOpen = header.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        content.classList.remove('open');
        header.setAttribute('aria-expanded','false');
        icon.textContent = '+';
      } else {
        content.removeAttribute('hidden');
        content.classList.add('open');
        header.setAttribute('aria-expanded','true');
        icon.textContent = '−';
      }
    });
  });

  /* ─── Smooth scroll ────────────────────────────────────────────────── */
  navButtons.forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const id = btn.getAttribute('href')?.substring(1);
      if (id) document.getElementById(id)?.scrollIntoView({ behavior:'smooth' });
    });
  });

  /* ─── Mobile menu ──────────────────────────────────────────────────── */
  mobileToggle?.addEventListener('click', () => {
    const open = mobileMenu?.classList.toggle('active');
    mobileToggle.classList.toggle('active');
    mobileToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (mobileMenu) mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
  });
  document.querySelectorAll('.mobile-menu-item').forEach(item => {
    item.addEventListener('click', () => {
      mobileToggle?.classList.remove('active');
      mobileMenu?.classList.remove('active');
      mobileToggle?.setAttribute('aria-expanded','false');
      mobileMenu?.setAttribute('aria-hidden','true');
    });
  });

  /* ─── Parallax (desktop) ───────────────────────────────────────────── */
  window.addEventListener('mousemove', e => {
    if (!isDesktop()) return;
    const mx = e.clientX / window.innerWidth;
    const my = e.clientY / window.innerHeight;
    if (backgroundEl) backgroundEl.style.transform = `translate(${mx*8}px,${my*8}px)`;
    if (textGlow) textGlow.style.transform = `translate(${(mx-.5)*-22}px,${(my-.5)*-14}px)`;
  }, { passive:true });

  /* ─── Scroll: parallax + active nav ───────────────────────────────── */
  window.addEventListener('scroll', () => {
    if (isDesktop() && homeContainer) homeContainer.style.transform = `translateY(${window.scrollY*.28}px)`;
    const sections = ['home','contact','mods'];
    let current = '';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 120) current = id;
    });
    navButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('href') === `#${current}`);
    });
  }, { passive:true });

  /* ─── Mobile parallax reset ────────────────────────────────────────── */
  function mobileReset() {
    if (window.innerWidth <= 768 && textGlow) textGlow.style.transform = '';
  }
  window.addEventListener('load',   mobileReset);
  window.addEventListener('resize', mobileReset);

  /* ─── Mobile touch links ───────────────────────────────────────────── */
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    links.forEach(link => {
      link.addEventListener('touchstart', () => { link.style.transform = 'translateX(6px)'; }, { passive:true });
      link.addEventListener('touchend',   () => { setTimeout(() => { link.style.transform = ''; }, 300); });
    });
  }

  /* ─── INIT all systems ─────────────────────────────────────────────── */
  updateTheme();
  initStarBorder();
  initElectricBorder();
  initLaserFlow();
  initShapeBlur();
  initGradualBlur();
  initFadeContent();
  initCursor();
});