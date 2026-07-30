/** Styles and typography for the direction roadmap page — from RoadmapScreen.dc.html */
export const roadmapType = {
  pageTitle: 'text-[32px] font-extrabold tracking-[-0.02em] text-primary',
  sectionTitle: 'text-[20px] font-extrabold text-primary',
  cardTitle: 'text-[24px] font-extrabold text-primary',
  cardLabelBrand: 'text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#6D28D9]',
  cardLabelAccent: 'text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#C2410C]',
  cardSubtitle: 'text-[13px] font-bold uppercase tracking-[0.04em] text-[#6B7280]',
  growthTitle: 'text-[21px] font-extrabold text-[#9A3412]',
  growthBody: 'text-[15px] font-semibold text-[#7C2D12] text-pretty',
  actionText: 'text-[16px] font-semibold text-primary text-pretty',
  progressLabel: 'text-[15px] font-extrabold text-primary',
  progressPercent: 'text-[14px] font-extrabold tabular-nums',
  cta: 'text-[17px] font-extrabold',
} as const;

export const roadmapSurfaceCard =
  'bg-surface border-2 border-[#DDD6FE] border-b-4 border-b-[#DDD6FE] rounded-[22px] p-[26px]';

export const roadmapDirectionCard =
  'bg-[#EDE9FE] border-2 border-[#DDD6FE] border-b-4 border-b-[#C4B5FD] rounded-[22px] p-6';

export const roadmapGrowthCard =
  'bg-[#FFF7ED] border-2 border-[#FED7AA] border-b-4 border-b-[#C2410C] rounded-[22px] p-6';

export const roadmapActionRow =
  'flex items-center gap-3.5 bg-[#F5F3FF] border-2 border-[#DDD6FE] rounded-2xl p-4';

export const roadmapActionNumber =
  'w-10 h-10 flex-none rounded-full bg-brand border-b-[3px] border-b-[#5B21B6] text-white font-extrabold flex items-center justify-center';

export const roadmapCtaButton =
  'inline-flex items-center gap-2 self-start font-inherit text-white bg-brand border-none border-b-4 border-b-[#5B21B6] rounded-2xl px-[30px] py-4 cursor-pointer hover:bg-brand-hover active:translate-y-0.5 active:border-b-0 transition-colors';
