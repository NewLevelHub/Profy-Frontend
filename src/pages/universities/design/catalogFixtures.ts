import type { TFunction } from 'i18next';
import type { UniversityListItem, UniversityDetail, ProgramDetail, UniversityRequirement } from '@/shared/types';
import { studentFixtures } from '@/pages/results/design/studentFixtures';

/** Entirely fictional universities and requirements, used only by the DEV preview. */
export function catalogFixtures(t: TFunction, favorites: string[]) {
  const text = (key: string) => t(`results:catalogDesign.preview.data.${key}`);
  const universities: UniversityListItem[] = Array.from({ length: 6 }, (_, index) => ({
    id: `preview-university-${index}`, name: text(`names.${index}`), short_name: null,
    name_locale: 'ru', description_locale: 'ru', country: t(`results:catalogDesign.preview.data.countries.${index % 3}`, { lng: 'ru' }),
    city: text(`cities.${index % 3}`), website: null, ranking: null, location: null,
    ranking_label: null, uniranks_kz_rank: null, uniranks_world_rank: null,
    description: text('universityDescription'), image_url: index === 2 ? '/design-intentionally-missing-university-photo.webp' : null,
    is_favorite: favorites.includes(`preview-university-${index}`), programs_count: 2,
  }));
  const programs: ProgramDetail[] = universities.map((university, index) => {
    const requirements: UniversityRequirement = {
      program_name: text('programName'), university_name: university.name, city: university.city, country: university.country,
      website: null, program_language: text('language'), exams: [text('exam')], exam_hint_from_notes: null,
      application_deadline: null, grants: [], language_level: 'IELTS 6.5', portfolio_needed: true,
      required_documents: null, min_ent_threshold: 75, min_ent_paid: null, min_gpa: 3, min_sat: 1200,
      extracurriculars: [], admission_scores_2026: [], grant_scores: {}, grants_allocated_count: null,
      duration_years: 4, has_dual_degree: null, has_dormitory: null, dormitory_cost_label: null,
      has_military_department: null, admissions_contacts: {}, notes: [text('requirements')], requires_ent: true,
    };
    return {
      id: `preview-program-${index}`, name: text(index % 2 ? 'programName2' : 'programName'), profession_slugs: ['design'],
      name_locale: 'ru', direction_slug: 'design', language: text('language'), cost_per_year: null,
      cost_label: text('cost'), description: text('programDescription'), description_locale: 'ru', university,
      cost_currency: null, cost_per_year_min: null, cost_per_year_max: null, who_its_for: text('whoFor'), who_its_for_locale: 'ru',
      career_options: [text('career1'), text('career2')], requirements: {}, deadlines: {}, grants: [text('grant')],
      requirements_summary: requirements, created_at: '2026-10-06T00:00:00Z',
    };
  });
  const universityDetails: UniversityDetail[] = universities.map((university, index) => ({
    ...university, contacts: {}, facilities: {}, source_url: null,
    programs: [programs[index], { ...programs[index], id: `preview-secondary-${index}`, name: text('programName2') }],
  }));
  const direction = { ...studentFixtures(t).report.careers[0], description: text('directionDescription'),
    skills_needed: [text('skill1'), text('skill2'), text('skill3')], subjects_to_develop: [text('subject1'), text('subject2')] };
  return { universities, universityDetails, programs, direction };
}
