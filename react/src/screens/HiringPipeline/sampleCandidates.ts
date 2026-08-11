import { faker } from '@faker-js/faker';
import type { Applicant, ApplicantStatus } from '../../types';

export const sampleSources = [
  'LinkedIn',
  'Indeed',
  'DOU',
  'Djinni',
  'Referral',
  'Glassdoor',
  'AngelList',
  'Stack Overflow',
  'Company Website',
  'Recruiter Outreach',
];

// Each entry: [status, weight] — a healthy funnel: lots of new, few at the end.
const statusWeights: Array<[ApplicantStatus, number]> = [
  ['new', 0.28],
  ['screening', 0.26],
  ['interview', 0.18],
  ['offer', 0.07],
  ['hired', 0.03],
  ['rejected', 0.18],
];

const departments = [
  'Engineering',
  'Product',
  'Design',
  'Data',
  'Marketing',
  'Sales',
  'Customer Success',
  'People',
  'Finance',
  'Operations',
  'Security',
  'Platform',
];

const rolesByDepartment: { [key: string]: string[] } = {
  Engineering: [
    'Senior Frontend Engineer',
    'Backend Engineer',
    'Staff Software Engineer',
    'Mobile Engineer (iOS)',
    'Mobile Engineer (Android)',
    'Engineering Manager',
    'Site Reliability Engineer',
  ],
  Product: [
    'Product Manager',
    'Senior Product Manager',
    'Product Analyst',
    'Technical Product Manager',
  ],
  Design: [
    'Product Designer',
    'Senior UX Researcher',
    'Brand Designer',
    'Design Systems Lead',
    'Motion Designer',
  ],
  Data: [
    'Data Scientist',
    'Analytics Engineer',
    'ML Engineer',
    'Data Platform Engineer',
    'BI Analyst',
  ],
  Marketing: [
    'Content Marketing Manager',
    'Growth Marketer',
    'SEO Specialist',
    'Field Marketing Lead',
    'Brand Strategist',
  ],
  Sales: [
    'Account Executive',
    'Sales Development Rep',
    'Enterprise AE',
    'Solutions Engineer',
    'Sales Operations Analyst',
  ],
  'Customer Success': [
    'CS Manager',
    'Onboarding Specialist',
    'Customer Success Engineer',
    'Renewals Manager',
  ],
  People: [
    'Talent Acquisition Partner',
    'People Operations Lead',
    'Compensation Analyst',
    'L&D Specialist',
  ],
  Finance: [
    'Financial Analyst',
    'Controller',
    'FP&A Manager',
    'Treasury Analyst',
  ],
  Operations: [
    'Operations Manager',
    'Business Operations Analyst',
    'Workforce Planning Lead',
  ],
  Security: [
    'Security Engineer',
    'GRC Analyst',
    'Application Security Engineer',
    'Detection and Response Engineer',
  ],
  Platform: [
    'Platform Engineer',
    'Developer Experience Engineer',
    'Build Engineer',
    'Internal Tools Engineer',
  ],
};

const locations = [
  'Berlin, DE',
  'London, UK',
  'Lisbon, PT',
  'Amsterdam, NL',
  'Warsaw, PL',
  'Bucharest, RO',
  'Prague, CZ',
  'Madrid, ES',
  'Paris, FR',
  'Stockholm, SE',
  'Dublin, IE',
  'Kyiv, UA',
  'Tbilisi, GE',
  'Toronto, CA',
  'Austin, US',
  'Brooklyn, US',
  'Mexico City, MX',
  'Sao Paulo, BR',
  'Buenos Aires, AR',
  'Bangalore, IN',
  'Singapore',
  'Tokyo, JP',
  'Sydney, AU',
  'Cape Town, ZA',
  'Remote - EMEA',
  'Remote - Americas',
  'Remote - APAC',
];

// Seed for reproducible dev output.
faker.seed(20260423);

const pickStatus = (): ApplicantStatus => {
  const r = faker.number.float({ min: 0, max: 1 });
  let acc = 0;
  for (let i = 0; i < statusWeights.length; i++) {
    const item = statusWeights[i];
    acc += item[1];
    if (r <= acc) return item[0];
  }
  return 'new';
};

const initialsFrom = (first: string, last: string): string =>
  (first.charAt(0) + last.charAt(0)).toUpperCase();

export const generateCandidates = (count: number): Applicant[] => {
  const list: Applicant[] = [];
  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const department = faker.helpers.arrayElement(departments);
    const roleList = rolesByDepartment[department];
    const position = faker.helpers.arrayElement(roleList);
    const status = pickStatus();
    const location = faker.helpers.arrayElement(locations);
    const source = faker.helpers.arrayElement(sampleSources);

    // Spread timestamps across the last 6 months so the relative-date column is varied.
    const daysAgo = faker.number.int({ min: 0, max: 180 });
    const minutesAgo = faker.number.int({ min: 0, max: 60 * 24 });
    const appliedAt = new Date(
      Date.now() - daysAgo * 24 * 3600 * 1000 - minutesAgo * 60 * 1000,
    ).toISOString();

    list.push({
      id: 'cand-' + String(i + 1).padStart(4, '0'),
      fullName: firstName + ' ' + lastName,
      email: faker.internet
        .email({ firstName: firstName, lastName: lastName })
        .toLowerCase(),
      initials: initialsFrom(firstName, lastName),
      position: position,
      department: department,
      location: location,
      status: status,
      source: source,
      appliedAt: appliedAt,
      requisitionId: faker.string.uuid(),
    });
  }
  // Newest first.
  return list.sort((a, b) => (a.appliedAt < b.appliedAt ? 1 : -1));
};

export const sampleCandidates: Applicant[] = generateCandidates(124);
