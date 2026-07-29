import type { ReactNode, SVGProps } from 'react';

/** Profession mascot illustrations — ported from ProfyDesign/templates/profy-app/MascotFigure.dc.html */
export type MascotKind =
  | 'it' | 'ai' | 'data' | 'design' | 'med' | 'science' | 'psy'
  | 'business' | 'finance' | 'law' | 'media' | 'eng' | 'marketing' | 'eco' | 'pm';

export interface MascotProps extends Omit<SVGProps<SVGSVGElement>, 'viewBox' | 'children'> {
  kind: MascotKind;
}

export function Mascot({ kind, ...props }: MascotProps) {
  return (
    <svg viewBox="0 0 260 370" preserveAspectRatio="xMidYMax meet" aria-hidden="true" {...props}>
      {MASCOT_BODY[kind] ?? MASCOT_BODY.it}
    </svg>
  );
}

const MASCOT_BODY: Record<MascotKind, ReactNode> = {
  it: (
    <>
      <path d="M116,300 Q108,326 100,342" fill="none" stroke="#3B2A63" strokeWidth="30" strokeLinecap="round"></path>
      <path d="M144,300 Q152,326 160,342" fill="none" stroke="#3B2A63" strokeWidth="30" strokeLinecap="round"></path>
      <ellipse cx="92" cy="346" rx="24" ry="13" fill="#E8E2FA"></ellipse>
      <ellipse cx="168" cy="346" rx="24" ry="13" fill="#E8E2FA"></ellipse>
      <path d="M84,182 Q82,168 130,168 Q178,168 176,182 L188,286 Q190,312 130,312 Q70,312 72,286 Z" fill="#7C3AED"></path>
      <path d="M78,270 Q130,300 182,270 L188,286 Q190,312 130,312 Q70,312 72,286 Z" fill="#6A28D9"></path>
      <g transform="rotate(3 130 104)">
        <circle cx="69" cy="106" r="11" fill="#C68642"></circle><circle cx="191" cy="106" r="11" fill="#C68642"></circle>
        <rect x="121" y="150" width="18" height="22" rx="9" fill="#C68642"></rect>
        <circle cx="130" cy="100" r="62" fill="#C68642"></circle>
        <path d="M66,112 C58,40 100,30 130,30 C160,30 202,40 194,112 C190,88 176,80 168,80 Q150,70 118,76 Q92,82 84,102 C80,90 74,84 66,112 Z" fill="#2E2118"></path>
        <circle cx="100" cy="122" r="7.5" fill="#B4693F" opacity=".45"></circle><circle cx="160" cy="122" r="7.5" fill="#B4693F" opacity=".45"></circle>
        <path d="M102,92 Q111,88 120,92" fill="none" stroke="#2E2118" strokeWidth="4.5" strokeLinecap="round"></path>
        <path d="M140,92 Q149,88 158,92" fill="none" stroke="#2E2118" strokeWidth="4.5" strokeLinecap="round"></path>
        <ellipse cx="112" cy="104" rx="9" ry="10" fill="#fff"></ellipse><ellipse cx="148" cy="104" rx="9" ry="10" fill="#fff"></ellipse>
        <circle cx="113" cy="105" r="5.5" fill="#2A2438"></circle><circle cx="149" cy="105" r="5.5" fill="#2A2438"></circle>
        <circle cx="115" cy="102" r="2.2" fill="#fff"></circle><circle cx="151" cy="102" r="2.2" fill="#fff"></circle>
        <path d="M114,122 Q130,127 146,122 Q143,139 130,139 Q117,139 114,122 Z" fill="#7A3B44"></path>
        <path d="M119,123 L141,123 Q139,127 130,127 Q121,127 119,123 Z" fill="#fff"></path>
      </g>
      <path d="M92,196 C78,225 82,248 108,258" fill="none" stroke="#7C3AED" strokeWidth="26" strokeLinecap="round"></path>
      <path d="M168,196 C182,225 178,248 152,258" fill="none" stroke="#7C3AED" strokeWidth="26" strokeLinecap="round"></path>
      <rect x="90" y="206" width="80" height="54" rx="7" fill="#334155"></rect>
      <rect x="97" y="213" width="66" height="40" rx="4" fill="#EDE9FE"></rect>
      <text x="130" y="240" textAnchor="middle" fontFamily="monospace" fontSize="20" fontWeight="900" fill="#7C3AED">&lt;/&gt;</text>
      <rect x="82" y="258" width="96" height="12" rx="6" fill="#475569"></rect>
      <circle cx="108" cy="260" r="13" fill="#C68642"></circle><circle cx="152" cy="260" r="13" fill="#C68642"></circle>
    </>
  ),
  ai: (
    <>
      <path d="M120,300 Q118,326 116,342" fill="none" stroke="#312B5E" strokeWidth="30" strokeLinecap="round"></path>
      <path d="M140,300 Q142,326 144,342" fill="none" stroke="#312B5E" strokeWidth="30" strokeLinecap="round"></path>
      <ellipse cx="108" cy="346" rx="23" ry="13" fill="#DEDBF7"></ellipse><ellipse cx="152" cy="346" rx="23" ry="13" fill="#DEDBF7"></ellipse>
      <path d="M90,198 C74,232 78,266 92,290" fill="none" stroke="#4F46E5" strokeWidth="26" strokeLinecap="round"></path>
      <path d="M170,196 C192,206 202,232 196,258" fill="none" stroke="#4F46E5" strokeWidth="26" strokeLinecap="round"></path>
      <path d="M84,182 Q82,168 130,168 Q178,168 176,182 L188,286 Q190,312 130,312 Q70,312 72,286 Z" fill="#4F46E5"></path>
      <path d="M78,270 Q130,300 182,270 L188,286 Q190,312 130,312 Q70,312 72,286 Z" fill="#4338CA"></path>
      <circle cx="92" cy="292" r="13" fill="#A9744F"></circle>
      <circle cx="198" cy="260" r="13" fill="#A9744F"></circle>
      <rect x="182" y="222" width="34" height="34" rx="8" fill="#312E81"></rect>
      <rect x="190" y="230" width="18" height="18" rx="4" fill="#A5B4FC"></rect>
      <circle cx="199" cy="239" r="4" fill="#4338CA"></circle>
      <path d="M199,214 L199,222 M182,239 L174,239 M216,239 L224,239 M199,256 L199,264" stroke="#312E81" strokeWidth="3" strokeLinecap="round"></path>
      <g>
        <circle cx="69" cy="106" r="11" fill="#A9744F"></circle><circle cx="191" cy="106" r="11" fill="#A9744F"></circle>
        <rect x="121" y="150" width="18" height="22" rx="9" fill="#A9744F"></rect>
        <circle cx="130" cy="100" r="62" fill="#A9744F"></circle>
        <path d="M66,112 C56,40 102,28 130,28 C158,28 204,40 194,112 C192,92 182,86 176,88 Q170,74 156,80 Q150,68 138,76 Q130,66 122,76 Q110,68 104,80 Q90,74 84,88 Q78,86 66,112 Z" fill="#221A12"></path>
        <circle cx="86" cy="72" r="9" fill="#2E2318"></circle><circle cx="110" cy="60" r="9" fill="#2E2318"></circle><circle cx="130" cy="56" r="9" fill="#2E2318"></circle><circle cx="150" cy="60" r="9" fill="#2E2318"></circle><circle cx="174" cy="72" r="9" fill="#2E2318"></circle>
        <circle cx="100" cy="122" r="7.5" fill="#8A5A38" opacity=".45"></circle><circle cx="160" cy="122" r="7.5" fill="#8A5A38" opacity=".45"></circle>
        <path d="M101,91 Q111,87 121,91" fill="none" stroke="#221A12" strokeWidth="4.5" strokeLinecap="round"></path>
        <path d="M139,91 Q149,87 159,91" fill="none" stroke="#221A12" strokeWidth="4.5" strokeLinecap="round"></path>
        <ellipse cx="112" cy="104" rx="9" ry="10" fill="#fff"></ellipse><ellipse cx="148" cy="104" rx="9" ry="10" fill="#fff"></ellipse>
        <circle cx="114" cy="104" r="5.5" fill="#2A2438"></circle><circle cx="150" cy="104" r="5.5" fill="#2A2438"></circle>
        <circle cx="116" cy="101" r="2.2" fill="#fff"></circle><circle cx="152" cy="101" r="2.2" fill="#fff"></circle>
        <path d="M118,124 Q130,130 142,124" fill="none" stroke="#3A2418" strokeWidth="4" strokeLinecap="round"></path>
      </g>
    </>
  ),
  data: (
    <>
      <path d="M116,300 Q108,326 100,342" fill="none" stroke="#1E3A8A" strokeWidth="30" strokeLinecap="round"></path>
      <path d="M144,300 Q152,326 160,342" fill="none" stroke="#1E3A8A" strokeWidth="30" strokeLinecap="round"></path>
      <ellipse cx="92" cy="346" rx="24" ry="13" fill="#DBE6FB"></ellipse><ellipse cx="168" cy="346" rx="24" ry="13" fill="#DBE6FB"></ellipse>
      <path d="M84,182 Q82,168 130,168 Q178,168 176,182 L188,286 Q190,312 130,312 Q70,312 72,286 Z" fill="#2563EB"></path>
      <path d="M78,270 Q130,300 182,270 L188,286 Q190,312 130,312 Q70,312 72,286 Z" fill="#1D4ED8"></path>
      <path d="M92,196 C80,224 84,246 106,256" fill="none" stroke="#2563EB" strokeWidth="26" strokeLinecap="round"></path>
      <path d="M168,196 C180,224 176,246 154,256" fill="none" stroke="#2563EB" strokeWidth="26" strokeLinecap="round"></path>
      <rect x="92" y="204" width="76" height="56" rx="8" fill="#0F172A"></rect>
      <rect x="99" y="211" width="62" height="42" rx="4" fill="#E0ECFF"></rect>
      <rect x="105" y="234" width="9" height="14" fill="#2563EB"></rect>
      <rect x="118" y="226" width="9" height="22" fill="#38BDF8"></rect>
      <rect x="131" y="230" width="9" height="18" fill="#2563EB"></rect>
      <rect x="144" y="220" width="9" height="28" fill="#38BDF8"></rect>
      <circle cx="106" cy="258" r="13" fill="#E8B48C"></circle><circle cx="154" cy="258" r="13" fill="#E8B48C"></circle>
      <g transform="rotate(-3 130 104)">
        <circle cx="69" cy="106" r="11" fill="#E8B48C"></circle><circle cx="191" cy="106" r="11" fill="#E8B48C"></circle>
        <rect x="121" y="150" width="18" height="22" rx="9" fill="#E8B48C"></rect>
        <circle cx="130" cy="100" r="62" fill="#E8B48C"></circle>
        <path d="M66,116 C58,42 102,30 130,30 C160,30 204,42 194,116 C192,96 182,86 172,86 Q140,72 108,82 Q88,90 84,110 C78,94 72,92 66,116 Z" fill="#4A3220"></path>
        <path d="M190,104 Q214,120 208,158 Q200,140 186,132 Q192,118 190,104 Z" fill="#4A3220"></path>
        <circle cx="100" cy="122" r="7.5" fill="#C98A5C" opacity=".45"></circle><circle cx="160" cy="122" r="7.5" fill="#C98A5C" opacity=".45"></circle>
        <path d="M101,91 L120,93" stroke="#4A3220" strokeWidth="4.5" strokeLinecap="round"></path>
        <path d="M159,91 L140,93" stroke="#4A3220" strokeWidth="4.5" strokeLinecap="round"></path>
        <ellipse cx="112" cy="104" rx="9" ry="10" fill="#fff"></ellipse><ellipse cx="148" cy="104" rx="9" ry="10" fill="#fff"></ellipse>
        <circle cx="113" cy="105" r="5.5" fill="#2A2438"></circle><circle cx="149" cy="105" r="5.5" fill="#2A2438"></circle>
        <circle cx="115" cy="102" r="2.2" fill="#fff"></circle><circle cx="151" cy="102" r="2.2" fill="#fff"></circle>
        <path d="M117,123 Q130,128 143,123" fill="none" stroke="#3A2418" strokeWidth="4" strokeLinecap="round"></path>
      </g>
    </>
  ),
  design: (
    <>
      <path d="M116,300 Q114,326 112,342" fill="none" stroke="#3F5BA9" strokeWidth="30" strokeLinecap="round"></path>
      <path d="M144,300 Q164,318 180,322" fill="none" stroke="#3F5BA9" strokeWidth="30" strokeLinecap="round"></path>
      <ellipse cx="104" cy="346" rx="23" ry="13" fill="#EC4899"></ellipse>
      <ellipse cx="186" cy="324" rx="23" ry="12" fill="#EC4899" transform="rotate(18 186 324)"></ellipse>
      <path d="M90,196 C66,204 56,176 60,150" fill="none" stroke="#F472B6" strokeWidth="26" strokeLinecap="round"></path>
      <path d="M84,182 Q82,168 130,168 Q178,168 176,182 L188,286 Q190,312 130,312 Q70,312 72,286 Z" fill="#F472B6"></path>
      <path d="M104,182 L104,300 L156,300 L156,182 Q156,250 130,250 Q104,250 104,182 Z" fill="#3F5BA9"></path>
      <rect x="100" y="168" width="13" height="60" rx="6" fill="#3F5BA9" transform="rotate(-6 106 198)"></rect>
      <rect x="147" y="168" width="13" height="60" rx="6" fill="#3F5BA9" transform="rotate(6 154 198)"></rect>
      <rect x="118" y="252" width="24" height="18" rx="4" fill="#33488A"></rect>
      <path d="M170,196 C196,206 206,226 202,248" fill="none" stroke="#F472B6" strokeWidth="26" strokeLinecap="round"></path>
      <circle cx="202" cy="250" r="13" fill="#D99A6C"></circle>
      <ellipse cx="212" cy="250" rx="28" ry="20" fill="#F3E7D3"></ellipse>
      <ellipse cx="216" cy="256" rx="7" ry="5" fill="#FBFAFF"></ellipse>
      <circle cx="200" cy="242" r="4.5" fill="#EF4444"></circle><circle cx="214" cy="238" r="4.5" fill="#F59E0B"></circle>
      <circle cx="226" cy="244" r="4.5" fill="#14B8A6"></circle><circle cx="204" cy="256" r="4.5" fill="#7C3AED"></circle>
      <circle cx="60" cy="150" r="13" fill="#D99A6C"></circle>
      <rect x="56" y="96" width="9" height="52" rx="4.5" fill="#C2842E"></rect>
      <path d="M55,96 L66,96 L63,80 L58,80 Z" fill="#9CA3AF"></path>
      <path d="M58,80 L63,80 L62,66 Q60,62 59,66 Z" fill="#EF4444"></path>
      <g transform="rotate(-7 130 104)">
        <circle cx="69" cy="106" r="11" fill="#D99A6C"></circle><circle cx="191" cy="106" r="11" fill="#D99A6C"></circle>
        <rect x="121" y="150" width="18" height="22" rx="9" fill="#D99A6C"></rect>
        <circle cx="130" cy="100" r="62" fill="#D99A6C"></circle>
        <path d="M64,120 C56,40 104,28 130,28 C158,28 206,42 196,118 L198,150 Q190,120 186,100 Q184,74 130,72 Q84,74 78,104 L72,158 Q62,132 64,120 Z" fill="#8B2FB8"></path>
        <path d="M130,28 Q174,40 190,84 Q164,66 130,66 Q120,66 112,68 Q120,44 130,28 Z" fill="#EC4899"></path>
        <circle cx="100" cy="122" r="8" fill="#C97C4E" opacity=".5"></circle><circle cx="160" cy="122" r="8" fill="#C97C4E" opacity=".5"></circle>
        <path d="M100,86 Q111,80 121,85" fill="none" stroke="#3A2418" strokeWidth="4.5" strokeLinecap="round"></path>
        <path d="M139,85 Q149,80 160,86" fill="none" stroke="#3A2418" strokeWidth="4.5" strokeLinecap="round"></path>
        <ellipse cx="112" cy="103" rx="10" ry="11" fill="#fff"></ellipse><ellipse cx="148" cy="103" rx="10" ry="11" fill="#fff"></ellipse>
        <circle cx="112" cy="103" r="6.5" fill="#2A2438"></circle><circle cx="148" cy="103" r="6.5" fill="#2A2438"></circle>
        <circle cx="115" cy="100" r="2.6" fill="#fff"></circle><circle cx="151" cy="100" r="2.6" fill="#fff"></circle>
        <path d="M113,120 Q130,126 147,120 Q144,141 130,141 Q116,141 113,120 Z" fill="#7A3B44"></path>
        <path d="M118,121 L142,121 Q140,126 130,126 Q120,126 118,121 Z" fill="#fff"></path>
      </g>
    </>
  ),
  med: (
    <>
      <path d="M120,300 Q118,326 116,342" fill="none" stroke="#0F766E" strokeWidth="30" strokeLinecap="round"></path>
      <path d="M140,300 Q142,326 144,342" fill="none" stroke="#0F766E" strokeWidth="30" strokeLinecap="round"></path>
      <ellipse cx="108" cy="346" rx="23" ry="13" fill="#0B4F4A"></ellipse><ellipse cx="152" cy="346" rx="23" ry="13" fill="#0B4F4A"></ellipse>
      <path d="M90,198 C74,236 78,272 94,294" fill="none" stroke="#fff" strokeWidth="26" strokeLinecap="round"></path>
      <path d="M170,196 C190,180 198,150 196,122" fill="none" stroke="#fff" strokeWidth="26" strokeLinecap="round"></path>
      <path d="M84,182 Q82,168 130,168 Q178,168 176,182 L188,286 Q190,312 130,312 Q70,312 72,286 Z" fill="#fff"></path>
      <path d="M130,168 L130,312 Q70,312 72,286 L84,182 Q82,168 130,168 Z" fill="#F1F5F8"></path>
      <path d="M112,170 L130,210 L148,170 Q130,178 112,170 Z" fill="#14B8A6"></path>
      <circle cx="130" cy="230" r="3.2" fill="#CBD5E1"></circle><circle cx="130" cy="252" r="3.2" fill="#CBD5E1"></circle><circle cx="130" cy="274" r="3.2" fill="#CBD5E1"></circle>
      <path d="M116,176 C100,210 100,244 120,258" fill="none" stroke="#0D9488" strokeWidth="6" strokeLinecap="round"></path>
      <path d="M144,176 C160,206 158,232 150,250" fill="none" stroke="#0D9488" strokeWidth="6" strokeLinecap="round"></path>
      <circle cx="122" cy="262" r="12" fill="#5EEAD4"></circle><circle cx="122" cy="262" r="6" fill="#0D9488"></circle>
      <circle cx="96" cy="296" r="13" fill="#F7D2B0"></circle>
      <circle cx="196" cy="118" r="14" fill="#F7D2B0"></circle>
      <g transform="rotate(6 130 104)">
        <circle cx="69" cy="106" r="11" fill="#F7D2B0"></circle><circle cx="191" cy="106" r="11" fill="#F7D2B0"></circle>
        <rect x="121" y="150" width="18" height="22" rx="9" fill="#F7D2B0"></rect>
        <circle cx="130" cy="100" r="62" fill="#F7D2B0"></circle>
        <path d="M66,112 C56,38 104,28 130,28 C156,28 204,38 194,112 C190,88 178,82 168,84 Q130,72 92,84 Q82,88 84,104 C78,88 70,86 66,112 Z" fill="#B5461E"></path>
        <path d="M74,102 Q80,74 130,72 Q180,74 186,102 Q178,86 130,86 Q82,86 74,102 Z" fill="#C9612F"></path>
        <ellipse cx="130" cy="34" rx="19" ry="15" fill="#B5461E"></ellipse>
        <ellipse cx="130" cy="31" rx="10" ry="8" fill="#C9612F"></ellipse>
        <circle cx="97" cy="118" r="1.8" fill="#C9714A"></circle><circle cx="104" cy="122" r="1.8" fill="#C9714A"></circle><circle cx="99" cy="126" r="1.8" fill="#C9714A"></circle>
        <circle cx="163" cy="118" r="1.8" fill="#C9714A"></circle><circle cx="156" cy="122" r="1.8" fill="#C9714A"></circle><circle cx="161" cy="126" r="1.8" fill="#C9714A"></circle>
        <circle cx="99" cy="120" r="8.5" fill="#F4978E" opacity=".4"></circle><circle cx="161" cy="120" r="8.5" fill="#F4978E" opacity=".4"></circle>
        <path d="M103,106 Q112,97 121,106" fill="none" stroke="#3A2418" strokeWidth="4.5" strokeLinecap="round"></path>
        <path d="M139,106 Q148,97 157,106" fill="none" stroke="#3A2418" strokeWidth="4.5" strokeLinecap="round"></path>
        <path d="M116,120 Q130,124 144,120 Q142,137 130,137 Q118,137 116,120 Z" fill="#8C4A57"></path>
        <path d="M122,132 Q130,139 138,132 Q130,130 122,132 Z" fill="#F26D7D"></path>
      </g>
    </>
  ),
  science: (
    <>
      <path d="M120,300 Q118,326 116,342" fill="none" stroke="#155E75" strokeWidth="30" strokeLinecap="round"></path>
      <path d="M140,300 Q142,326 144,342" fill="none" stroke="#155E75" strokeWidth="30" strokeLinecap="round"></path>
      <ellipse cx="108" cy="346" rx="23" ry="13" fill="#CFEFF6"></ellipse><ellipse cx="152" cy="346" rx="23" ry="13" fill="#CFEFF6"></ellipse>
      <path d="M92,198 C78,232 82,262 100,282" fill="none" stroke="#fff" strokeWidth="26" strokeLinecap="round"></path>
      <path d="M168,196 C186,214 190,240 180,262" fill="none" stroke="#fff" strokeWidth="26" strokeLinecap="round"></path>
      <path d="M84,182 Q82,168 130,168 Q178,168 176,182 L188,286 Q190,312 130,312 Q70,312 72,286 Z" fill="#fff"></path>
      <path d="M130,168 L130,312 Q70,312 72,286 L84,182 Q82,168 130,168 Z" fill="#EEF6F8"></path>
      <path d="M112,170 L130,206 L148,170 Q130,178 112,170 Z" fill="#0891B2"></path>
      <circle cx="100" cy="284" r="13" fill="#F2C9A0"></circle>
      <circle cx="182" cy="264" r="13" fill="#F2C9A0"></circle>
      <path d="M176,214 L176,232 L162,262 Q160,276 176,276 Q192,276 190,262 L184,232 L184,214 Z" fill="#BAE6FD" stroke="#0891B2" strokeWidth="3"></path>
      <path d="M167,254 Q176,250 185,254 L188,262 Q160,262 164,254 Z" fill="#22D3EE"></path>
      <rect x="172" y="208" width="16" height="8" rx="3" fill="#0E7490"></rect>
      <circle cx="176" cy="248" r="2.5" fill="#fff" opacity=".8"></circle>
      <g transform="rotate(-3 130 104)">
        <circle cx="69" cy="106" r="11" fill="#F2C9A0"></circle><circle cx="191" cy="106" r="11" fill="#F2C9A0"></circle>
        <rect x="121" y="150" width="18" height="22" rx="9" fill="#F2C9A0"></rect>
        <circle cx="130" cy="100" r="62" fill="#F2C9A0"></circle>
        <path d="M64,114 C56,40 102,28 130,28 C158,28 206,40 196,116 Q192,90 180,86 Q186,74 176,74 Q170,66 160,72 Q150,62 138,70 Q130,60 122,70 Q108,64 100,74 Q88,72 84,86 Q76,86 64,114 Z" fill="#6B7280"></path>
        <path d="M74,100 Q82,80 130,78 Q178,80 186,100 Q176,88 130,88 Q84,88 74,100 Z" fill="#9CA3AF"></path>
        <rect x="92" y="70" width="76" height="16" rx="8" fill="#0E7490" opacity=".85"></rect>
        <circle cx="110" cy="78" r="9" fill="#67E8F9" stroke="#0E7490" strokeWidth="2"></circle>
        <circle cx="150" cy="78" r="9" fill="#67E8F9" stroke="#0E7490" strokeWidth="2"></circle>
        <circle cx="100" cy="122" r="7.5" fill="#D2A272" opacity=".5"></circle><circle cx="160" cy="122" r="7.5" fill="#D2A272" opacity=".5"></circle>
        <path d="M100,96 Q111,90 122,95" fill="none" stroke="#5B6270" strokeWidth="4.5" strokeLinecap="round"></path>
        <path d="M138,95 Q149,90 160,96" fill="none" stroke="#5B6270" strokeWidth="4.5" strokeLinecap="round"></path>
        <ellipse cx="112" cy="106" rx="9" ry="10" fill="#fff"></ellipse><ellipse cx="148" cy="106" rx="9" ry="10" fill="#fff"></ellipse>
        <circle cx="112" cy="105" r="5.5" fill="#2A2438"></circle><circle cx="148" cy="105" r="5.5" fill="#2A2438"></circle>
        <circle cx="114" cy="102" r="2.2" fill="#fff"></circle><circle cx="150" cy="102" r="2.2" fill="#fff"></circle>
        <ellipse cx="130" cy="124" rx="8" ry="9" fill="#7A3B44"></ellipse>
        <ellipse cx="130" cy="122" rx="5" ry="3" fill="#fff"></ellipse>
      </g>
    </>
  ),
  psy: (
    <>
      <path d="M120,300 Q118,326 116,342" fill="none" stroke="#7C4A1E" strokeWidth="30" strokeLinecap="round"></path>
      <path d="M140,300 Q142,326 144,342" fill="none" stroke="#7C4A1E" strokeWidth="30" strokeLinecap="round"></path>
      <ellipse cx="108" cy="346" rx="23" ry="13" fill="#FCE9C8"></ellipse><ellipse cx="152" cy="346" rx="23" ry="13" fill="#FCE9C8"></ellipse>
      <path d="M92,198 C78,230 82,258 100,276" fill="none" stroke="#F59E0B" strokeWidth="26" strokeLinecap="round"></path>
      <path d="M168,198 C182,230 178,258 160,276" fill="none" stroke="#F59E0B" strokeWidth="26" strokeLinecap="round"></path>
      <path d="M84,182 Q82,168 130,168 Q178,168 176,182 L188,286 Q190,312 130,312 Q70,312 72,286 Z" fill="#F59E0B"></path>
      <path d="M78,270 Q130,300 182,270 L188,286 Q190,312 130,312 Q70,312 72,286 Z" fill="#D97706"></path>
      <circle cx="100" cy="278" r="13" fill="#E8B48C"></circle><circle cx="160" cy="278" r="13" fill="#E8B48C"></circle>
      <path d="M130,236 C124,226 108,228 108,242 C108,254 130,266 130,266 C130,266 152,254 152,242 C152,228 136,226 130,236 Z" fill="#FB7185"></path>
      <g>
        <circle cx="69" cy="106" r="11" fill="#E8B48C"></circle><circle cx="191" cy="106" r="11" fill="#E8B48C"></circle>
        <rect x="121" y="150" width="18" height="22" rx="9" fill="#E8B48C"></rect>
        <circle cx="130" cy="100" r="62" fill="#E8B48C"></circle>
        <path d="M62,128 C54,42 104,28 130,28 C156,28 206,42 198,128 Q200,150 190,158 L190,120 Q188,84 130,82 Q72,84 70,120 L70,158 Q60,150 62,128 Z" fill="#3A2417"></path>
        <path d="M74,106 Q82,84 130,82 Q178,84 186,106 Q176,92 130,92 Q84,92 74,106 Z" fill="#5C3A21"></path>
        <circle cx="100" cy="122" r="8" fill="#D89A6C" opacity=".5"></circle><circle cx="160" cy="122" r="8" fill="#D89A6C" opacity=".5"></circle>
        <path d="M103,104 Q112,96 121,104" fill="none" stroke="#3A2418" strokeWidth="4.5" strokeLinecap="round"></path>
        <path d="M139,104 Q148,96 157,104" fill="none" stroke="#3A2418" strokeWidth="4.5" strokeLinecap="round"></path>
        <path d="M116,120 Q130,125 144,120 Q141,135 130,135 Q119,135 116,120 Z" fill="#8C4A57"></path>
      </g>
    </>
  ),
  business: (
    <>
      <path d="M116,300 Q108,326 100,342" fill="none" stroke="#3A2E2A" strokeWidth="30" strokeLinecap="round"></path>
      <path d="M144,300 Q152,326 160,342" fill="none" stroke="#3A2E2A" strokeWidth="30" strokeLinecap="round"></path>
      <ellipse cx="92" cy="346" rx="24" ry="13" fill="#2B2320"></ellipse><ellipse cx="168" cy="346" rx="24" ry="13" fill="#2B2320"></ellipse>
      <path d="M90,198 C76,230 80,258 98,276" fill="none" stroke="#EA580C" strokeWidth="26" strokeLinecap="round"></path>
      <path d="M170,198 C186,214 192,244 184,268" fill="none" stroke="#EA580C" strokeWidth="26" strokeLinecap="round"></path>
      <path d="M84,182 Q82,168 130,168 Q178,168 176,182 L188,286 Q190,312 130,312 Q70,312 72,286 Z" fill="#EA580C"></path>
      <path d="M104,172 L130,220 L156,172 L150,300 L110,300 Z" fill="#fff"></path>
      <path d="M116,176 L130,206 L144,176 L138,220 L122,220 Z" fill="#1E3A8A"></path>
      <path d="M104,172 L130,220 L120,180 Z" fill="#C2410C"></path>
      <path d="M156,172 L130,220 L140,180 Z" fill="#C2410C"></path>
      <circle cx="98" cy="278" r="13" fill="#C68642"></circle>
      <circle cx="184" cy="270" r="13" fill="#C68642"></circle>
      <rect x="166" y="272" width="44" height="32" rx="5" fill="#7C3A12"></rect>
      <rect x="180" y="266" width="16" height="8" rx="3" fill="#7C3A12"></rect>
      <rect x="166" y="284" width="44" height="4" fill="#5C2C0E"></rect>
      <g transform="rotate(4 130 104)">
        <circle cx="69" cy="106" r="11" fill="#C68642"></circle><circle cx="191" cy="106" r="11" fill="#C68642"></circle>
        <rect x="121" y="150" width="18" height="22" rx="9" fill="#C68642"></rect>
        <circle cx="130" cy="100" r="62" fill="#C68642"></circle>
        <path d="M66,110 C58,40 102,30 130,30 C160,30 202,40 194,110 Q192,88 180,84 Q170,72 130,74 Q116,72 108,80 Q126,84 150,88 Q120,90 92,88 Q84,92 84,104 C78,90 72,86 66,110 Z" fill="#1E1712"></path>
        <circle cx="100" cy="122" r="7.5" fill="#A9744F" opacity=".45"></circle><circle cx="160" cy="122" r="7.5" fill="#A9744F" opacity=".45"></circle>
        <path d="M102,91 L120,91" stroke="#1E1712" strokeWidth="4.5" strokeLinecap="round"></path>
        <path d="M140,91 L158,91" stroke="#1E1712" strokeWidth="4.5" strokeLinecap="round"></path>
        <ellipse cx="112" cy="104" rx="9" ry="10" fill="#fff"></ellipse><ellipse cx="148" cy="104" rx="9" ry="10" fill="#fff"></ellipse>
        <circle cx="113" cy="104" r="5.5" fill="#2A2438"></circle><circle cx="149" cy="104" r="5.5" fill="#2A2438"></circle>
        <circle cx="115" cy="101" r="2.2" fill="#fff"></circle><circle cx="151" cy="101" r="2.2" fill="#fff"></circle>
        <path d="M116,122 Q130,127 144,122" fill="none" stroke="#3A2418" strokeWidth="4" strokeLinecap="round"></path>
      </g>
    </>
  ),
  finance: (
    <>
      <path d="M120,300 Q118,326 116,342" fill="none" stroke="#3A3320" strokeWidth="30" strokeLinecap="round"></path>
      <path d="M140,300 Q142,326 144,342" fill="none" stroke="#3A3320" strokeWidth="30" strokeLinecap="round"></path>
      <ellipse cx="108" cy="346" rx="23" ry="13" fill="#2A2618"></ellipse><ellipse cx="152" cy="346" rx="23" ry="13" fill="#2A2618"></ellipse>
      <path d="M92,198 C80,226 84,252 104,264" fill="none" stroke="#CA8A04" strokeWidth="26" strokeLinecap="round"></path>
      <path d="M170,196 C188,208 194,236 184,260" fill="none" stroke="#CA8A04" strokeWidth="26" strokeLinecap="round"></path>
      <path d="M84,182 Q82,168 130,168 Q178,168 176,182 L188,286 Q190,312 130,312 Q70,312 72,286 Z" fill="#CA8A04"></path>
      <path d="M78,270 Q130,300 182,270 L188,286 Q190,312 130,312 Q70,312 72,286 Z" fill="#A16207"></path>
      <path d="M116,168 L130,200 L144,168 L140,240 L120,240 Z" fill="#fff"></path>
      <path d="M120,170 L130,196 L140,170 L136,210 L124,210 Z" fill="#1E293B"></path>
      <circle cx="104" cy="266" r="13" fill="#D99A6C"></circle>
      <circle cx="186" cy="262" r="13" fill="#D99A6C"></circle>
      <circle cx="196" cy="238" r="18" fill="#FBBF24" stroke="#B45309" strokeWidth="3"></circle>
      <text x="196" y="245" textAnchor="middle" fontSize="18" fontWeight="900" fill="#B45309">$</text>
      <g transform="rotate(-3 130 104)">
        <circle cx="69" cy="106" r="11" fill="#D99A6C"></circle><circle cx="191" cy="106" r="11" fill="#D99A6C"></circle>
        <rect x="121" y="150" width="18" height="22" rx="9" fill="#D99A6C"></rect>
        <circle cx="130" cy="100" r="62" fill="#D99A6C"></circle>
        <path d="M66,110 C58,40 102,30 130,30 C160,30 202,40 194,110 Q190,86 178,82 Q130,72 82,82 Q70,86 66,110 Z" fill="#2B2118"></path>
        <path d="M74,98 Q82,80 130,78 Q178,80 186,98 Q176,86 130,86 Q84,86 74,98 Z" fill="#3E2E1F"></path>
        <circle cx="100" cy="122" r="7.5" fill="#C1855A" opacity=".45"></circle><circle cx="160" cy="122" r="7.5" fill="#C1855A" opacity=".45"></circle>
        <path d="M101,92 Q111,88 121,92" fill="none" stroke="#2B2118" strokeWidth="4.5" strokeLinecap="round"></path>
        <path d="M139,92 Q149,88 159,92" fill="none" stroke="#2B2118" strokeWidth="4.5" strokeLinecap="round"></path>
        <ellipse cx="112" cy="104" rx="9" ry="10" fill="#fff"></ellipse><ellipse cx="148" cy="104" rx="9" ry="10" fill="#fff"></ellipse>
        <circle cx="112" cy="104" r="5.5" fill="#2A2438"></circle><circle cx="148" cy="104" r="5.5" fill="#2A2438"></circle>
        <circle cx="114" cy="101" r="2.2" fill="#fff"></circle><circle cx="150" cy="101" r="2.2" fill="#fff"></circle>
        <path d="M115,122 Q130,128 145,122 Q142,137 130,137 Q118,137 115,122 Z" fill="#7A3B44"></path>
      </g>
    </>
  ),
  law: (
    <>
      <path d="M120,300 Q118,326 116,342" fill="none" stroke="#1B2540" strokeWidth="30" strokeLinecap="round"></path>
      <path d="M140,300 Q142,326 144,342" fill="none" stroke="#1B2540" strokeWidth="30" strokeLinecap="round"></path>
      <ellipse cx="108" cy="346" rx="23" ry="13" fill="#161C30"></ellipse><ellipse cx="152" cy="346" rx="23" ry="13" fill="#161C30"></ellipse>
      <path d="M92,198 C78,226 82,252 100,268" fill="none" stroke="#1E3A8A" strokeWidth="26" strokeLinecap="round"></path>
      <path d="M170,196 C188,208 194,236 184,260" fill="none" stroke="#1E3A8A" strokeWidth="26" strokeLinecap="round"></path>
      <path d="M84,182 Q82,168 130,168 Q178,168 176,182 L188,286 Q190,312 130,312 Q70,312 72,286 Z" fill="#1E3A8A"></path>
      <path d="M108,170 L130,300 L152,170 Q130,182 108,170 Z" fill="#2B4BA0"></path>
      <path d="M124,172 L130,220 L136,172 Z" fill="#E2E8F0"></path>
      <circle cx="130" cy="200" r="5" fill="#CBD5E1"></circle>
      <circle cx="100" cy="270" r="13" fill="#8D5A32"></circle>
      <circle cx="186" cy="262" r="13" fill="#8D5A32"></circle>
      <rect x="178" y="232" width="34" height="18" rx="5" fill="#92400E" transform="rotate(-30 195 241)"></rect>
      <rect x="176" y="238" width="10" height="34" rx="4" fill="#B45309" transform="rotate(-30 181 255)"></rect>
      <g transform="rotate(3 130 104)">
        <circle cx="69" cy="106" r="11" fill="#8D5A32"></circle><circle cx="191" cy="106" r="11" fill="#8D5A32"></circle>
        <rect x="121" y="150" width="18" height="22" rx="9" fill="#8D5A32"></rect>
        <circle cx="130" cy="100" r="62" fill="#8D5A32"></circle>
        <path d="M64,110 C50,36 104,26 130,26 C156,26 210,36 196,110 C196,86 184,80 176,82 C182,66 168,62 160,70 C160,54 142,56 138,68 C136,52 122,54 122,68 C114,58 100,64 100,76 C88,70 78,78 82,90 C74,84 66,92 64,110 Z" fill="#1C1712"></path>
        <circle cx="100" cy="122" r="7.5" fill="#6E4526" opacity=".45"></circle><circle cx="160" cy="122" r="7.5" fill="#6E4526" opacity=".45"></circle>
        <path d="M101,92 L120,94" stroke="#1C1712" strokeWidth="4.5" strokeLinecap="round"></path>
        <path d="M159,92 L140,94" stroke="#1C1712" strokeWidth="4.5" strokeLinecap="round"></path>
        <ellipse cx="112" cy="104" rx="9" ry="10" fill="#fff"></ellipse><ellipse cx="148" cy="104" rx="9" ry="10" fill="#fff"></ellipse>
        <circle cx="112" cy="105" r="5.5" fill="#2A2438"></circle><circle cx="148" cy="105" r="5.5" fill="#2A2438"></circle>
        <circle cx="114" cy="102" r="2.2" fill="#fff"></circle><circle cx="150" cy="102" r="2.2" fill="#fff"></circle>
        <path d="M117,123 Q130,127 143,123" fill="none" stroke="#3A2418" strokeWidth="4" strokeLinecap="round"></path>
      </g>
    </>
  ),
  media: (
    <>
      <path d="M116,300 Q108,326 100,342" fill="none" stroke="#3A2A32" strokeWidth="30" strokeLinecap="round"></path>
      <path d="M144,300 Q152,326 160,342" fill="none" stroke="#3A2A32" strokeWidth="30" strokeLinecap="round"></path>
      <ellipse cx="92" cy="346" rx="24" ry="13" fill="#2A2024"></ellipse><ellipse cx="168" cy="346" rx="24" ry="13" fill="#2A2024"></ellipse>
      <path d="M90,196 C68,206 58,182 62,158" fill="none" stroke="#E11D48" strokeWidth="26" strokeLinecap="round"></path>
      <path d="M168,198 C182,228 178,256 160,274" fill="none" stroke="#E11D48" strokeWidth="26" strokeLinecap="round"></path>
      <path d="M84,182 Q82,168 130,168 Q178,168 176,182 L188,286 Q190,312 130,312 Q70,312 72,286 Z" fill="#E11D48"></path>
      <path d="M78,270 Q130,300 182,270 L188,286 Q190,312 130,312 Q70,312 72,286 Z" fill="#BE123C"></path>
      <circle cx="160" cy="276" r="13" fill="#E8B48C"></circle>
      <circle cx="62" cy="158" r="13" fill="#E8B48C"></circle>
      <rect x="56" y="108" width="12" height="42" rx="6" fill="#334155"></rect>
      <circle cx="62" cy="100" r="16" fill="#475569"></circle>
      <path d="M50,96 Q62,88 74,96 M50,102 Q62,94 74,102" stroke="#94A3B8" strokeWidth="2.5" fill="none"></path>
      <g transform="rotate(-4 130 104)">
        <circle cx="69" cy="106" r="11" fill="#E8B48C"></circle><circle cx="191" cy="106" r="11" fill="#E8B48C"></circle>
        <rect x="121" y="150" width="18" height="22" rx="9" fill="#E8B48C"></rect>
        <circle cx="130" cy="100" r="62" fill="#E8B48C"></circle>
        <path d="M68,116 C60,44 104,30 130,30 C160,30 204,44 194,116 Q192,92 180,88 Q184,60 150,62 Q120,58 104,74 Q94,64 88,80 Q80,84 82,102 C78,92 72,94 68,116 Z" fill="#1B1B24"></path>
        <path d="M104,74 Q124,54 152,62 Q170,66 176,86 Q160,74 130,74 Q114,74 104,84 Z" fill="#14B8A6"></path>
        <circle cx="100" cy="122" r="7.5" fill="#C1855A" opacity=".45"></circle><circle cx="160" cy="122" r="7.5" fill="#C1855A" opacity=".45"></circle>
        <path d="M100,90 Q111,85 121,90" fill="none" stroke="#1B1B24" strokeWidth="4.5" strokeLinecap="round"></path>
        <path d="M139,90 Q149,85 160,90" fill="none" stroke="#1B1B24" strokeWidth="4.5" strokeLinecap="round"></path>
        <ellipse cx="112" cy="104" rx="9" ry="10" fill="#fff"></ellipse><ellipse cx="148" cy="104" rx="9" ry="10" fill="#fff"></ellipse>
        <circle cx="114" cy="103" r="5.5" fill="#2A2438"></circle><circle cx="150" cy="103" r="5.5" fill="#2A2438"></circle>
        <circle cx="116" cy="100" r="2.2" fill="#fff"></circle><circle cx="152" cy="100" r="2.2" fill="#fff"></circle>
        <path d="M114,121 Q130,128 146,121 Q143,138 130,138 Q117,138 114,121 Z" fill="#7A3B44"></path>
        <path d="M119,122 L141,122 Q139,127 130,127 Q121,127 119,122 Z" fill="#fff"></path>
      </g>
    </>
  ),
  eng: (
    <>
      <path d="M116,300 Q108,326 100,342" fill="none" stroke="#3A3F47" strokeWidth="30" strokeLinecap="round"></path>
      <path d="M144,300 Q152,326 160,342" fill="none" stroke="#3A3F47" strokeWidth="30" strokeLinecap="round"></path>
      <ellipse cx="92" cy="346" rx="24" ry="13" fill="#B45309"></ellipse><ellipse cx="168" cy="346" rx="24" ry="13" fill="#B45309"></ellipse>
      <path d="M90,198 C76,228 80,256 98,274" fill="none" stroke="#F59E0B" strokeWidth="26" strokeLinecap="round"></path>
      <path d="M170,196 C188,208 194,236 184,260" fill="none" stroke="#F59E0B" strokeWidth="26" strokeLinecap="round"></path>
      <path d="M84,182 Q82,168 130,168 Q178,168 176,182 L188,286 Q190,312 130,312 Q70,312 72,286 Z" fill="#F59E0B"></path>
      <rect x="100" y="178" width="60" height="18" rx="4" fill="#64748B"></rect>
      <path d="M104,196 L104,300 L156,300 L156,196 Q156,250 130,250 Q104,250 104,196 Z" fill="#64748B"></path>
      <rect x="118" y="256" width="24" height="18" rx="4" fill="#475569"></rect>
      <circle cx="98" cy="276" r="13" fill="#C68642"></circle>
      <circle cx="186" cy="262" r="13" fill="#C68642"></circle>
      <rect x="180" y="228" width="11" height="40" rx="5" fill="#94A3B8" transform="rotate(-28 185 248)"></rect>
      <path d="M186,220 a10,10 0 1,0 8,6 l-6,4 -5,-7 z" fill="#64748B"></path>
      <g>
        <circle cx="69" cy="106" r="11" fill="#C68642"></circle><circle cx="191" cy="106" r="11" fill="#C68642"></circle>
        <rect x="121" y="150" width="18" height="22" rx="9" fill="#C68642"></rect>
        <circle cx="130" cy="100" r="62" fill="#C68642"></circle>
        <path d="M70,116 C64,74 96,64 130,64 C164,64 196,74 190,116 Q188,98 176,94 Q130,86 84,94 Q72,98 70,116 Z" fill="#241A12"></path>
        <path d="M74,72 Q74,32 130,32 Q186,32 186,72 Q160,58 130,58 Q100,58 74,72 Z" fill="#FBBF24"></path>
        <rect x="66" y="70" width="128" height="12" rx="6" fill="#F59E0B"></rect>
        <rect x="124" y="34" width="12" height="34" rx="3" fill="#F59E0B"></rect>
        <circle cx="100" cy="122" r="7.5" fill="#A9744F" opacity=".45"></circle><circle cx="160" cy="122" r="7.5" fill="#A9744F" opacity=".45"></circle>
        <path d="M101,96 Q111,92 121,96" fill="none" stroke="#241A12" strokeWidth="4.5" strokeLinecap="round"></path>
        <path d="M139,96 Q149,92 159,96" fill="none" stroke="#241A12" strokeWidth="4.5" strokeLinecap="round"></path>
        <ellipse cx="112" cy="107" rx="9" ry="10" fill="#fff"></ellipse><ellipse cx="148" cy="107" rx="9" ry="10" fill="#fff"></ellipse>
        <circle cx="113" cy="107" r="5.5" fill="#2A2438"></circle><circle cx="149" cy="107" r="5.5" fill="#2A2438"></circle>
        <circle cx="115" cy="104" r="2.2" fill="#fff"></circle><circle cx="151" cy="104" r="2.2" fill="#fff"></circle>
        <path d="M116,124 Q130,129 144,124" fill="none" stroke="#3A2418" strokeWidth="4" strokeLinecap="round"></path>
      </g>
    </>
  ),
  marketing: (
    <>
      <path d="M116,300 Q108,326 100,342" fill="none" stroke="#4A1F52" strokeWidth="30" strokeLinecap="round"></path>
      <path d="M144,300 Q152,326 160,342" fill="none" stroke="#4A1F52" strokeWidth="30" strokeLinecap="round"></path>
      <ellipse cx="92" cy="346" rx="24" ry="13" fill="#F9D9F7"></ellipse><ellipse cx="168" cy="346" rx="24" ry="13" fill="#F9D9F7"></ellipse>
      <path d="M90,196 C66,200 54,172 60,146" fill="none" stroke="#C026D3" strokeWidth="26" strokeLinecap="round"></path>
      <path d="M168,198 C182,228 178,256 160,274" fill="none" stroke="#C026D3" strokeWidth="26" strokeLinecap="round"></path>
      <path d="M84,182 Q82,168 130,168 Q178,168 176,182 L188,286 Q190,312 130,312 Q70,312 72,286 Z" fill="#C026D3"></path>
      <path d="M78,270 Q130,300 182,270 L188,286 Q190,312 130,312 Q70,312 72,286 Z" fill="#A21CAF"></path>
      <circle cx="160" cy="276" r="13" fill="#F2C9A0"></circle>
      <circle cx="60" cy="146" r="13" fill="#F2C9A0"></circle>
      <path d="M50,134 L72,126 L92,110 L92,150 L72,140 L50,146 Z" fill="#F59E0B"></path>
      <path d="M92,110 L100,104 L100,156 L92,150 Z" fill="#D97706"></path>
      <path d="M104,116 Q114,114 114,124 M106,132 Q116,132 114,140" stroke="#C026D3" strokeWidth="3" fill="none" strokeLinecap="round"></path>
      <g transform="rotate(4 130 104)">
        <circle cx="69" cy="106" r="11" fill="#F2C9A0"></circle><circle cx="191" cy="106" r="11" fill="#F2C9A0"></circle>
        <rect x="121" y="150" width="18" height="22" rx="9" fill="#F2C9A0"></rect>
        <circle cx="130" cy="100" r="62" fill="#F2C9A0"></circle>
        <path d="M60,130 C52,42 106,28 130,28 C154,28 208,42 200,130 Q202,150 192,156 L192,116 Q190,100 176,98 L176,116 Q172,96 154,96 Q120,92 100,100 L100,116 Q86,100 84,116 L84,156 Q60,150 60,130 Z" fill="#2B1A2E"></path>
        <circle cx="100" cy="122" r="8" fill="#D8A879" opacity=".5"></circle><circle cx="160" cy="122" r="8" fill="#D8A879" opacity=".5"></circle>
        <path d="M100,101 Q111,96 121,101" fill="none" stroke="#2B1A2E" strokeWidth="4.5" strokeLinecap="round"></path>
        <path d="M139,101 Q149,96 160,101" fill="none" stroke="#2B1A2E" strokeWidth="4.5" strokeLinecap="round"></path>
        <ellipse cx="112" cy="110" rx="10" ry="11" fill="#fff"></ellipse><ellipse cx="148" cy="110" rx="10" ry="11" fill="#fff"></ellipse>
        <circle cx="113" cy="110" r="6.5" fill="#2A2438"></circle><circle cx="149" cy="110" r="6.5" fill="#2A2438"></circle>
        <circle cx="116" cy="107" r="2.6" fill="#fff"></circle><circle cx="152" cy="107" r="2.6" fill="#fff"></circle>
        <path d="M114,126 Q130,133 146,126 Q143,144 130,144 Q117,144 114,126 Z" fill="#7A3B44"></path>
        <path d="M119,127 L141,127 Q139,132 130,132 Q121,132 119,127 Z" fill="#fff"></path>
      </g>
    </>
  ),
  eco: (
    <>
      <path d="M120,300 Q118,326 116,342" fill="none" stroke="#3F6212" strokeWidth="30" strokeLinecap="round"></path>
      <path d="M140,300 Q142,326 144,342" fill="none" stroke="#3F6212" strokeWidth="30" strokeLinecap="round"></path>
      <ellipse cx="108" cy="346" rx="23" ry="13" fill="#65451F"></ellipse><ellipse cx="152" cy="346" rx="23" ry="13" fill="#65451F"></ellipse>
      <path d="M92,200 C80,226 84,252 106,266" fill="none" stroke="#16A34A" strokeWidth="26" strokeLinecap="round"></path>
      <path d="M168,200 C180,226 176,252 154,266" fill="none" stroke="#16A34A" strokeWidth="26" strokeLinecap="round"></path>
      <path d="M84,182 Q82,168 130,168 Q178,168 176,182 L188,286 Q190,312 130,312 Q70,312 72,286 Z" fill="#16A34A"></path>
      <path d="M78,270 Q130,300 182,270 L188,286 Q190,312 130,312 Q70,312 72,286 Z" fill="#15803D"></path>
      <circle cx="106" cy="268" r="13" fill="#A9744F"></circle><circle cx="154" cy="268" r="13" fill="#A9744F"></circle>
      <path d="M100,268 Q130,286 160,268 Q158,282 130,284 Q102,282 100,268 Z" fill="#8D5A32"></path>
      <path d="M130,268 L130,234" stroke="#15803D" strokeWidth="4" strokeLinecap="round"></path>
      <path d="M130,244 Q112,240 110,224 Q128,224 130,244 Z" fill="#22C55E"></path>
      <path d="M130,238 Q148,232 152,216 Q132,218 130,238 Z" fill="#4ADE80"></path>
      <g transform="rotate(-3 130 104)">
        <circle cx="69" cy="106" r="11" fill="#A9744F"></circle><circle cx="191" cy="106" r="11" fill="#A9744F"></circle>
        <rect x="121" y="150" width="18" height="22" rx="9" fill="#A9744F"></rect>
        <circle cx="130" cy="100" r="62" fill="#A9744F"></circle>
        <path d="M62,116 C52,40 104,28 130,28 C156,28 208,40 198,116 C196,92 186,86 178,88 C182,72 168,68 160,76 C160,60 142,62 138,74 C134,58 122,60 120,74 C112,62 98,66 100,80 C86,74 78,82 82,94 C74,88 64,94 62,116 Z" fill="#1A1510"></path>
        <circle cx="88" cy="70" r="8" fill="#241C14"></circle><circle cx="112" cy="58" r="8" fill="#241C14"></circle><circle cx="132" cy="56" r="8" fill="#241C14"></circle><circle cx="152" cy="60" r="8" fill="#241C14"></circle><circle cx="172" cy="72" r="8" fill="#241C14"></circle>
        <circle cx="100" cy="122" r="7.5" fill="#875A38" opacity=".45"></circle><circle cx="160" cy="122" r="7.5" fill="#875A38" opacity=".45"></circle>
        <path d="M103,105 Q112,97 121,105" fill="none" stroke="#3A2418" strokeWidth="4.5" strokeLinecap="round"></path>
        <path d="M139,105 Q148,97 157,105" fill="none" stroke="#3A2418" strokeWidth="4.5" strokeLinecap="round"></path>
        <path d="M115,120 Q130,126 145,120 Q142,137 130,137 Q118,137 115,120 Z" fill="#7A3B44"></path>
        <path d="M120,121 L140,121 Q138,126 130,126 Q122,126 120,121 Z" fill="#fff"></path>
      </g>
    </>
  ),
  pm: (
    <>
      <path d="M120,300 Q118,326 116,342" fill="none" stroke="#4C2A6B" strokeWidth="30" strokeLinecap="round"></path>
      <path d="M140,300 Q142,326 144,342" fill="none" stroke="#4C2A6B" strokeWidth="30" strokeLinecap="round"></path>
      <ellipse cx="108" cy="346" rx="23" ry="13" fill="#EADAF7"></ellipse><ellipse cx="152" cy="346" rx="23" ry="13" fill="#EADAF7"></ellipse>
      <path d="M92,196 C80,224 84,248 106,258" fill="none" stroke="#9333EA" strokeWidth="26" strokeLinecap="round"></path>
      <path d="M168,196 C180,224 176,248 154,258" fill="none" stroke="#9333EA" strokeWidth="26" strokeLinecap="round"></path>
      <path d="M84,182 Q82,168 130,168 Q178,168 176,182 L188,286 Q190,312 130,312 Q70,312 72,286 Z" fill="#9333EA"></path>
      <path d="M78,270 Q130,300 182,270 L188,286 Q190,312 130,312 Q70,312 72,286 Z" fill="#7E22CE"></path>
      <rect x="90" y="204" width="80" height="58" rx="7" fill="#F5F3FF"></rect>
      <rect x="97" y="212" width="18" height="42" rx="3" fill="#DDD6FE"></rect>
      <rect x="121" y="212" width="18" height="42" rx="3" fill="#DDD6FE"></rect>
      <rect x="145" y="212" width="18" height="42" rx="3" fill="#DDD6FE"></rect>
      <rect x="100" y="216" width="12" height="9" rx="2" fill="#9333EA"></rect>
      <rect x="100" y="228" width="12" height="9" rx="2" fill="#C4B5FD"></rect>
      <rect x="124" y="216" width="12" height="9" rx="2" fill="#F59E0B"></rect>
      <rect x="148" y="216" width="12" height="9" rx="2" fill="#16A34A"></rect>
      <circle cx="106" cy="260" r="13" fill="#6B4423"></circle><circle cx="154" cy="260" r="13" fill="#6B4423"></circle>
      <g transform="rotate(3 130 104)">
        <circle cx="69" cy="106" r="11" fill="#6B4423"></circle><circle cx="191" cy="106" r="11" fill="#6B4423"></circle>
        <rect x="121" y="150" width="18" height="22" rx="9" fill="#6B4423"></rect>
        <circle cx="130" cy="100" r="62" fill="#6B4423"></circle>
        <path d="M66,110 C58,42 102,32 130,32 C158,32 202,42 194,110 Q190,88 178,84 Q130,74 82,84 Q70,88 66,110 Z" fill="#241611"></path>
        <path d="M74,98 Q82,82 130,80 Q178,82 186,98 Q176,88 130,88 Q84,88 74,98 Z" fill="#3A2417"></path>
        <circle cx="130" cy="34" r="15" fill="#241611"></circle>
        <circle cx="130" cy="30" r="8" fill="#3A2417"></circle>
        <circle cx="100" cy="122" r="7.5" fill="#4E3018" opacity=".45"></circle><circle cx="160" cy="122" r="7.5" fill="#4E3018" opacity=".45"></circle>
        <path d="M101,92 Q111,88 121,92" fill="none" stroke="#241611" strokeWidth="4.5" strokeLinecap="round"></path>
        <path d="M139,92 Q149,88 159,92" fill="none" stroke="#241611" strokeWidth="4.5" strokeLinecap="round"></path>
        <ellipse cx="112" cy="104" rx="9" ry="10" fill="#fff"></ellipse><ellipse cx="148" cy="104" rx="9" ry="10" fill="#fff"></ellipse>
        <circle cx="113" cy="104" r="5.5" fill="#2A2438"></circle><circle cx="149" cy="104" r="5.5" fill="#2A2438"></circle>
        <circle cx="115" cy="101" r="2.2" fill="#fff"></circle><circle cx="151" cy="101" r="2.2" fill="#fff"></circle>
        <path d="M116,122 Q130,127 144,122" fill="none" stroke="#3A2418" strokeWidth="4" strokeLinecap="round"></path>
      </g>
    </>
  ),
};
