import 'dotenv/config'
import { randomUUID } from 'crypto'
import bcrypt from 'bcrypt'
import db from '../../config/database.ts'
import { permissions } from './schema/permissions.ts'
import { roles } from './schema/roles.ts'
import { rolesPermissions } from './schema/roles_permissions.ts'
import { users } from './schema/users.ts'
import { rolesUsers } from './schema/roles_users.ts'
import { jobPostings } from './schema/jobPostings.ts'
import { candidates } from './schema/candidates.ts'
import { candidacies } from './schema/candidacies.ts'

const PERMISSIONS = [
    'jobs:write', 'jobs:read',
    'candidates:write', 'candidates:read',
    'applications:write', 'applications:read',
    'roles:write', 'roles:read',
    'users:write', 'users:read',
]

const ROLES = [
    { uuid: randomUUID(), name: 'admin',     description: 'Full access to all resources' },
    { uuid: randomUUID(), name: 'recruiter', description: 'Manages jobs, candidates and applications' },
    { uuid: randomUUID(), name: 'viewer',    description: 'Read-only access' },
]

const RECRUITER_PERMISSIONS = [
    'jobs:write', 'jobs:read',
    'candidates:write', 'candidates:read',
    'applications:write', 'applications:read',
]

// --- Mock job postings -----------------------------------------------------
// `ownerUuid` is filled in at insert time with the seeded admin user.
const MOCK_JOB_POSTINGS = [
    {
        title: 'Senior Backend Engineer (Node.js / TypeScript)',
        body: 'We are looking for a senior backend engineer to lead the design of our ' +
            'event-driven services. You will own critical APIs end to end, mentor mid-level ' +
            'engineers and shape our DDD-oriented architecture.',
        recruiterContact: { email: 'talent@nimbus.io', phoneNumber: '+34 600 111 222' },
        company: { name: 'Nimbus Labs', size: '51-200', website: 'https://nimbus.io', industry: 'Cloud Infrastructure' },
        location: { city: 'Madrid', country: 'Spain', modality: 'hybrid' },
        salary: { min: 55000, max: 75000, currency: 'EUR', period: 'year', equity: true },
        requirements: ['Node.js', 'TypeScript', 'PostgreSQL', 'Domain-Driven Design', 'Docker'],
    },
    {
        title: 'Frontend Engineer (React / Next.js)',
        body: 'Join our product team to build delightful, accessible interfaces. You will work ' +
            'closely with designers and ship features behind feature flags with a strong focus ' +
            'on performance and DX.',
        recruiterContact: { email: 'jobs@brightwave.app', phoneNumber: '+34 600 333 444' },
        company: { name: 'Brightwave', size: '11-50', website: 'https://brightwave.app', industry: 'SaaS' },
        location: { city: 'Valencia', country: 'Spain', modality: 'remote' },
        salary: { min: 40000, max: 55000, currency: 'EUR', period: 'year', equity: false },
        requirements: ['React', 'Next.js', 'TypeScript', 'CSS', 'Testing Library'],
    },
    {
        title: 'DevOps / Platform Engineer',
        body: 'Own our Kubernetes platform and CI/CD pipelines. You will improve reliability, ' +
            'observability and developer self-service across the organization.',
        recruiterContact: { email: 'hiring@corestack.dev' },
        company: { name: 'CoreStack', size: '201-500', website: 'https://corestack.dev', industry: 'Fintech' },
        location: { city: 'Barcelona', country: 'Spain', modality: 'onsite' },
        salary: { min: 50000, max: 70000, currency: 'EUR', period: 'year', equity: true },
        requirements: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD', 'Prometheus'],
    },
    {
        title: 'Junior Data Analyst',
        body: 'Help our growth team turn raw product data into decisions. You will build ' +
            'dashboards, run cohort analyses and partner with marketing and product.',
        recruiterContact: { email: 'people@datapeak.co', phoneNumber: '+34 600 555 666' },
        company: { name: 'DataPeak', size: '11-50', website: 'https://datapeak.co', industry: 'Analytics' },
        location: { city: 'Sevilla', country: 'Spain', modality: 'hybrid' },
        salary: { min: 24000, max: 32000, currency: 'EUR', period: 'year', equity: false },
        requirements: ['SQL', 'Python', 'Tableau', 'Statistics'],
    },
] as const

