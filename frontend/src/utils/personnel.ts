import { KeyPerson } from '../types/investigation';

const LEADERSHIP_KEYWORDS = [
  'direct',
  'dirett',
  'president',
  'presid',
  'founder',
  'fondat',
  'curat',
  'program',
  'selezion',
  'select',
  'produc',
  'board',
  'consigli',
  'execut',
  'esecut',
  'secretar',
  'segretar',
  'chair',
  'organiz',
  'organizz',
  'head',
  'lead',
  'manager',
  'coordinat',
  'jury',
  'giuria',
  'artistic',
  'artistico',
  'relation',
  'relazioni',
  'comunicaz',
  'press',
  'ufficio stampa',
];

const COLLABORATOR_KEYWORDS = [
  'student',
  'studente',
  'collaborat',
  'research',
  'ricercat',
  'phd',
  'doctoral',
  'dottorand',
  'volunteer',
  'volontar',
  'assistant',
  'assistent',
  'moderator',
  'speaker',
  'guest',
  'liaison',
  'tutor',
  'intern',
  'stagist',
  'support',
  'staff',
];

export interface CategorizedPersonnel {
  leadership: KeyPerson[];
  connected: KeyPerson[];
}

export function categorizePersonnel(personnel: KeyPerson[]): CategorizedPersonnel {
  const leadership: KeyPerson[] = [];
  const connected: KeyPerson[] = [];

  (personnel || []).forEach((person) => {
    // If person has corporate filings, conflict flags, or sister festivals, they are crucial for governance
    const hasGovernanceTies = Boolean(
      (person.companies && person.companies.length > 0) ||
      (person.associatedFestivals && person.associatedFestivals.length > 0) ||
      person.isFestivalMillSuspect ||
      person.hasDistributionOverlap ||
      (person.flags && person.flags.length > 0),
    );

    const rolesLower = (person.roles || []).join(' ').toLowerCase();

    const isCollaboratorRole = COLLABORATOR_KEYWORDS.some((kw) => rolesLower.includes(kw));
    const isLeadershipRole = LEADERSHIP_KEYWORDS.some((kw) => rolesLower.includes(kw));

    if (hasGovernanceTies || (isLeadershipRole && !isCollaboratorRole)) {
      leadership.push(person);
    } else if (isCollaboratorRole) {
      connected.push(person);
    } else if (isLeadershipRole) {
      leadership.push(person);
    } else {
      // Default: If no role matches, group into leadership if small, otherwise connected
      if (leadership.length < 6) {
        leadership.push(person);
      } else {
        connected.push(person);
      }
    }
  });

  return { leadership, connected };
}
