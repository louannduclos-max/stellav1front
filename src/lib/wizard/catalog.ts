// Louann V1 — Mock data
// Données seed pour le wizard (pas de backend en V1)

export const WIZARD_CATALOG = {
  // ============================
  // Pays disponibles (étape 2)
  // ============================
  continents: [
    { code: 'EU', name: 'Europe',        flag: '🇪🇺' },
    { code: 'NA', name: 'Amérique du Nord', flag: '🌎' },
    { code: 'SA', name: 'Amérique du Sud',  flag: '🌎' },
    { code: 'AF', name: 'Afrique',       flag: '🌍' },
    { code: 'AS', name: 'Asie',          flag: '🌏' },
    { code: 'OC', name: 'Océanie',       flag: '🌏' }
  ],
  pays: [
    // Europe
    { code: 'FR', name: 'France',       flag: '🇫🇷', continent: 'EU', available: true,  note: 'V1 · cadre légal SAP complet' },
    { code: 'BE', name: 'Belgique',     flag: '🇧🇪', continent: 'EU', available: true,  note: 'Titres-services · CCT 318' },
    { code: 'IT', name: 'Italie',       flag: '🇮🇹', continent: 'EU', available: true,  note: 'Badanti / colf · CCNL domestico' },
    { code: 'ES', name: 'Espagne',      flag: '🇪🇸', continent: 'EU', available: true,  note: 'Ley de Dependencia · SAAD' },
    { code: 'DE', name: 'Allemagne',    flag: '🇩🇪', continent: 'EU', available: true,  note: 'Pflegeversicherung · SGB XI' },
    { code: 'UK', name: 'Royaume-Uni',  flag: '🇬🇧', continent: 'EU', available: true,  note: 'CQC · domiciliary care' },
    { code: 'NL', name: 'Pays-Bas',     flag: '🇳🇱', continent: 'EU', available: true,  note: 'Wlz · Wmo 2015' },
    { code: 'PT', name: 'Portugal',     flag: '🇵🇹', continent: 'EU', available: true,  note: 'SAD · Rede Nacional CCI' },
    { code: 'CH', name: 'Suisse',       flag: '🇨🇭', continent: 'EU', available: true,  note: 'Spitex · LAMal' },
    { code: 'AT', name: 'Autriche',     flag: '🇦🇹', continent: 'EU', available: true,  note: 'Pflegegeld · 24h-Betreuung' },
    { code: 'IE', name: 'Irlande',      flag: '🇮🇪', continent: 'EU', available: true,  note: 'HSE · Home Support Scheme' },
    { code: 'SE', name: 'Suède',        flag: '🇸🇪', continent: 'EU', available: true,  note: 'Hemtjänst · LSS' },
    { code: 'DK', name: 'Danemark',     flag: '🇩🇰', continent: 'EU', available: true,  note: 'Hjemmehjælp · Lov om Social Service' },
    { code: 'NO', name: 'Norvège',      flag: '🇳🇴', continent: 'EU', available: true,  note: 'Hjemmesykepleie · helse- og omsorgstjenester' },
    { code: 'FI', name: 'Finlande',     flag: '🇫🇮', continent: 'EU', available: true,  note: 'Kotihoito · vanhuspalvelulaki' },
    { code: 'PL', name: 'Pologne',      flag: '🇵🇱', continent: 'EU', available: true,  note: 'Usługi opiekuńcze · DPS' },
    { code: 'CZ', name: 'Tchéquie',     flag: '🇨🇿', continent: 'EU', available: true,  note: 'Pečovatelská služba · zákon 108/2006' },
    { code: 'GR', name: 'Grèce',        flag: '🇬🇷', continent: 'EU', available: true,  note: 'KIFI · domiciliary care' },
    { code: 'LU', name: 'Luxembourg',   flag: '🇱🇺', continent: 'EU', available: true,  note: 'Assurance dépendance · ADEM' },
    // Amérique du Nord
    { code: 'US', name: 'États-Unis',   flag: '🇺🇸', continent: 'NA', available: true,  note: 'Home Care · Medicare / Medicaid' },
    { code: 'CA', name: 'Canada',       flag: '🇨🇦', continent: 'NA', available: true,  note: 'Soins à domicile · provinces' },
    { code: 'MX', name: 'Mexique',      flag: '🇲🇽', continent: 'NA', available: true,  note: 'Cuidados domiciliarios · IMSS' },
    // Amérique du Sud
    { code: 'BR', name: 'Brésil',       flag: '🇧🇷', continent: 'SA', available: true,  note: 'Cuidador de idosos · SUS' },
    { code: 'AR', name: 'Argentine',    flag: '🇦🇷', continent: 'SA', available: true,  note: 'Cuidadores domiciliarios · PAMI' },
    { code: 'CL', name: 'Chili',        flag: '🇨🇱', continent: 'SA', available: true,  note: 'SENAMA · cuidados domiciliarios' },
    { code: 'CO', name: 'Colombie',     flag: '🇨🇴', continent: 'SA', available: true,  note: 'Cuidado domiciliario · MinSalud' },
    // Afrique
    { code: 'MA', name: 'Maroc',        flag: '🇲🇦', continent: 'AF', available: true,  note: 'Aide à domicile · cadre ANAPEC' },
    { code: 'TN', name: 'Tunisie',      flag: '🇹🇳', continent: 'AF', available: true,  note: 'Aide à domicile · cadre MAS' },
    { code: 'DZ', name: 'Algérie',      flag: '🇩🇿', continent: 'AF', available: true,  note: 'Aide à domicile · cadre national' },
    { code: 'SN', name: 'Sénégal',      flag: '🇸🇳', continent: 'AF', available: false, note: '2027' },
    { code: 'ZA', name: 'Afrique du Sud', flag: '🇿🇦', continent: 'AF', available: true, note: 'Home-based care · DSD' },
    // Asie
    { code: 'JP', name: 'Japon',        flag: '🇯🇵', continent: 'AS', available: true,  note: 'Kaigo Hoken · LTCI 2000' },
    { code: 'CN', name: 'Chine',        flag: '🇨🇳', continent: 'AS', available: false, note: '2027' },
    { code: 'KR', name: 'Corée du Sud', flag: '🇰🇷', continent: 'AS', available: true,  note: 'LTCI · 노인장기요양보험' },
    { code: 'SG', name: 'Singapour',    flag: '🇸🇬', continent: 'AS', available: true,  note: 'AIC · home care services' },
    // Océanie
    { code: 'AU', name: 'Australie',    flag: '🇦🇺', continent: 'OC', available: true,  note: 'Home Care Packages · My Aged Care' },
    { code: 'NZ', name: 'Nouvelle-Zélande', flag: '🇳🇿', continent: 'OC', available: true, note: 'Home & community support services' }
  ],

  // ============================
  // Marques / clients préconfigurés (étape 1 — sélection de marque)
  // ============================
  marques: [
    {
      key: 'bonadea',
      name: 'Bonadea Care',
      tagline: 'Senior care premium · Bordeaux',
      sector: 'Service à la personne',
      subSector: 'Senior care',
      website: 'bonadea-care.fr',
      hq: 'Bordeaux (33)',
      activities: ['Aide à domicile personnes âgées', 'Aide à la personne', 'Garde de nuit / présence'],
      targets: ['Sénior autonome', 'Sénior fragile', 'Grand âge'],
      palette: 'bonadea',
      defaults: {
        clientName: 'Bonadea Care',
        palette: 'bonadea',
        sousSecteurs: ['aide_domicile_pa', 'aide_pers', 'garde_nuit'],
        cibles: ['senior_autonome', 'senior_fragile', 'grand_age']
      }
    },
    {
      key: 'ouicare',
      name: 'OuiCare',
      tagline: 'Réseau national SAP · 200+ agences',
      sector: 'Service à la personne',
      subSector: 'Senior care + Famille',
      website: 'ouicare.com',
      hq: 'Paris (75)',
      activities: ['Ménage / entretien', 'Aide à domicile personnes âgées', 'Garde d’enfants'],
      targets: ['Familles actives', 'Sénior autonome', 'Aidants familiaux'],
      palette: 'ouicare',
      defaults: {
        clientName: 'OuiCare',
        palette: 'ouicare',
        sousSecteurs: ['menage_entretien', 'aide_domicile_pa', 'garde_enfants'],
        cibles: ['familles_actives', 'senior_autonome', 'aidants']
      }
    },
    {
      key: 'interdom',
      name: 'Interdomicilio',
      tagline: 'Réseau multi-services à domicile · familles & seniors actifs',
      sector: 'Service à la personne',
      subSector: 'Multi-services à domicile',
      website: 'interdomicilio.fr',
      hq: 'Lyon (69)',
      activities: ['Ménage / entretien', 'Aide à domicile personnes âgées', 'Garde d’enfants', 'Petit bricolage', 'Multi-services'],
      targets: ['Familles actives', 'Sénior autonome', 'Jeunes parents', 'Aidants familiaux'],
      palette: 'interdom',
      defaults: {
        clientName: 'Interdomicilio',
        palette: 'interdom',
        sousSecteurs: ['menage_entretien', 'aide_domicile_pa', 'garde_enfants', 'petit_bricolage', 'multi_services'],
        cibles: ['familles_actives', 'senior_autonome', 'jeunes_parents', 'aidants']
      }
    },
    {
      key: 'custom',
      name: 'Nouvelle marque',
      tagline: 'Étude pour un client non listé · saisie manuelle',
      sector: 'Service à la personne',
      subSector: 'Senior care',
      website: '—',
      hq: '—',
      activities: [],
      targets: [],
      palette: 'flexibia',
      defaults: {
        clientName: '',
        palette: 'flexibia',
        sousSecteurs: [],
        cibles: []
      }
    }
  ],

  // ============================
  // Types d'étude (étape 1)
  // ============================
  typesEtude: [
    {
      key: 'FE',
      name: "Étude de Faisabilité d'Implantation & Expansion",
      desc: "Viabilité locale + faisabilité nationale + export franchise · vue 360° marché, concurrence, opportunités.",
      kpis: 12,
      reco: true,
      kpisAuto: ['pop_senior_65', 'evol_demo_2020_2030', 'densite_gerontologique', 'revenu_median_seniors', 'taux_penetration_sap', 'nb_heures_sap_an', 'top_services_demandes', 'turnover_secteur', 'salaire_moyen_brut', 'nb_acteurs_sap', 'top5_parts_marche', 'volume_marche_local']
    },
    {
      key: 'EM',
      name: "Étude de Marché Sectorielle / Pays",
      desc: "Marché macro d'un secteur dans un pays · demande, taille, dynamique, viabilité.",
      kpis: 8,
      kpisAuto: ['pop_senior_65', 'evol_demo_2020_2030', 'densite_gerontologique', 'taux_penetration_sap', 'nb_heures_sap_an', 'nb_acteurs_sap', 'top5_parts_marche', 'volume_marche_local']
    },
    {
      key: 'AC',
      name: "Étude Concurrentielle Approfondie",
      desc: "Benchmark détaillé multi-acteurs · positionnement, parts de marché, offres, prix.",
      kpis: 6,
      kpisAuto: ['nb_acteurs_sap', 'top5_parts_marche', 'taux_penetration_sap', 'volume_marche_local', 'salaire_moyen_brut', 'turnover_secteur']
    },
    {
      key: 'ED',
      name: "Étude Digitale / SEO & Canaux",
      desc: "Visibilité, mots-clés, médias, habitudes de consommation digitales.",
      kpis: 7,
      kpisAuto: ['pop_senior_65', 'revenu_median_seniors', 'taux_penetration_sap', 'top_services_demandes', 'nb_acteurs_sap', 'volume_marche_local', 'evol_demo_2020_2030']
    },
    {
      key: 'MP',
      name: "Étude / Mapping de Partenaires",
      desc: "Fiches sociétés pour partenariats · sourcing, qualification, priorisation.",
      kpis: 6,
      kpisAuto: ['nb_acteurs_sap', 'top5_parts_marche', 'volume_marche_local', 'taux_penetration_sap', 'top_services_demandes', 'densite_gerontologique']
    },
    {
      key: 'DD',
      name: "Étude de Due Diligence Financière",
      desc: "Analyse buy-side d'une entreprise · santé financière, risques, opportunités d'acquisition.",
      kpis: 9,
      kpisAuto: ['nb_acteurs_sap', 'top5_parts_marche', 'volume_marche_local', 'salaire_moyen_brut', 'turnover_secteur', 'taux_penetration_sap', 'revenu_median_seniors', 'nb_heures_sap_an', 'top_services_demandes']
    }
  ],

  // ============================
  // Villes (étape 2 — autocomplete mock)
  // ============================
  villes: [
    // ==== FRANCE ====
    { country: 'FR', ville: 'Paris',          dept: '75', deptName: 'Paris',              region: 'Île-de-France' },
    { country: 'FR', ville: 'Lyon',           dept: '69', deptName: 'Rhône',              region: 'Auvergne-Rhône-Alpes' },
    { country: 'FR', ville: 'Marseille',      dept: '13', deptName: 'Bouches-du-Rhône',   region: "Provence-Alpes-Côte d'Azur" },
    { country: 'FR', ville: 'Toulouse',       dept: '31', deptName: 'Haute-Garonne',      region: 'Occitanie' },
    { country: 'FR', ville: 'Nice',           dept: '06', deptName: 'Alpes-Maritimes',    region: "Provence-Alpes-Côte d'Azur" },
    { country: 'FR', ville: 'Nantes',         dept: '44', deptName: 'Loire-Atlantique',   region: 'Pays de la Loire' },
    { country: 'FR', ville: 'Bordeaux',       dept: '33', deptName: 'Gironde',            region: 'Nouvelle-Aquitaine' },
    { country: 'FR', ville: 'Montpellier',    dept: '34', deptName: 'Hérault',            region: 'Occitanie' },
    { country: 'FR', ville: 'Strasbourg',     dept: '67', deptName: 'Bas-Rhin',           region: 'Grand Est' },
    { country: 'FR', ville: 'Lille',          dept: '59', deptName: 'Nord',               region: 'Hauts-de-France' },
    { country: 'FR', ville: 'Rennes',         dept: '35', deptName: 'Ille-et-Vilaine',    region: 'Bretagne' },
    { country: 'FR', ville: 'Brest',          dept: '29', deptName: 'Finistère',          region: 'Bretagne' },
    { country: 'FR', ville: 'Le Havre',       dept: '76', deptName: 'Seine-Maritime',     region: 'Normandie' },
    { country: 'FR', ville: 'Reims',          dept: '51', deptName: 'Marne',              region: 'Grand Est' },
    { country: 'FR', ville: 'Saint-Étienne',  dept: '42', deptName: 'Loire',              region: 'Auvergne-Rhône-Alpes' },
    { country: 'FR', ville: 'Toulon',         dept: '83', deptName: 'Var',                region: "Provence-Alpes-Côte d'Azur" },
    { country: 'FR', ville: 'Grenoble',       dept: '38', deptName: 'Isère',              region: 'Auvergne-Rhône-Alpes' },
    { country: 'FR', ville: 'Dijon',          dept: '21', deptName: "Côte-d'Or",          region: 'Bourgogne-Franche-Comté' },
    { country: 'FR', ville: 'Angers',         dept: '49', deptName: 'Maine-et-Loire',     region: 'Pays de la Loire' },
    { country: 'FR', ville: 'Nîmes',          dept: '30', deptName: 'Gard',               region: 'Occitanie' },
    { country: 'FR', ville: 'Aix-en-Provence',dept: '13', deptName: 'Bouches-du-Rhône',   region: "Provence-Alpes-Côte d'Azur" },
    // FR — quartiers
    { country: 'FR', ville: 'Paris 6e — Saint-Germain', parent: 'Paris', dept: '75', deptName: 'Paris', region: 'Île-de-France', type: 'quartier' },
    { country: 'FR', ville: 'Paris 7e — Invalides',     parent: 'Paris', dept: '75', deptName: 'Paris', region: 'Île-de-France', type: 'quartier' },
    { country: 'FR', ville: 'Paris 16e — Passy',        parent: 'Paris', dept: '75', deptName: 'Paris', region: 'Île-de-France', type: 'quartier' },
    { country: 'FR', ville: 'Paris 17e — Batignolles',  parent: 'Paris', dept: '75', deptName: 'Paris', region: 'Île-de-France', type: 'quartier' },
    { country: 'FR', ville: 'Lyon 6e — Brotteaux',      parent: 'Lyon',  dept: '69', deptName: 'Rhône', region: 'Auvergne-Rhône-Alpes', type: 'quartier' },
    { country: 'FR', ville: 'Lyon 2e — Confluence',     parent: 'Lyon',  dept: '69', deptName: 'Rhône', region: 'Auvergne-Rhône-Alpes', type: 'quartier' },
    { country: 'FR', ville: 'Lyon 1er — Croix-Rousse',  parent: 'Lyon',  dept: '69', deptName: 'Rhône', region: 'Auvergne-Rhône-Alpes', type: 'quartier' },
    { country: 'FR', ville: 'Marseille 8e — Prado',     parent: 'Marseille', dept: '13', deptName: 'Bouches-du-Rhône', region: "Provence-Alpes-Côte d'Azur", type: 'quartier' },
    { country: 'FR', ville: 'Marseille 9e — Mazargues', parent: 'Marseille', dept: '13', deptName: 'Bouches-du-Rhône', region: "Provence-Alpes-Côte d'Azur", type: 'quartier' },
    { country: 'FR', ville: 'Caudéran',  parent: 'Bordeaux', dept: '33', deptName: 'Gironde', region: 'Nouvelle-Aquitaine', type: 'quartier' },
    { country: 'FR', ville: 'Chartrons', parent: 'Bordeaux', dept: '33', deptName: 'Gironde', region: 'Nouvelle-Aquitaine', type: 'quartier' },
    { country: 'FR', ville: 'Bastide',   parent: 'Bordeaux', dept: '33', deptName: 'Gironde', region: 'Nouvelle-Aquitaine', type: 'quartier' },
    { country: 'FR', ville: 'Pessac',    parent: 'Bordeaux', dept: '33', deptName: 'Gironde', region: 'Nouvelle-Aquitaine', type: 'quartier' },
    { country: 'FR', ville: 'Talence',   parent: 'Bordeaux', dept: '33', deptName: 'Gironde', region: 'Nouvelle-Aquitaine', type: 'quartier' },
    { country: 'FR', ville: 'Nice — Cimiez',     parent: 'Nice', dept: '06', deptName: 'Alpes-Maritimes', region: "Provence-Alpes-Côte d'Azur", type: 'quartier' },
    { country: 'FR', ville: "Nice — Carré d'Or", parent: 'Nice', dept: '06', deptName: 'Alpes-Maritimes', region: "Provence-Alpes-Côte d'Azur", type: 'quartier' },
    { country: 'FR', ville: 'Toulouse — Capitole',     parent: 'Toulouse', dept: '31', deptName: 'Haute-Garonne', region: 'Occitanie', type: 'quartier' },
    { country: 'FR', ville: 'Toulouse — Saint-Cyprien',parent: 'Toulouse', dept: '31', deptName: 'Haute-Garonne', region: 'Occitanie', type: 'quartier' },

    // FR — agglomérations / métropoles / intercommunalités
    { country: 'FR', ville: 'Métropole du Grand Paris',          parent: 'Paris',      dept: '75', deptName: 'Paris',            region: 'Île-de-France',           type: 'agglo', kind: 'métropole' },
    { country: 'FR', ville: 'Métropole de Lyon',                  parent: 'Lyon',       dept: '69', deptName: 'Rhône',            region: 'Auvergne-Rhône-Alpes',    type: 'agglo', kind: 'métropole' },
    { country: 'FR', ville: 'Métropole Aix-Marseille-Provence',   parent: 'Marseille',  dept: '13', deptName: 'Bouches-du-Rhône', region: "Provence-Alpes-Côte d'Azur", type: 'agglo', kind: 'métropole' },
    { country: 'FR', ville: 'Bordeaux Métropole',                 parent: 'Bordeaux',   dept: '33', deptName: 'Gironde',          region: 'Nouvelle-Aquitaine',      type: 'agglo', kind: 'métropole' },
    { country: 'FR', ville: 'Toulouse Métropole',                 parent: 'Toulouse',   dept: '31', deptName: 'Haute-Garonne',    region: 'Occitanie',               type: 'agglo', kind: 'métropole' },
    { country: 'FR', ville: 'Métropole Européenne de Lille',      parent: 'Lille',      dept: '59', deptName: 'Nord',             region: 'Hauts-de-France',         type: 'agglo', kind: 'métropole' },
    { country: 'FR', ville: 'Nantes Métropole',                   parent: 'Nantes',     dept: '44', deptName: 'Loire-Atlantique', region: 'Pays de la Loire',        type: 'agglo', kind: 'métropole' },
    { country: 'FR', ville: 'Eurométropole de Strasbourg',        parent: 'Strasbourg', dept: '67', deptName: 'Bas-Rhin',         region: 'Grand Est',               type: 'agglo', kind: 'métropole' },
    { country: 'FR', ville: 'Métropole Nice Côte d\'Azur',         parent: 'Nice',       dept: '06', deptName: 'Alpes-Maritimes',  region: "Provence-Alpes-Côte d'Azur", type: 'agglo', kind: 'métropole' },
    { country: 'FR', ville: 'Montpellier Méditerranée Métropole', parent: 'Montpellier',dept: '34', deptName: 'Hérault',          region: 'Occitanie',               type: 'agglo', kind: 'métropole' },
    { country: 'FR', ville: 'Rennes Métropole',                   parent: 'Rennes',     dept: '35', deptName: 'Ille-et-Vilaine',  region: 'Bretagne',                type: 'agglo', kind: 'métropole' },
    { country: 'FR', ville: 'Métropole Rouen Normandie',          parent: 'Rouen',      dept: '76', deptName: 'Seine-Maritime',   region: 'Normandie',               type: 'agglo', kind: 'métropole' },
    { country: 'FR', ville: 'Grenoble-Alpes Métropole',           parent: 'Grenoble',   dept: '38', deptName: 'Isère',            region: 'Auvergne-Rhône-Alpes',    type: 'agglo', kind: 'métropole' },
    { country: 'FR', ville: 'Brest Métropole',                    parent: 'Brest',      dept: '29', deptName: 'Finistère',        region: 'Bretagne',                type: 'agglo', kind: 'métropole' },
    { country: 'FR', ville: 'Métropole Toulon-Provence-Méditerranée', parent: 'Toulon', dept: '83', deptName: 'Var',              region: "Provence-Alpes-Côte d'Azur", type: 'agglo', kind: 'métropole' },
    { country: 'FR', ville: 'Orléans Métropole',                  parent: 'Orléans',    dept: '45', deptName: 'Loiret',           region: 'Centre-Val de Loire',     type: 'agglo', kind: 'métropole' },
    { country: 'FR', ville: 'Tours Métropole Val de Loire',       parent: 'Tours',      dept: '37', deptName: 'Indre-et-Loire',   region: 'Centre-Val de Loire',     type: 'agglo', kind: 'métropole' },
    { country: 'FR', ville: 'Clermont Auvergne Métropole',        parent: 'Clermont-Ferrand', dept: '63', deptName: 'Puy-de-Dôme', region: 'Auvergne-Rhône-Alpes',   type: 'agglo', kind: 'métropole' },
    { country: 'FR', ville: 'Saint-Étienne Métropole',            parent: 'Saint-Étienne', dept: '42', deptName: 'Loire',         region: 'Auvergne-Rhône-Alpes',    type: 'agglo', kind: 'métropole' },
    { country: 'FR', ville: 'Dijon Métropole',                    parent: 'Dijon',      dept: '21', deptName: "Côte-d'Or",        region: 'Bourgogne-Franche-Comté', type: 'agglo', kind: 'métropole' },
    { country: 'FR', ville: 'CU Grand Reims',                     parent: 'Reims',      dept: '51', deptName: 'Marne',            region: 'Grand Est',               type: 'agglo', kind: 'communauté urbaine' },
    { country: 'FR', ville: 'CA Pau Béarn Pyrénées',              parent: 'Pau',        dept: '64', deptName: 'Pyrénées-Atlantiques', region: 'Nouvelle-Aquitaine',  type: 'agglo', kind: "communauté d'agglomération" },
    { country: 'FR', ville: 'Communauté Pays Basque',             parent: 'Bayonne',    dept: '64', deptName: 'Pyrénées-Atlantiques', region: 'Nouvelle-Aquitaine',  type: 'agglo', kind: "communauté d'agglomération" },
    { country: 'FR', ville: 'CA La Rochelle',                     parent: 'La Rochelle',dept: '17', deptName: 'Charente-Maritime',region: 'Nouvelle-Aquitaine',      type: 'agglo', kind: "communauté d'agglomération" },
    { country: 'FR', ville: 'CA Caen la Mer',                     parent: 'Caen',       dept: '14', deptName: 'Calvados',         region: 'Normandie',               type: 'agglo', kind: "communauté d'agglomération" },
    { country: 'FR', ville: 'CA Grand Angoulême',                 parent: 'Angoulême',  dept: '16', deptName: 'Charente',         region: 'Nouvelle-Aquitaine',      type: 'agglo', kind: "communauté d'agglomération" },

    // ==== ESPAGNE ====
    { country: 'ES', ville: 'Madrid',     dept: 'M',  deptName: 'Madrid',     region: 'Comunidad de Madrid' },
    { country: 'ES', ville: 'Barcelone',  dept: 'B',  deptName: 'Barcelona',  region: 'Catalogne' },
    { country: 'ES', ville: 'Valence',    dept: 'V',  deptName: 'València',   region: 'Communauté valencienne' },
    { country: 'ES', ville: 'Séville',    dept: 'SE', deptName: 'Sevilla',    region: 'Andalousie' },
    { country: 'ES', ville: 'Saragosse',  dept: 'Z',  deptName: 'Zaragoza',   region: 'Aragon' },
    { country: 'ES', ville: 'Málaga',     dept: 'MA', deptName: 'Málaga',     region: 'Andalousie' },
    { country: 'ES', ville: 'Murcie',     dept: 'MU', deptName: 'Murcia',     region: 'Murcie' },
    { country: 'ES', ville: 'Palma',      dept: 'PM', deptName: 'Mallorca',   region: 'Îles Baléares' },
    { country: 'ES', ville: 'Las Palmas', dept: 'GC', deptName: 'Las Palmas', region: 'Canaries' },
    { country: 'ES', ville: 'Bilbao',     dept: 'BI', deptName: 'Biscaye',    region: 'Pays basque' },
    { country: 'ES', ville: 'Alicante',   dept: 'A',  deptName: 'Alacant',    region: 'Communauté valencienne' },
    { country: 'ES', ville: 'Cordoue',    dept: 'CO', deptName: 'Córdoba',    region: 'Andalousie' },
    { country: 'ES', ville: 'Valladolid', dept: 'VA', deptName: 'Valladolid', region: 'Castille-et-León' },
    { country: 'ES', ville: 'Vigo',       dept: 'PO', deptName: 'Pontevedra', region: 'Galice' },
    { country: 'ES', ville: 'Gijón',      dept: 'O',  deptName: 'Asturies',   region: 'Asturies' },
    // ES — barrios
    { country: 'ES', ville: 'Madrid — Salamanca',   parent: 'Madrid',    dept: 'M', deptName: 'Madrid',    region: 'Comunidad de Madrid', type: 'quartier' },
    { country: 'ES', ville: 'Madrid — Chamberí',    parent: 'Madrid',    dept: 'M', deptName: 'Madrid',    region: 'Comunidad de Madrid', type: 'quartier' },
    { country: 'ES', ville: 'Madrid — Chamartín',   parent: 'Madrid',    dept: 'M', deptName: 'Madrid',    region: 'Comunidad de Madrid', type: 'quartier' },
    { country: 'ES', ville: 'Madrid — Retiro',      parent: 'Madrid',    dept: 'M', deptName: 'Madrid',    region: 'Comunidad de Madrid', type: 'quartier' },
    { country: 'ES', ville: 'Madrid — Centro',      parent: 'Madrid',    dept: 'M', deptName: 'Madrid',    region: 'Comunidad de Madrid', type: 'quartier' },
    { country: 'ES', ville: 'Madrid — Moncloa-Aravaca', parent: 'Madrid', dept: 'M', deptName: 'Madrid',   region: 'Comunidad de Madrid', type: 'quartier' },
    { country: 'ES', ville: 'Barcelone — Eixample', parent: 'Barcelone', dept: 'B', deptName: 'Barcelona', region: 'Catalogne', type: 'quartier' },
    { country: 'ES', ville: 'Barcelone — Gràcia',   parent: 'Barcelone', dept: 'B', deptName: 'Barcelona', region: 'Catalogne', type: 'quartier' },
    { country: 'ES', ville: 'Barcelone — Sarrià-Sant Gervasi', parent: 'Barcelone', dept: 'B', deptName: 'Barcelona', region: 'Catalogne', type: 'quartier' },
    { country: 'ES', ville: 'Barcelone — Les Corts', parent: 'Barcelone', dept: 'B', deptName: 'Barcelona', region: 'Catalogne', type: 'quartier' },
    { country: 'ES', ville: 'Barcelone — Ciutat Vella', parent: 'Barcelone', dept: 'B', deptName: 'Barcelona', region: 'Catalogne', type: 'quartier' },
    { country: 'ES', ville: 'Valence — Ruzafa',     parent: 'Valence',   dept: 'V', deptName: 'València',  region: 'Communauté valencienne', type: 'quartier' },
    { country: 'ES', ville: 'Séville — Triana',     parent: 'Séville',   dept: 'SE', deptName: 'Sevilla',  region: 'Andalousie', type: 'quartier' },
    // ES — áreas metropolitanas
    { country: 'ES', ville: 'Área Metropolitana de Barcelona', parent: 'Barcelone', dept: 'B', deptName: 'Barcelona', region: 'Catalogne', type: 'agglo', kind: 'área metropolitana' },
    { country: 'ES', ville: 'Área Metropolitana de Valencia',  parent: 'Valence',   dept: 'V', deptName: 'València',  region: 'Communauté valencienne', type: 'agglo', kind: 'área metropolitana' },
    { country: 'ES', ville: 'Área Metropolitana de Sevilla',   parent: 'Séville',   dept: 'SE', deptName: 'Sevilla',  region: 'Andalousie', type: 'agglo', kind: 'área metropolitana' },
    { country: 'ES', ville: 'Comunidad de Madrid',             parent: 'Madrid',    dept: 'M', deptName: 'Madrid',    region: 'Comunidad de Madrid', type: 'agglo', kind: 'comunidad' },

    // ==== ITALIE ====
    { country: 'IT', ville: 'Rome',     dept: 'RM', deptName: 'Roma',    region: 'Latium' },
    { country: 'IT', ville: 'Milan',    dept: 'MI', deptName: 'Milano',  region: 'Lombardie' },
    { country: 'IT', ville: 'Naples',   dept: 'NA', deptName: 'Napoli',  region: 'Campanie' },
    { country: 'IT', ville: 'Turin',    dept: 'TO', deptName: 'Torino',  region: 'Piémont' },
    { country: 'IT', ville: 'Palerme',  dept: 'PA', deptName: 'Palermo', region: 'Sicile' },
    { country: 'IT', ville: 'Gênes',    dept: 'GE', deptName: 'Genova',  region: 'Ligurie' },
    { country: 'IT', ville: 'Bologne',  dept: 'BO', deptName: 'Bologna', region: 'Émilie-Romagne' },
    { country: 'IT', ville: 'Florence', dept: 'FI', deptName: 'Firenze', region: 'Toscane' },
    { country: 'IT', ville: 'Bari',     dept: 'BA', deptName: 'Bari',    region: 'Pouilles' },
    { country: 'IT', ville: 'Catane',   dept: 'CT', deptName: 'Catania', region: 'Sicile' },
    { country: 'IT', ville: 'Venise',   dept: 'VE', deptName: 'Venezia', region: 'Vénétie' },
    { country: 'IT', ville: 'Vérone',   dept: 'VR', deptName: 'Verona',  region: 'Vénétie' },
    // IT — quartieri
    { country: 'IT', ville: 'Rome — Parioli',        parent: 'Rome',  dept: 'RM', deptName: 'Roma',   region: 'Latium', type: 'quartier' },
    { country: 'IT', ville: 'Rome — Prati',          parent: 'Rome',  dept: 'RM', deptName: 'Roma',   region: 'Latium', type: 'quartier' },
    { country: 'IT', ville: 'Rome — Trastevere',     parent: 'Rome',  dept: 'RM', deptName: 'Roma',   region: 'Latium', type: 'quartier' },
    { country: 'IT', ville: 'Rome — EUR',            parent: 'Rome',  dept: 'RM', deptName: 'Roma',   region: 'Latium', type: 'quartier' },
    { country: 'IT', ville: 'Milan — Brera',         parent: 'Milan', dept: 'MI', deptName: 'Milano', region: 'Lombardie', type: 'quartier' },
    { country: 'IT', ville: 'Milan — Navigli',       parent: 'Milan', dept: 'MI', deptName: 'Milano', region: 'Lombardie', type: 'quartier' },
    { country: 'IT', ville: 'Milan — Porta Nuova',   parent: 'Milan', dept: 'MI', deptName: 'Milano', region: 'Lombardie', type: 'quartier' },
    { country: 'IT', ville: 'Milan — Isola',         parent: 'Milan', dept: 'MI', deptName: 'Milano', region: 'Lombardie', type: 'quartier' },
    { country: 'IT', ville: 'Naples — Chiaia',       parent: 'Naples',dept: 'NA', deptName: 'Napoli', region: 'Campanie', type: 'quartier' },
    { country: 'IT', ville: 'Naples — Vomero',       parent: 'Naples',dept: 'NA', deptName: 'Napoli', region: 'Campanie', type: 'quartier' },
    { country: 'IT', ville: 'Turin — Crocetta',      parent: 'Turin', dept: 'TO', deptName: 'Torino', region: 'Piémont', type: 'quartier' },

    // ==== ALLEMAGNE ====
    { country: 'DE', ville: 'Berlin',      dept: 'BE', deptName: 'Berlin',   region: 'Berlin' },
    { country: 'DE', ville: 'Hambourg',    dept: 'HH', deptName: 'Hamburg',  region: 'Hambourg' },
    { country: 'DE', ville: 'Munich',      dept: 'BY', deptName: 'München',  region: 'Bavière' },
    { country: 'DE', ville: 'Cologne',     dept: 'NW', deptName: 'Köln',     region: 'Rhénanie-du-Nord-Westphalie' },
    { country: 'DE', ville: 'Francfort',   dept: 'HE', deptName: 'Frankfurt',region: 'Hesse' },
    { country: 'DE', ville: 'Stuttgart',   dept: 'BW', deptName: 'Stuttgart',region: 'Bade-Wurtemberg' },
    { country: 'DE', ville: 'Düsseldorf',  dept: 'NW', deptName: 'Düsseldorf',region: 'Rhénanie-du-Nord-Westphalie' },
    { country: 'DE', ville: 'Leipzig',     dept: 'SN', deptName: 'Leipzig',  region: 'Saxe' },
    { country: 'DE', ville: 'Dortmund',    dept: 'NW', deptName: 'Dortmund', region: 'Rhénanie-du-Nord-Westphalie' },
    { country: 'DE', ville: 'Brême',       dept: 'HB', deptName: 'Bremen',   region: 'Brême' },
    { country: 'DE', ville: 'Dresde',      dept: 'SN', deptName: 'Dresden',  region: 'Saxe' },
    { country: 'DE', ville: 'Hanovre',     dept: 'NI', deptName: 'Hannover', region: 'Basse-Saxe' },
    { country: 'DE', ville: 'Nuremberg',   dept: 'BY', deptName: 'Nürnberg', region: 'Bavière' },
    // DE — Bezirke
    { country: 'DE', ville: 'Berlin — Charlottenburg-Wilmersdorf', parent: 'Berlin', dept: 'BE', deptName: 'Berlin', region: 'Berlin', type: 'quartier' },
    { country: 'DE', ville: 'Berlin — Mitte',                       parent: 'Berlin', dept: 'BE', deptName: 'Berlin', region: 'Berlin', type: 'quartier' },
    { country: 'DE', ville: 'Berlin — Prenzlauer Berg',             parent: 'Berlin', dept: 'BE', deptName: 'Berlin', region: 'Berlin', type: 'quartier' },
    { country: 'DE', ville: 'Berlin — Kreuzberg',                   parent: 'Berlin', dept: 'BE', deptName: 'Berlin', region: 'Berlin', type: 'quartier' },
    { country: 'DE', ville: 'Berlin — Steglitz-Zehlendorf',         parent: 'Berlin', dept: 'BE', deptName: 'Berlin', region: 'Berlin', type: 'quartier' },
    { country: 'DE', ville: 'Munich — Schwabing',                   parent: 'Munich', dept: 'BY', deptName: 'München', region: 'Bavière', type: 'quartier' },
    { country: 'DE', ville: 'Munich — Bogenhausen',                 parent: 'Munich', dept: 'BY', deptName: 'München', region: 'Bavière', type: 'quartier' },
    { country: 'DE', ville: 'Hambourg — Eppendorf',                 parent: 'Hambourg', dept: 'HH', deptName: 'Hamburg', region: 'Hambourg', type: 'quartier' },
    { country: 'DE', ville: 'Hambourg — Altona',                    parent: 'Hambourg', dept: 'HH', deptName: 'Hamburg', region: 'Hambourg', type: 'quartier' },

    // ==== ROYAUME-UNI ====
    { country: 'UK', ville: 'Londres',     dept: 'LDN', deptName: 'Greater London', region: 'England' },
    { country: 'UK', ville: 'Birmingham',  dept: 'WM',  deptName: 'West Midlands',  region: 'England' },
    { country: 'UK', ville: 'Manchester',  dept: 'GM',  deptName: 'Greater Manchester', region: 'England' },
    { country: 'UK', ville: 'Glasgow',     dept: 'GLG', deptName: 'Glasgow City',   region: 'Scotland' },
    { country: 'UK', ville: 'Édimbourg',   dept: 'EDH', deptName: 'Edinburgh',      region: 'Scotland' },
    { country: 'UK', ville: 'Liverpool',   dept: 'MSY', deptName: 'Merseyside',     region: 'England' },
    { country: 'UK', ville: 'Leeds',       dept: 'WYK', deptName: 'West Yorkshire', region: 'England' },
    { country: 'UK', ville: 'Bristol',     dept: 'BST', deptName: 'Bristol',        region: 'England' },
    { country: 'UK', ville: 'Cardiff',     dept: 'CDF', deptName: 'Cardiff',        region: 'Wales' },
    { country: 'UK', ville: 'Belfast',     dept: 'BFS', deptName: 'Belfast',        region: 'Northern Ireland' },
    { country: 'UK', ville: 'Newcastle',   dept: 'TYW', deptName: 'Tyne and Wear',  region: 'England' },
    { country: 'UK', ville: 'Sheffield',   dept: 'SYK', deptName: 'South Yorkshire',region: 'England' },
    // UK — boroughs
    { country: 'UK', ville: 'Londres — Westminster',  parent: 'Londres', dept: 'LDN', deptName: 'Greater London', region: 'England', type: 'quartier' },
    { country: 'UK', ville: 'Londres — Kensington & Chelsea', parent: 'Londres', dept: 'LDN', deptName: 'Greater London', region: 'England', type: 'quartier' },
    { country: 'UK', ville: 'Londres — Camden',       parent: 'Londres', dept: 'LDN', deptName: 'Greater London', region: 'England', type: 'quartier' },
    { country: 'UK', ville: 'Londres — Islington',    parent: 'Londres', dept: 'LDN', deptName: 'Greater London', region: 'England', type: 'quartier' },
    { country: 'UK', ville: 'Londres — Richmond',     parent: 'Londres', dept: 'LDN', deptName: 'Greater London', region: 'England', type: 'quartier' },
    { country: 'UK', ville: 'Londres — Hackney',      parent: 'Londres', dept: 'LDN', deptName: 'Greater London', region: 'England', type: 'quartier' },
    { country: 'UK', ville: 'Manchester — Didsbury',  parent: 'Manchester', dept: 'GM', deptName: 'Greater Manchester', region: 'England', type: 'quartier' },

    // ==== BELGIQUE ====
    { country: 'BE', ville: 'Bruxelles', dept: 'BRU', deptName: 'Bruxelles-Capitale', region: 'Bruxelles' },
    { country: 'BE', ville: 'Anvers',    dept: 'VAN', deptName: 'Antwerpen',          region: 'Flandre' },
    { country: 'BE', ville: 'Gand',      dept: 'VOV', deptName: 'Oost-Vlaanderen',    region: 'Flandre' },
    { country: 'BE', ville: 'Charleroi', dept: 'WHT', deptName: 'Hainaut',            region: 'Wallonie' },
    { country: 'BE', ville: 'Liège',     dept: 'WLG', deptName: 'Liège',              region: 'Wallonie' },
    { country: 'BE', ville: 'Bruges',    dept: 'VWV', deptName: 'West-Vlaanderen',    region: 'Flandre' },
    { country: 'BE', ville: 'Namur',     dept: 'WNA', deptName: 'Namur',              region: 'Wallonie' },
    { country: 'BE', ville: 'Louvain',   dept: 'VBR', deptName: 'Vlaams-Brabant',     region: 'Flandre' },
    { country: 'BE', ville: 'Bruxelles — Ixelles',     parent: 'Bruxelles', dept: 'BRU', deptName: 'Bruxelles-Capitale', region: 'Bruxelles', type: 'quartier' },
    { country: 'BE', ville: 'Bruxelles — Uccle',       parent: 'Bruxelles', dept: 'BRU', deptName: 'Bruxelles-Capitale', region: 'Bruxelles', type: 'quartier' },
    { country: 'BE', ville: 'Bruxelles — Woluwe-Saint-Pierre', parent: 'Bruxelles', dept: 'BRU', deptName: 'Bruxelles-Capitale', region: 'Bruxelles', type: 'quartier' },

    // ==== PAYS-BAS ====
    { country: 'NL', ville: 'Amsterdam',  dept: 'NH', deptName: 'Noord-Holland',     region: 'Pays-Bas' },
    { country: 'NL', ville: 'Rotterdam',  dept: 'ZH', deptName: 'Zuid-Holland',      region: 'Pays-Bas' },
    { country: 'NL', ville: 'La Haye',    dept: 'ZH', deptName: 'Zuid-Holland',      region: 'Pays-Bas' },
    { country: 'NL', ville: 'Utrecht',    dept: 'UT', deptName: 'Utrecht',           region: 'Pays-Bas' },
    { country: 'NL', ville: 'Eindhoven',  dept: 'NB', deptName: 'Noord-Brabant',     region: 'Pays-Bas' },
    { country: 'NL', ville: 'Groningue',  dept: 'GR', deptName: 'Groningen',         region: 'Pays-Bas' },
    { country: 'NL', ville: 'Amsterdam — Zuid',    parent: 'Amsterdam', dept: 'NH', deptName: 'Noord-Holland', region: 'Pays-Bas', type: 'quartier' },
    { country: 'NL', ville: 'Amsterdam — Centrum', parent: 'Amsterdam', dept: 'NH', deptName: 'Noord-Holland', region: 'Pays-Bas', type: 'quartier' },

    // ==== PORTUGAL ====
    { country: 'PT', ville: 'Lisbonne', dept: 'LX',  deptName: 'Lisboa',  region: 'Lisbonne' },
    { country: 'PT', ville: 'Porto',    dept: 'PRT', deptName: 'Porto',   region: 'Norte' },
    { country: 'PT', ville: 'Braga',    dept: 'BRG', deptName: 'Braga',   region: 'Norte' },
    { country: 'PT', ville: 'Coimbra',  dept: 'CB',  deptName: 'Coimbra', region: 'Centro' },
    { country: 'PT', ville: 'Faro',     dept: 'FAR', deptName: 'Faro',    region: 'Algarve' },
    { country: 'PT', ville: 'Funchal',  dept: 'MAD', deptName: 'Madeira', region: 'Madeira' },
    { country: 'PT', ville: 'Lisbonne — Avenidas Novas', parent: 'Lisbonne', dept: 'LX', deptName: 'Lisboa', region: 'Lisbonne', type: 'quartier' },
    { country: 'PT', ville: 'Lisbonne — Estrela',        parent: 'Lisbonne', dept: 'LX', deptName: 'Lisboa', region: 'Lisbonne', type: 'quartier' },
    { country: 'PT', ville: 'Porto — Foz do Douro',      parent: 'Porto',    dept: 'PRT', deptName: 'Porto', region: 'Norte', type: 'quartier' },

    // ==== SUISSE ====
    { country: 'CH', ville: 'Zurich',  dept: 'ZH', deptName: 'Zürich',  region: 'Suisse alémanique' },
    { country: 'CH', ville: 'Genève',  dept: 'GE', deptName: 'Genève',  region: 'Suisse romande' },
    { country: 'CH', ville: 'Bâle',    dept: 'BS', deptName: 'Basel',   region: 'Suisse alémanique' },
    { country: 'CH', ville: 'Berne',   dept: 'BE', deptName: 'Bern',    region: 'Suisse alémanique' },
    { country: 'CH', ville: 'Lausanne',dept: 'VD', deptName: 'Vaud',    region: 'Suisse romande' },
    { country: 'CH', ville: 'Lugano',  dept: 'TI', deptName: 'Ticino',  region: 'Suisse italienne' },

    // ==== AUTRICHE ====
    { country: 'AT', ville: 'Vienne',     dept: 'W', deptName: 'Wien',     region: 'Autriche' },
    { country: 'AT', ville: 'Graz',       dept: '6', deptName: 'Steiermark', region: 'Autriche' },
    { country: 'AT', ville: 'Linz',       dept: '4', deptName: 'Oberösterreich', region: 'Autriche' },
    { country: 'AT', ville: 'Salzbourg',  dept: '5', deptName: 'Salzburg', region: 'Autriche' },

    // ==== IRLANDE ====
    { country: 'IE', ville: 'Dublin',  dept: 'D', deptName: 'Dublin', region: 'Leinster' },
    { country: 'IE', ville: 'Cork',    dept: 'C', deptName: 'Cork',   region: 'Munster' },
    { country: 'IE', ville: 'Galway',  dept: 'G', deptName: 'Galway', region: 'Connacht' },

    // ==== PAYS NORDIQUES ====
    { country: 'SE', ville: 'Stockholm', dept: 'AB', deptName: 'Stockholm', region: 'Suède' },
    { country: 'SE', ville: 'Göteborg',  dept: 'O',  deptName: 'Västra Götaland', region: 'Suède' },
    { country: 'SE', ville: 'Malmö',     dept: 'M',  deptName: 'Skåne',    region: 'Suède' },
    { country: 'DK', ville: 'Copenhague',dept: '101',deptName: 'København',region: 'Danemark' },
    { country: 'DK', ville: 'Aarhus',    dept: '751',deptName: 'Aarhus',   region: 'Danemark' },
    { country: 'NO', ville: 'Oslo',      dept: '03', deptName: 'Oslo',     region: 'Norvège' },
    { country: 'NO', ville: 'Bergen',    dept: '46', deptName: 'Vestland', region: 'Norvège' },
    { country: 'FI', ville: 'Helsinki',  dept: '01', deptName: 'Uusimaa',  region: 'Finlande' },
    { country: 'FI', ville: 'Tampere',   dept: '06', deptName: 'Pirkanmaa',region: 'Finlande' },

    // ==== POLOGNE / TCHÉQUIE / GRÈCE / LUXEMBOURG ====
    { country: 'PL', ville: 'Varsovie', dept: 'MZ', deptName: 'Mazovie',     region: 'Pologne' },
    { country: 'PL', ville: 'Cracovie', dept: 'MA', deptName: 'Petite-Pologne', region: 'Pologne' },
    { country: 'PL', ville: 'Wrocław',  dept: 'DS', deptName: 'Basse-Silésie', region: 'Pologne' },
    { country: 'PL', ville: 'Gdańsk',   dept: 'PM', deptName: 'Poméranie',    region: 'Pologne' },
    { country: 'CZ', ville: 'Prague',   dept: 'PR', deptName: 'Prague',    region: 'Tchéquie' },
    { country: 'CZ', ville: 'Brno',     dept: 'JM', deptName: 'Moravie-du-Sud', region: 'Tchéquie' },
    { country: 'GR', ville: 'Athènes',  dept: 'A1', deptName: 'Attique',   region: 'Grèce' },
    { country: 'GR', ville: 'Thessalonique', dept: 'B', deptName: 'Macédoine-Centrale', region: 'Grèce' },
    { country: 'LU', ville: 'Luxembourg-Ville', dept: 'LU', deptName: 'Luxembourg', region: 'Luxembourg' },

    // ==== ÉTATS-UNIS ====
    { country: 'US', ville: 'New York',     dept: 'NY', deptName: 'New York',     region: 'Northeast' },
    { country: 'US', ville: 'Los Angeles',  dept: 'CA', deptName: 'California',   region: 'West' },
    { country: 'US', ville: 'Chicago',      dept: 'IL', deptName: 'Illinois',     region: 'Midwest' },
    { country: 'US', ville: 'Houston',      dept: 'TX', deptName: 'Texas',        region: 'South' },
    { country: 'US', ville: 'Phoenix',      dept: 'AZ', deptName: 'Arizona',      region: 'West' },
    { country: 'US', ville: 'Philadelphia', dept: 'PA', deptName: 'Pennsylvania', region: 'Northeast' },
    { country: 'US', ville: 'San Antonio',  dept: 'TX', deptName: 'Texas',        region: 'South' },
    { country: 'US', ville: 'San Diego',    dept: 'CA', deptName: 'California',   region: 'West' },
    { country: 'US', ville: 'Dallas',       dept: 'TX', deptName: 'Texas',        region: 'South' },
    { country: 'US', ville: 'San Jose',     dept: 'CA', deptName: 'California',   region: 'West' },
    { country: 'US', ville: 'Austin',       dept: 'TX', deptName: 'Texas',        region: 'South' },
    { country: 'US', ville: 'Jacksonville', dept: 'FL', deptName: 'Florida',      region: 'South' },
    { country: 'US', ville: 'San Francisco',dept: 'CA', deptName: 'California',   region: 'West' },
    { country: 'US', ville: 'Columbus',     dept: 'OH', deptName: 'Ohio',         region: 'Midwest' },
    { country: 'US', ville: 'Seattle',      dept: 'WA', deptName: 'Washington',   region: 'West' },
    { country: 'US', ville: 'Denver',       dept: 'CO', deptName: 'Colorado',     region: 'West' },
    { country: 'US', ville: 'Boston',       dept: 'MA', deptName: 'Massachusetts',region: 'Northeast' },
    { country: 'US', ville: 'Washington DC',dept: 'DC', deptName: 'District of Columbia', region: 'Northeast' },
    { country: 'US', ville: 'Miami',        dept: 'FL', deptName: 'Florida',      region: 'South' },
    { country: 'US', ville: 'Atlanta',      dept: 'GA', deptName: 'Georgia',      region: 'South' },
    // US — neighborhoods
    { country: 'US', ville: 'New York — Manhattan',     parent: 'New York', dept: 'NY', deptName: 'New York', region: 'Northeast', type: 'quartier' },
    { country: 'US', ville: 'New York — Brooklyn',      parent: 'New York', dept: 'NY', deptName: 'New York', region: 'Northeast', type: 'quartier' },
    { country: 'US', ville: 'New York — Queens',        parent: 'New York', dept: 'NY', deptName: 'New York', region: 'Northeast', type: 'quartier' },
    { country: 'US', ville: 'New York — Bronx',         parent: 'New York', dept: 'NY', deptName: 'New York', region: 'Northeast', type: 'quartier' },
    { country: 'US', ville: 'New York — Upper East Side', parent: 'New York', dept: 'NY', deptName: 'New York', region: 'Northeast', type: 'quartier' },
    { country: 'US', ville: 'Los Angeles — Beverly Hills', parent: 'Los Angeles', dept: 'CA', deptName: 'California', region: 'West', type: 'quartier' },
    { country: 'US', ville: 'Los Angeles — Santa Monica',  parent: 'Los Angeles', dept: 'CA', deptName: 'California', region: 'West', type: 'quartier' },
    { country: 'US', ville: 'Los Angeles — Pasadena',      parent: 'Los Angeles', dept: 'CA', deptName: 'California', region: 'West', type: 'quartier' },
    { country: 'US', ville: 'San Francisco — Pacific Heights', parent: 'San Francisco', dept: 'CA', deptName: 'California', region: 'West', type: 'quartier' },
    { country: 'US', ville: 'Chicago — Lincoln Park',   parent: 'Chicago',  dept: 'IL', deptName: 'Illinois', region: 'Midwest', type: 'quartier' },
    { country: 'US', ville: 'Miami — Coral Gables',     parent: 'Miami',    dept: 'FL', deptName: 'Florida',  region: 'South', type: 'quartier' },

    // ==== CANADA ====
    { country: 'CA', ville: 'Toronto',   dept: 'ON', deptName: 'Ontario',          region: 'Canada' },
    { country: 'CA', ville: 'Montréal',  dept: 'QC', deptName: 'Québec',           region: 'Canada' },
    { country: 'CA', ville: 'Vancouver', dept: 'BC', deptName: 'Colombie-Britannique', region: 'Canada' },
    { country: 'CA', ville: 'Calgary',   dept: 'AB', deptName: 'Alberta',          region: 'Canada' },
    { country: 'CA', ville: 'Edmonton',  dept: 'AB', deptName: 'Alberta',          region: 'Canada' },
    { country: 'CA', ville: 'Ottawa',    dept: 'ON', deptName: 'Ontario',          region: 'Canada' },
    { country: 'CA', ville: 'Québec',    dept: 'QC', deptName: 'Québec',           region: 'Canada' },
    { country: 'CA', ville: 'Winnipeg',  dept: 'MB', deptName: 'Manitoba',         region: 'Canada' },
    { country: 'CA', ville: 'Halifax',   dept: 'NS', deptName: 'Nouvelle-Écosse',  region: 'Canada' },
    { country: 'CA', ville: 'Montréal — Plateau-Mont-Royal', parent: 'Montréal', dept: 'QC', deptName: 'Québec', region: 'Canada', type: 'quartier' },
    { country: 'CA', ville: 'Montréal — Outremont',          parent: 'Montréal', dept: 'QC', deptName: 'Québec', region: 'Canada', type: 'quartier' },
    { country: 'CA', ville: 'Montréal — Westmount',          parent: 'Montréal', dept: 'QC', deptName: 'Québec', region: 'Canada', type: 'quartier' },
    { country: 'CA', ville: 'Toronto — Yorkville',           parent: 'Toronto',  dept: 'ON', deptName: 'Ontario',region: 'Canada', type: 'quartier' },
    { country: 'CA', ville: 'Toronto — The Annex',           parent: 'Toronto',  dept: 'ON', deptName: 'Ontario',region: 'Canada', type: 'quartier' },
    { country: 'CA', ville: 'Vancouver — Kitsilano',         parent: 'Vancouver',dept: 'BC', deptName: 'Colombie-Britannique', region: 'Canada', type: 'quartier' },

    // ==== MEXIQUE ====
    { country: 'MX', ville: 'Mexico',       dept: 'CMX', deptName: 'Ciudad de México', region: 'Mexique' },
    { country: 'MX', ville: 'Guadalajara',  dept: 'JAL', deptName: 'Jalisco',          region: 'Mexique' },
    { country: 'MX', ville: 'Monterrey',    dept: 'NLE', deptName: 'Nuevo León',       region: 'Mexique' },
    { country: 'MX', ville: 'Puebla',       dept: 'PUE', deptName: 'Puebla',           region: 'Mexique' },
    { country: 'MX', ville: 'Tijuana',      dept: 'BCN', deptName: 'Baja California',  region: 'Mexique' },
    { country: 'MX', ville: 'Mexico — Polanco', parent: 'Mexico', dept: 'CMX', deptName: 'Ciudad de México', region: 'Mexique', type: 'quartier' },
    { country: 'MX', ville: 'Mexico — Condesa', parent: 'Mexico', dept: 'CMX', deptName: 'Ciudad de México', region: 'Mexique', type: 'quartier' },

    // ==== AMÉRIQUE DU SUD ====
    { country: 'BR', ville: 'São Paulo',       dept: 'SP', deptName: 'São Paulo',      region: 'Brésil' },
    { country: 'BR', ville: 'Rio de Janeiro',  dept: 'RJ', deptName: 'Rio de Janeiro', region: 'Brésil' },
    { country: 'BR', ville: 'Brasília',        dept: 'DF', deptName: 'Distrito Federal', region: 'Brésil' },
    { country: 'BR', ville: 'Salvador',        dept: 'BA', deptName: 'Bahia',          region: 'Brésil' },
    { country: 'BR', ville: 'Belo Horizonte',  dept: 'MG', deptName: 'Minas Gerais',   region: 'Brésil' },
    { country: 'BR', ville: 'Curitiba',        dept: 'PR', deptName: 'Paraná',         region: 'Brésil' },
    { country: 'BR', ville: 'Porto Alegre',    dept: 'RS', deptName: 'Rio Grande do Sul', region: 'Brésil' },
    { country: 'BR', ville: 'São Paulo — Jardins', parent: 'São Paulo', dept: 'SP', deptName: 'São Paulo', region: 'Brésil', type: 'quartier' },
    { country: 'BR', ville: 'Rio — Ipanema',        parent: 'Rio de Janeiro', dept: 'RJ', deptName: 'Rio de Janeiro', region: 'Brésil', type: 'quartier' },
    { country: 'BR', ville: 'Rio — Leblon',         parent: 'Rio de Janeiro', dept: 'RJ', deptName: 'Rio de Janeiro', region: 'Brésil', type: 'quartier' },
    { country: 'AR', ville: 'Buenos Aires', dept: 'BA', deptName: 'CABA',     region: 'Argentine' },
    { country: 'AR', ville: 'Córdoba',      dept: 'CB', deptName: 'Córdoba',  region: 'Argentine' },
    { country: 'AR', ville: 'Rosario',      dept: 'SF', deptName: 'Santa Fe', region: 'Argentine' },
    { country: 'AR', ville: 'Buenos Aires — Palermo', parent: 'Buenos Aires', dept: 'BA', deptName: 'CABA', region: 'Argentine', type: 'quartier' },
    { country: 'AR', ville: 'Buenos Aires — Recoleta', parent: 'Buenos Aires', dept: 'BA', deptName: 'CABA', region: 'Argentine', type: 'quartier' },
    { country: 'CL', ville: 'Santiago',     dept: 'RM', deptName: 'Región Metropolitana', region: 'Chili' },
    { country: 'CL', ville: 'Valparaíso',   dept: 'V',  deptName: 'Valparaíso',          region: 'Chili' },
    { country: 'CO', ville: 'Bogotá',       dept: 'BOG', deptName: 'Bogotá D.C.',        region: 'Colombie' },
    { country: 'CO', ville: 'Medellín',     dept: 'ANT', deptName: 'Antioquia',          region: 'Colombie' },
    { country: 'CO', ville: 'Cali',         dept: 'VAC', deptName: 'Valle del Cauca',    region: 'Colombie' },

    // ==== AFRIQUE ====
    { country: 'MA', ville: 'Casablanca', dept: 'CAS', deptName: 'Casablanca-Settat', region: 'Maroc' },
    { country: 'MA', ville: 'Rabat',      dept: 'RAB', deptName: 'Rabat-Salé-Kénitra', region: 'Maroc' },
    { country: 'MA', ville: 'Marrakech',  dept: 'MAR', deptName: 'Marrakech-Safi',    region: 'Maroc' },
    { country: 'MA', ville: 'Tanger',     dept: 'TAN', deptName: 'Tanger-Tétouan-Al Hoceïma', region: 'Maroc' },
    { country: 'MA', ville: 'Fès',        dept: 'FES', deptName: 'Fès-Meknès',        region: 'Maroc' },
    { country: 'TN', ville: 'Tunis',      dept: 'TN',  deptName: 'Tunis',              region: 'Tunisie' },
    { country: 'TN', ville: 'Sfax',       dept: 'SF',  deptName: 'Sfax',               region: 'Tunisie' },
    { country: 'DZ', ville: 'Alger',      dept: 'DZ',  deptName: 'Alger',              region: 'Algérie' },
    { country: 'DZ', ville: 'Oran',       dept: 'OR',  deptName: 'Oran',               region: 'Algérie' },
    { country: 'ZA', ville: 'Le Cap',        dept: 'WC', deptName: 'Western Cape',  region: 'Afrique du Sud' },
    { country: 'ZA', ville: 'Johannesburg',  dept: 'GP', deptName: 'Gauteng',       region: 'Afrique du Sud' },
    { country: 'ZA', ville: 'Durban',        dept: 'KZN',deptName: 'KwaZulu-Natal', region: 'Afrique du Sud' },

    // ==== ASIE ====
    { country: 'JP', ville: 'Tokyo',     dept: 'TYO', deptName: 'Tokyo',     region: 'Japon' },
    { country: 'JP', ville: 'Osaka',     dept: 'OSA', deptName: 'Osaka',     region: 'Japon' },
    { country: 'JP', ville: 'Yokohama',  dept: 'KAN', deptName: 'Kanagawa',  region: 'Japon' },
    { country: 'JP', ville: 'Kyoto',     dept: 'KYO', deptName: 'Kyoto',     region: 'Japon' },
    { country: 'JP', ville: 'Tokyo — Minato',    parent: 'Tokyo', dept: 'TYO', deptName: 'Tokyo', region: 'Japon', type: 'quartier' },
    { country: 'JP', ville: 'Tokyo — Setagaya',  parent: 'Tokyo', dept: 'TYO', deptName: 'Tokyo', region: 'Japon', type: 'quartier' },
    { country: 'KR', ville: 'Séoul',     dept: 'SEL', deptName: 'Seoul',     region: 'Corée du Sud' },
    { country: 'KR', ville: 'Busan',     dept: 'BSN', deptName: 'Busan',     region: 'Corée du Sud' },
    { country: 'SG', ville: 'Singapour', dept: 'SG',  deptName: 'Singapore', region: 'Singapour' },

    // ==== OCÉANIE ====
    { country: 'AU', ville: 'Sydney',    dept: 'NSW', deptName: 'New South Wales', region: 'Australie' },
    { country: 'AU', ville: 'Melbourne', dept: 'VIC', deptName: 'Victoria',        region: 'Australie' },
    { country: 'AU', ville: 'Brisbane',  dept: 'QLD', deptName: 'Queensland',      region: 'Australie' },
    { country: 'AU', ville: 'Perth',     dept: 'WA',  deptName: 'Western Australia', region: 'Australie' },
    { country: 'AU', ville: 'Adelaide',  dept: 'SA',  deptName: 'South Australia', region: 'Australie' },
    { country: 'NZ', ville: 'Auckland',  dept: 'AKL', deptName: 'Auckland',        region: 'Nouvelle-Zélande' },
    { country: 'NZ', ville: 'Wellington',dept: 'WGN', deptName: 'Wellington',      region: 'Nouvelle-Zélande' }
  ],

  // ============================
  // Quartiers / communes périphériques (étape 4)
  // ============================
  quartiersBordeaux: [
    'Caudéran', 'Chartrons', 'Bastide', 'Saint-Pierre', 'Pessac', 'Talence',
    'Le Bouscat', 'Bègles', 'Villenave-d\'Ornon', 'Mérignac'
  ],

  // Quartiers par ville (étape 4 — fallback quand la ville n'a pas d'entrées dans `villes`)
  quartiersByCity: {
    'Bordeaux':  ['Caudéran', 'Chartrons', 'Bastide', 'Saint-Pierre', 'Pessac', 'Talence', 'Le Bouscat', 'Bègles', "Villenave-d'Ornon", 'Mérignac'],
    'Paris':     ['1er — Louvre', '4e — Marais', '6e — Saint-Germain', '7e — Invalides', '8e — Champs-Élysées', '16e — Passy', '17e — Batignolles', 'Neuilly-sur-Seine'],
    'Lyon':      ['1er — Croix-Rousse', '2e — Confluence', '3e — Part-Dieu', '6e — Brotteaux', '7e — Guillotière', 'Villeurbanne', 'Caluire-et-Cuire'],
    'Marseille': ['1er — Belsunce', '6e — Castellane', '7e — Endoume', '8e — Prado', '9e — Mazargues', '12e — Saint-Barnabé'],
    'Toulouse':  ['Capitole', 'Saint-Cyprien', 'Carmes', 'Compans-Caffarelli', 'Côte Pavée', 'Lardenne'],
    'Nice':      ['Cimiez', "Carré d'Or", 'Mont-Boron', 'Libération', 'Saint-Roch'],
    'Madrid':    ['Salamanca', 'Chamberí', 'Chamartín', 'Retiro', 'Centro', 'Moncloa-Aravaca', 'Tetuán', 'Arganzuela'],
    'Barcelone': ['Eixample', 'Gràcia', 'Sarrià-Sant Gervasi', 'Les Corts', 'Ciutat Vella', 'Sant Martí', 'Horta-Guinardó'],
    'Valence':   ['Ruzafa', 'El Carmen', 'Eixample', 'Benimaclet', 'Cabanyal'],
    'Séville':   ['Triana', 'Nervión', 'Los Remedios', 'Macarena', 'Casco Antiguo'],
    'Rome':      ['Parioli', 'Prati', 'Trastevere', 'EUR', 'Monti', 'Testaccio', 'Aventino'],
    'Milan':     ['Brera', 'Navigli', 'Porta Nuova', 'Isola', 'Citta Studi', 'Porta Romana', 'CityLife'],
    'Naples':    ['Chiaia', 'Vomero', 'Posillipo', 'Centro Storico', 'Mergellina'],
    'Turin':     ['Crocetta', 'Centro', 'San Salvario', 'Vanchiglia', 'Borgo Po'],
    'Berlin':    ['Charlottenburg-Wilmersdorf', 'Mitte', 'Prenzlauer Berg', 'Kreuzberg', 'Steglitz-Zehlendorf', 'Pankow', 'Friedrichshain'],
    'Munich':    ['Schwabing', 'Bogenhausen', 'Maxvorstadt', 'Haidhausen', 'Lehel', 'Sendling'],
    'Hambourg':  ['Eppendorf', 'Altona', 'Eimsbüttel', 'Winterhude', 'HafenCity', 'Blankenese'],
    'Francfort': ['Westend', 'Sachsenhausen', 'Nordend', 'Bornheim', 'Bockenheim'],
    'Londres':   ['Westminster', 'Kensington & Chelsea', 'Camden', 'Islington', 'Richmond', 'Hackney', 'Hammersmith & Fulham', 'Wandsworth'],
    'Manchester':['Didsbury', 'Chorlton', 'Northern Quarter', 'Castlefield', 'Salford'],
    'Bruxelles': ['Ixelles', 'Uccle', 'Woluwe-Saint-Pierre', 'Saint-Gilles', 'Etterbeek', 'Schaerbeek'],
    'Amsterdam': ['Zuid', 'Centrum', 'Oost', 'West', 'Noord', 'Jordaan'],
    'Lisbonne':  ['Avenidas Novas', 'Estrela', 'Príncipe Real', 'Alfama', 'Belém', 'Parque das Nações'],
    'Porto':     ['Foz do Douro', 'Boavista', 'Cedofeita', 'Ribeira', 'Bonfim'],
    'Zurich':    ['Enge', 'Seefeld', 'Wiedikon', 'Altstadt', 'Hottingen'],
    'Genève':    ['Champel', 'Eaux-Vives', 'Cologny', 'Plainpalais', 'Pâquis'],
    'Vienne':    ['Innere Stadt', 'Wieden', 'Mariahilf', 'Neubau', 'Döbling'],
    'Dublin':    ['Ranelagh', 'Donnybrook', 'Ballsbridge', 'Rathmines', 'Sandymount'],
    'Stockholm': ['Östermalm', 'Södermalm', 'Vasastan', 'Kungsholmen', 'Norrmalm'],
    'Copenhague':['Indre By', 'Frederiksberg', 'Østerbro', 'Nørrebro', 'Vesterbro'],
    'New York':  ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Upper East Side', 'Upper West Side', 'Chelsea', 'Greenwich Village', 'Williamsburg'],
    'Los Angeles': ['Beverly Hills', 'Santa Monica', 'Pasadena', 'Brentwood', 'Westwood', 'Silver Lake', 'Hollywood'],
    'San Francisco': ['Pacific Heights', 'Marina', 'Nob Hill', 'SoMa', 'Mission', 'Castro'],
    'Chicago':   ['Lincoln Park', 'Gold Coast', 'Loop', 'River North', 'Lakeview', 'Hyde Park'],
    'Miami':     ['Coral Gables', 'Brickell', 'South Beach', 'Coconut Grove', 'Wynwood'],
    'Boston':    ['Back Bay', 'Beacon Hill', 'South End', 'Cambridge', 'Brookline'],
    'Toronto':   ['Yorkville', 'The Annex', 'Rosedale', 'Forest Hill', 'Liberty Village', 'Distillery District'],
    'Montréal':  ['Plateau-Mont-Royal', 'Outremont', 'Westmount', 'Mile End', 'Vieux-Montréal', 'NDG'],
    'Vancouver': ['Kitsilano', 'West End', 'Yaletown', 'Gastown', 'Point Grey'],
    'Mexico':    ['Polanco', 'Condesa', 'Roma Norte', 'San Ángel', 'Coyoacán', 'Lomas de Chapultepec'],
    'São Paulo': ['Jardins', 'Vila Madalena', 'Pinheiros', 'Itaim Bibi', 'Higienópolis', 'Moema'],
    'Rio de Janeiro': ['Ipanema', 'Leblon', 'Copacabana', 'Botafogo', 'Barra da Tijuca', 'Jardim Botânico'],
    'Buenos Aires': ['Palermo', 'Recoleta', 'Belgrano', 'Puerto Madero', 'San Telmo', 'Núñez'],
    'Tokyo':     ['Minato', 'Setagaya', 'Shibuya', 'Shinjuku', 'Meguro', 'Bunkyo'],
    'Casablanca':['Maârif', 'Anfa', 'Bourgogne', 'Gauthier', 'Racine', 'Californie'],
    'Sydney':    ['Bondi', 'Mosman', 'Manly', 'Surry Hills', 'Paddington', 'North Sydney']
  },

  // ============================
  // Types de zone (étape 4 — multi-select)
  // ============================
  zoneTypes: [
    { key: 'ville',            label: 'Ville',                 desc: 'Commune entière — couverture complète',              icon: '🏙️' },
    { key: 'arrondissement',   label: 'Arrondissement',        desc: 'Découpage urbain officiel (Paris, Lyon, Madrid…)',   icon: '🏛️' },
    { key: 'quartiers',        label: 'Quartiers',             desc: 'Un ou plusieurs quartiers spécifiques',              icon: '🏘️' },
    { key: 'commune_periph',   label: 'Communes périphériques',desc: 'Couronne ~20 km autour du centre',                   icon: '🌳' },
    { key: 'intercommunal',    label: 'Intercommunalité',      desc: 'Métropole, agglomération, comarca…',                 icon: '🌐' },
    { key: 'axes_routiers',    label: 'Le long d\'axes routiers', desc: 'Zone définie par autoroutes / nationales / transit', icon: '🛣️' },
    { key: 'zone_rurale',      label: 'Zone rurale',           desc: 'Communes < 5 000 hab · isolement potentiel',         icon: '🌾' }
  ],

  // ============================
  // Types de communes (étape 4 — caractérisation)
  // ============================
  communeTypes: [
    { key: 'urbaine_dense',   label: 'Urbaine dense',     desc: '> 50 000 hab' },
    { key: 'urbaine',         label: 'Urbaine',           desc: '10 000 – 50 000 hab' },
    { key: 'periurbaine',     label: 'Périurbaine',       desc: '3 000 – 10 000 hab' },
    { key: 'rurale',          label: 'Rurale',            desc: '< 3 000 hab' },
    { key: 'littorale',       label: 'Littorale',         desc: 'Côte · saisonnalité' },
    { key: 'montagne',        label: 'Montagne',          desc: 'Massif · accès difficile' },
    { key: 'touristique',     label: 'Touristique',       desc: 'Pop. flottante forte' },
    { key: 'residentielle',   label: 'Résidentielle aisée', desc: 'CSP+ · faible activité éco' }
  ],

  // ============================
  // Axes routiers majeurs (étape 4 — accessibilité)
  // ============================
  axesRoutiers: [
    { key: 'a10', label: 'A10 — L\'Aquitaine',   type: 'autoroute' },
    { key: 'a63', label: 'A63 — Bordeaux-Bayonne', type: 'autoroute' },
    { key: 'a89', label: 'A89 — Bordeaux-Lyon', type: 'autoroute' },
    { key: 'a62', label: 'A62 — Bordeaux-Toulouse', type: 'autoroute' },
    { key: 'rocade', label: 'Rocade de Bordeaux (A630)', type: 'rocade' },
    { key: 'n10', label: 'N10', type: 'nationale' },
    { key: 'n89', label: 'N89', type: 'nationale' },
    { key: 'd1010', label: 'D1010', type: 'departementale' },
    { key: 'tram_a', label: 'Tram A — Bordeaux', type: 'transport' },
    { key: 'tram_b', label: 'Tram B — Bordeaux', type: 'transport' },
    { key: 'tram_c', label: 'Tram C — Bordeaux', type: 'transport' },
    { key: 'tram_d', label: 'Tram D — Bordeaux', type: 'transport' }
  ],

  // ============================
  // Sous-secteurs SAP (étape 3)
  // ============================
  sousSecteurs: [
    // Coeur d'offre généraliste multi-services
    { key: 'menage_entretien', label: 'Ménage / entretien du domicile', desc: 'Ménage régulier · vitres · repassage' },
    { key: 'aide_domicile_pa', label: 'Aide à domicile personnes âgées', desc: 'Courses · repas · accompagnement' },
    { key: 'garde_enfants', label: 'Garde d’enfants à domicile', desc: 'Sortie d’école · périscolaire · -3 ans' },
    { key: 'garde_enfants_bebe', label: '↳ Bébé 0-3 ans', desc: 'Nourrisson · sieste · biberons · éveil' },
    { key: 'garde_enfants_periscolaire', label: '↳ Périscolaire 3-10 ans', desc: 'Sortie d’école · devoirs · activités' },
    { key: 'petit_bricolage', label: 'Petit bricolage', desc: 'Hommes/femmes toutes mains · <2h' },
    { key: 'multi_services', label: 'Multi-services', desc: 'Offre packagée plusieurs prestations' },
    // Secondaires
    { key: 'jardinage', label: 'Jardinage', desc: 'Tonte · taille · petit entretien extérieur' },
    { key: 'preparation_repas', label: 'Préparation de repas', desc: 'Cuisine à domicile' },
    { key: 'courses_livraison', label: 'Courses / livraison', desc: 'Courses faites ou livrées' },
    { key: 'soutien_scolaire', label: 'Soutien scolaire', desc: 'Aide aux devoirs · cours particuliers' },
    { key: 'assistance_admin', label: 'Assistance administrative', desc: 'Démarches · dossiers' },
    { key: 'assistance_info', label: 'Assistance informatique', desc: 'PC · smartphone · box' },
    // Avancées (santé / dépendance — affichées plus bas)
    { key: 'aide_pers', label: 'Aide à la personne', desc: 'Toilette · habillage · mobilité' },
    { key: 'aide_autonomie', label: 'Aide à l’autonomie / dépendance', desc: 'GIR · APA · dépendance' },
    { key: 'accompagnement_handicap', label: 'Accompagnement handicap', desc: 'PCH · adaptation' },
    { key: 'handicap_pch', label: '↳ Accompagnement PCH', desc: 'Plan d’aide PCH · auxiliaire de vie' },
    { key: 'garde_nuit', label: 'Garde de nuit / présence', desc: 'Veille · sécurité nocturne' },
    { key: 'soins_inf', label: 'Soins infirmiers libéraux', desc: 'Soins médicaux à domicile' },
    { key: 'teleassistance', label: 'Téléassistance / visioassistance', desc: 'Bracelet · capteurs' }
  ],

  // ============================
  // Clientèles cibles (étape 3)
  // ============================
  cibles: [
    // Coeur de cible généraliste
    { key: 'familles_actives', label: 'Familles actives', age: '30-50 ans', desc: 'Double actif · gain de temps · ménage + garde' },
    { key: 'senior_autonome', label: 'Sénior autonome', age: '65-79 ans', desc: 'Autonome · confort · décide seul' },
    { key: 'jeunes_parents', label: 'Jeunes parents', age: '25-40 ans', desc: 'Garde enfants · ménage · post-naissance' },
    { key: 'aidants', label: 'Aidants familiaux', age: 'Tous âges', desc: 'Décideurs · prescripteurs' },
    // Secondaires
    { key: 'actifs_urbains', label: 'Actifs urbains CSP+', age: '30-55 ans', desc: 'Sans enfant · ménage · conciergerie' },
    { key: 'expatries', label: 'Familles expatriées', age: 'Tous âges', desc: 'Multilingue · gestion à distance' },
    // Avancées (médical / dépendance)
    { key: 'senior_fragile', label: 'Sénior fragile', age: '75-84 ans', desc: 'Semi-autonome · APA possible' },
    { key: 'grand_age', label: 'Grand âge', age: '85+ ans', desc: 'Dépendant · décision famille' },
    { key: 'pmr', label: 'Personnes en situation de handicap', age: 'Tous âges', desc: 'PCH · accompagnement spécifique' }
  ],

  // ============================
  // Palettes (étape 5)
  // ============================
  palettes: [
    {
      key: 'flexibia',
      name: 'FLEXIBIA',
      desc: 'Rouge gradient',
      primary: '#E63946',
      secondary: '#C1440E',
      tertiary: '#0B0B12',
      hex: '#E63946 → #C1440E'
    },
    {
      key: 'bonadea',
      name: 'Bonadea Care',
      desc: 'Teal premium',
      primary: '#00A99D',
      secondary: '#005A52',
      tertiary: '#F8FAF9',
      hex: '#00A99D · teal'
    },
    {
      key: 'ouicare',
      name: 'OuiCare',
      desc: 'Orange vif',
      primary: '#FF6B35',
      secondary: '#A83C12',
      tertiary: '#FFF8F4',
      hex: '#FF6B35 · orange'
    },
    {
      key: 'interdom',
      name: 'Interdomicilio',
      desc: 'Orange + Blue',
      primary: '#FFA500',
      secondary: '#1E3A8A',
      tertiary: '#FAFAFA',
      hex: 'orange + blue'
    },
    {
      key: 'highkey',
      name: 'HIGH KEY',
      desc: 'Pop pastel',
      primary: '#FF6BD6',
      secondary: '#9D4EDD',
      tertiary: '#00D4FF',
      hex: 'rose · violet · cyan'
    },
    {
      key: 'corporate',
      name: 'Corporate',
      desc: 'Bleu marine',
      primary: '#1E3A8A',
      secondary: '#475569',
      tertiary: '#F8FAFC',
      hex: '#1E3A8A · marine'
    }
  ],

  // ============================
  // KPI (étape 6) — 32 KPI au total
  // ============================
  kpiCategories: [
    // Catégories alignées avec kpi_master.kpi_group (admin)
    { key: 'demographie',   label: 'Démographie',       icon: '📊' },
    { key: 'demande',       label: 'Demande SAP',       icon: '💼' },
    { key: 'rh',            label: 'RH & Recrutement',  icon: '👥' },
    { key: 'mobilite',      label: 'Mobilité',          icon: '🚗' },
    { key: 'economie',      label: 'Économie',          icon: '💰' },
    { key: 'concurrence',   label: 'Concurrence',       icon: '🏢' },
    { key: 'reglementaire', label: 'Réglementaire',     icon: '⚖' },
    { key: 'risques',       label: 'Risques',           icon: '⚠' }
  ],

  // Catalogue KPI — miroir de kpi_master (admin). Codes identiques en DB.
  // À l'exécution, brand-preset.js réécrase ce tableau avec la version live de la DB.
  kpis: [
    // Démographie
    { key: 'pop_senior_65',          cat: 'demographie',   name: 'Population senior 65+',                src: 'INSEE' },
    { key: 'evol_demo_2020_2030',    cat: 'demographie',   name: 'Évolution démographique 2020-2030',    src: 'INSEE proj.' },
    { key: 'densite_gerontologique', cat: 'demographie',   name: 'Densité gérontologique',               src: 'INSEE' },
    { key: 'revenu_median_seniors',  cat: 'demographie',   name: 'Revenu médian foyers seniors',         src: 'FILOSOFI' },
    { key: 'taux_dependance_gir',    cat: 'demographie',   name: 'Taux de dépendance GIR 1-4',           src: 'DREES' },
    // Demande
    { key: 'taux_penetration_sap',   cat: 'demande',       name: 'Taux de pénétration SAP',              src: 'DARES' },
    { key: 'nb_heures_sap_an',       cat: 'demande',       name: 'Nb heures SAP/an commune',             src: 'DARES' },
    { key: 'top_services_demandes',  cat: 'demande',       name: 'Top services demandés',                src: 'interne' },
    { key: 'saisonnalite_demande',   cat: 'demande',       name: 'Saisonnalité de la demande',           src: 'interne' },
    // RH
    { key: 'turnover_secteur',       cat: 'rh',            name: 'Taux de turnover secteur',             src: 'DARES' },
    { key: 'salaire_moyen_brut',     cat: 'rh',            name: 'Salaire moyen brut',                   src: 'INSEE' },
    { key: 'tensions_recrutement',   cat: 'rh',            name: 'Tensions de recrutement',              src: 'Pôle Emploi' },
    // Mobilité
    { key: 'transport_voiture',      cat: 'mobilite',      name: 'Accessibilité voiture · axes routiers & temps de trajet', src: 'OSM + analyse', principal: true },
    { key: 'couverture_transports',  cat: 'mobilite',      name: 'Couverture transports publics',        src: 'OSM + GTFS' },
    { key: 'distance_moyenne_intervention', cat: 'mobilite', name: 'Distance moyenne intervention',      src: 'OSM' },
    // Économie
    { key: 'volume_marche_local',    cat: 'economie',      name: 'Volume marché local (€)',              src: 'estimation' },
    { key: 'taux_croissance_annuel', cat: 'economie',      name: 'Taux de croissance annuel',            src: 'INSEE' },
    { key: 'panier_moyen_mensuel',   cat: 'economie',      name: 'Panier moyen mensuel',                 src: 'interne' },
    // Concurrence
    { key: 'nb_acteurs_sap',         cat: 'concurrence',   name: 'Nb acteurs SAP locaux',                src: 'SIRENE + Apollo' },
    { key: 'top5_parts_marche',      cat: 'concurrence',   name: 'Top 5 acteurs · parts de marché',      src: 'Apollo' },
    { key: 'maillage_geographique',  cat: 'concurrence',   name: 'Maillage géographique',                src: 'OSM' },
    { key: 'satisfaction_client',    cat: 'concurrence',   name: 'Indice satisfaction client',           src: 'Google Reviews' },
    // Réglementaire
    { key: 'procedure_agrement_saad',cat: 'reglementaire', name: 'Procédure agrément SAAD',              src: 'ARS' },
    { key: 'cadre_fiscal_local',     cat: 'reglementaire', name: 'Cadre fiscal local',                   src: 'Service-Public' },
    { key: 'tva_applicable',         cat: 'reglementaire', name: 'TVA applicable',                       src: 'BOI' },
    // Risques
    { key: 'risques_demographiques', cat: 'risques',       name: 'Risques démographiques',               src: 'analyse' },
    { key: 'risques_concurrentiels', cat: 'risques',       name: 'Risques concurrentiels',               src: 'analyse' },
    { key: 'risques_reglementaires', cat: 'risques',       name: 'Risques réglementaires',               src: 'analyse' },
    { key: 'risques_rh',             cat: 'risques',       name: 'Risques RH',                           src: 'analyse' }
  ],

  // ============================
  // Slides générées (mock pour preview résultat)
  // ============================
  slides: [
    { n: 1, type: 'cover', title: 'Bordeaux Bonadea Care', subtitle: 'Étude marché SAP 2026' },
    { n: 2, type: 'synthese', title: 'Synthèse exécutive', subtitle: '4 takeaways · verdict' },
    { n: 3, type: 'demo', title: 'Démographie senior', subtitle: 'Bordeaux 2024-2030' },
    { n: 4, type: 'demande', title: 'Demande SAP locale', subtitle: 'Pénétration · heures · top services' },
    { n: 5, type: 'persona', title: 'Personas cibles', subtitle: 'Marie 78 · Paul 71' },
    { n: 6, type: 'conc', title: 'Paysage concurrentiel', subtitle: 'Top 5 acteurs + maillage' },
    { n: 7, type: 'swot', title: 'SWOT du marché', subtitle: 'Forces · faiblesses · opportunités · menaces' },
    { n: 8, type: 'rh', title: 'RH & Recrutement', subtitle: 'Tensions · turnover · salaires' },
    { n: 9, type: 'eco', title: 'Volume marché', subtitle: '€ · croissance · paniers' },
    { n: 10, type: 'regl', title: 'Cadre réglementaire', subtitle: 'Agrément · fiscalité · TVA' },
    { n: 11, type: 'verdict', title: 'Verdict & recommandations', subtitle: 'Go / no-go · priorités' }
  ]
};