// --- Mock candidates -------------------------------------------------------
const MOCK_CANDIDATES = [
    {
        name: 'Lucía Fernández',
        title: 'Senior Backend Engineer',
        about: 'Backend engineer with 8 years building distributed systems in Node.js and Go. ' +
            'Strong advocate of DDD and clean architecture.',
        skills: ['Node.js', 'TypeScript', 'PostgreSQL', 'Domain-Driven Design', 'Docker', 'Kubernetes'],
        email: 'lucia.fernandez@example.com',
        phone: '+34 611 000 001',
        address: 'Madrid, Spain',
        website: 'https://lucia.dev',
        github: 'https://github.com/luciafdev',
        linkedin: 'https://linkedin.com/in/luciafdev',
        experience: [
            { company: 'Nimbus Labs', location: 'Madrid', role: 'Tech Lead', duration: '2021 - Present',
              responsibilities: ['Led migration to event-driven architecture', 'Mentored 4 engineers'] },
            { company: 'PayFlow', location: 'Remote', role: 'Backend Engineer', duration: '2017 - 2021',
              responsibilities: ['Built payments API', 'Reduced p99 latency by 40%'] },
        ],
        projects: [{ title: 'openats', description: 'Open-source applicant tracking system' }],
        education: [{ title: 'BSc Computer Science', institution: 'UPM', duration: '2013 - 2017' }],
        certifications: [{ title: 'CKA', institution: 'CNCF', duration: '2022' }],
        languages: [{ language: 'Spanish', level: 'Native' }, { language: 'English', level: 'C1' }],
        cvUrl: 'https://cv.example.com/lucia-fernandez.pdf',
    },
    {
        name: 'Marco Rossi',
        title: 'Frontend Engineer',
        about: 'Frontend engineer passionate about accessibility and performance. 5 years with React ecosystems.',
        skills: ['React', 'Next.js', 'TypeScript', 'CSS', 'Testing Library', 'Storybook'],
        email: 'marco.rossi@example.com',
        phone: '+34 611 000 002',
        address: 'Valencia, Spain',
        website: null,
        github: 'https://github.com/marcorossi',
        linkedin: 'https://linkedin.com/in/marcorossi',
        experience: [
            { company: 'Brightwave', location: 'Remote', role: 'Frontend Engineer', duration: '2020 - Present',
              responsibilities: ['Owned design system', 'Improved Lighthouse score to 98'] },
        ],
        projects: [{ title: 'a11y-kit', description: 'Accessible React component library' }],
        education: [{ title: 'BSc Software Engineering', institution: 'UPV', duration: '2015 - 2019' }],
        certifications: null,
        languages: [{ language: 'Italian', level: 'Native' }, { language: 'English', level: 'C1' }, { language: 'Spanish', level: 'B2' }],
        cvUrl: 'https://cv.example.com/marco-rossi.pdf',
    },
    {
        name: 'Aisha Khan',
        title: 'Platform Engineer',
        about: 'Platform engineer focused on reliability and developer experience. Loves automating toil.',
        skills: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD', 'Prometheus', 'Go'],
        email: 'aisha.khan@example.com',
        phone: '+34 611 000 003',
        address: 'Barcelona, Spain',
        website: 'https://aisha.sh',
        github: 'https://github.com/aishak',
        linkedin: 'https://linkedin.com/in/aishak',
        experience: [
            { company: 'CoreStack', location: 'Barcelona', role: 'SRE', duration: '2019 - Present',
              responsibilities: ['Cut deployment time by 60%', 'Owned incident response'] },
        ],
        projects: null,
        education: [{ title: 'MSc Distributed Systems', institution: 'UPC', duration: '2016 - 2018' }],
        certifications: [{ title: 'AWS Solutions Architect', institution: 'AWS', duration: '2021' }],
        languages: [{ language: 'Urdu', level: 'Native' }, { language: 'English', level: 'C2' }, { language: 'Spanish', level: 'B1' }],
        cvUrl: 'https://cv.example.com/aisha-khan.pdf',
    },
    {
        name: 'Diego Morales',
        title: 'Junior Data Analyst',
        about: 'Recent graduate eager to grow in data analytics. Comfortable with SQL and Python.',
        skills: ['SQL', 'Python', 'Tableau', 'Statistics', 'Excel'],
        email: 'diego.morales@example.com',
        phone: '+34 611 000 004',
        address: 'Sevilla, Spain',
        website: null,
        github: 'https://github.com/diegomorales',
        linkedin: 'https://linkedin.com/in/diegomorales',
        experience: [
            { company: 'University Lab', location: 'Sevilla', role: 'Research Assistant', duration: '2023 - 2024',
              responsibilities: ['Cleaned survey datasets', 'Built reporting dashboards'] },
        ],
        projects: [{ title: 'covid-dashboard', description: 'Public health data visualisation' }],
        education: [{ title: 'BSc Mathematics', institution: 'US', duration: '2020 - 2024' }],
        certifications: null,
        languages: [{ language: 'Spanish', level: 'Native' }, { language: 'English', level: 'B2' }],
        cvUrl: 'https://cv.example.com/diego-morales.pdf',
    },
    {
        name: 'Sophie Laurent',
        title: 'Fullstack Engineer',
        about: 'Versatile engineer comfortable across the stack, from React to Node.js services.',
        skills: ['Node.js', 'TypeScript', 'React', 'PostgreSQL', 'GraphQL'],
        email: 'sophie.laurent@example.com',
        phone: '+34 611 000 005',
        address: 'Madrid, Spain',
        website: 'https://sophielaurent.dev',
        github: 'https://github.com/sophiel',
        linkedin: 'https://linkedin.com/in/sophiel',
        experience: [
            { company: 'Freelance', location: 'Remote', role: 'Fullstack Developer', duration: '2019 - Present',
              responsibilities: ['Delivered 20+ client projects', 'End-to-end ownership'] },
        ],
        projects: [{ title: 'invoice-ninja-clone', description: 'Billing SaaS prototype' }],
        education: [{ title: 'BSc Computer Science', institution: 'Sorbonne', duration: '2014 - 2018' }],
        certifications: null,
        languages: [{ language: 'French', level: 'Native' }, { language: 'English', level: 'C1' }, { language: 'Spanish', level: 'C1' }],
        cvUrl: 'https://cv.example.com/sophie-laurent.pdf',
    },
]

async function seed() {
    const existing = await db.select().from(permissions)
    if (existing.length > 0) {
        console.log('Database already seeded. Skipping.')
        process.exit(0)
    }

    console.log('Seeding permissions...')
    const insertedPerms = await db
        .insert(permissions)
        .values(PERMISSIONS.map(name => ({ name })))
        .returning()
    console.log(`  ${insertedPerms.length} permissions inserted`)

    console.log('Seeding roles...')
    const insertedRoles = await db
        .insert(roles)
        .values(ROLES)
        .returning()
    console.log(`  ${insertedRoles.length} roles inserted`)

    const permByName = Object.fromEntries(insertedPerms.map(p => [p.name, p.id]))
    const roleByName = Object.fromEntries(insertedRoles.map(r => [r.name, r.uuid]))

    const associations: { role_uuid: string; permission_id: number }[] = []

    for (const perm of insertedPerms) {
        associations.push({ role_uuid: roleByName['admin'], permission_id: perm.id })
    }

    for (const name of RECRUITER_PERMISSIONS) {
        associations.push({ role_uuid: roleByName['recruiter'], permission_id: permByName[name] })
    }

    for (const perm of insertedPerms.filter(p => p.name.endsWith(':read'))) {
        associations.push({ role_uuid: roleByName['viewer'], permission_id: perm.id })
    }

    console.log('Seeding role-permission associations...')
    await db.insert(rolesPermissions).values(associations)
    console.log(`  ${associations.length} associations inserted`)

    const [{ uuid }] = await db.insert(users).values({
        email: 'admin@openats.dev',
        password: await bcrypt.hash("123456789", 12),
        name: "Admin",
        uuid: crypto.randomUUID(),
        verificationCode: "",
        verified: true
    }).returning({ uuid: users.uuid })

    await db.insert(rolesUsers).values({
        role_uuid: ROLES[0].uuid,
        user_uuid: uuid
    })

    console.log('Seeding job postings...')
    const insertedOffers = await db
        .insert(jobPostings)
        .values(MOCK_JOB_POSTINGS.map(offer => ({
            uuid: randomUUID(),
            ownerUuid: uuid,
            title: offer.title,
            body: offer.body,
            recruiterContact: offer.recruiterContact,
            company: offer.company,
            location: offer.location,
            salary: offer.salary,
            requirements: offer.requirements,
        })))
        .returning({ uuid: jobPostings.uuid })
    console.log(`  ${insertedOffers.length} job postings inserted`)

    console.log('Seeding candidates...')
    const insertedCandidates = await db
        .insert(candidates)
        .values(MOCK_CANDIDATES.map(c => ({ uuid: randomUUID(), ...c })))
        .returning({ uuid: candidates.uuid })
    console.log(`  ${insertedCandidates.length} candidates inserted`)

    // Link candidates to offers (index into the arrays above) so the board has
    // some realistic candidacies spread across pipeline phases.
    const CANDIDACY_LINKS = [
        { offer: 0, candidate: 0, status: 'interviewing', currentPhaseOrder: 2, score: 88,
          annotations: [{ type: 'positive', body: 'Strong DDD background, great culture fit' }], rejectReason: '' },
        { offer: 0, candidate: 4, status: 'screening', currentPhaseOrder: 1, score: 72,
          annotations: [{ type: 'neutral', body: 'Solid generalist, verify backend depth' }], rejectReason: '' },
        { offer: 1, candidate: 1, status: 'offer', currentPhaseOrder: 3, score: 91,
          annotations: [{ type: 'positive', body: 'Excellent accessibility portfolio' }], rejectReason: '' },
        { offer: 1, candidate: 4, status: 'applied', currentPhaseOrder: 0, score: -1,
          annotations: [], rejectReason: '' },
        { offer: 2, candidate: 2, status: 'hired', currentPhaseOrder: 4, score: 95,
          annotations: [{ type: 'positive', body: 'Outstanding SRE experience' }], rejectReason: '' },
        { offer: 3, candidate: 3, status: 'rejected', currentPhaseOrder: 1, score: 45,
          annotations: [{ type: 'negative', body: 'Not enough hands-on analytics experience yet' }],
          rejectReason: 'Looking for a stronger statistics foundation' },
    ] as const

    console.log('Seeding candidacies...')
    await db.insert(candidacies).values(CANDIDACY_LINKS.map(link => ({
        uuid: randomUUID(),
        offerUuid: insertedOffers[link.offer].uuid,
        candidateUuid: insertedCandidates[link.candidate].uuid,
        status: link.status,
        currentPhaseOrder: link.currentPhaseOrder,
        score: link.score,
        annotations: [...link.annotations],
        rejectReason: link.rejectReason,
    })))
    console.log(`  ${CANDIDACY_LINKS.length} candidacies inserted`)

    console.log('Done!')
    process.exit(0)
}

seed().catch(err => {
    console.error(err)
    process.exit(1)
})
