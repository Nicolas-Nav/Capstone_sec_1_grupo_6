import type {
  User,
  Client,
  Process,
  Candidate,
  Publication,
  Hito,
  PsychologicalEvaluation,
  Notification,
  ServiceType,
  ProcessStatus,
  CandidateStatus,
  HitoStatus,
  ConsultantDocument,
} from "./types"

// Mock Users
export const mockUsers: User[] = [
  {
    id: "1",
    name: "Ana García",
    email: "admin@llconsulting.com", // Keeping consistent email domain
    role: "admin",
    status: "habilitado",
    created_at: "2023-01-15T10:00:00Z",
    last_login: "2024-02-07T09:30:00Z",
  },
  {
    id: "2",
    name: "Carlos Rodríguez",
    email: "carlos@llconsulting.com", // Keeping consistent email domain
    role: "consultor",
    status: "habilitado",
    created_at: "2023-02-20T14:30:00Z",
    last_login: "2024-02-06T16:45:00Z",
    documents: [
      {
        id: "doc-1",
        name: "CV_Carlos_Rodriguez_2024.pdf",
        file_path: "/documents/carlos/CV_Carlos_Rodriguez_2024.pdf",
        file_size: 1024000,
        uploaded_at: "2024-01-15T10:00:00Z",
        description: "CV actualizado con experiencia reciente",
      },
      {
        id: "doc-2",
        name: "Certificacion_Coaching_Ejecutivo.pdf",
        file_path: "/documents/carlos/Certificacion_Coaching_Ejecutivo.pdf",
        file_size: 2048000,
        uploaded_at: "2024-01-20T14:30:00Z",
        description: "Certificación en coaching ejecutivo",
      },
      {
        id: "doc-3",
        name: "Portfolio_Casos_Exito.pdf",
        file_path: "/documents/carlos/Portfolio_Casos_Exito.pdf",
        file_size: 5120000,
        uploaded_at: "2024-02-01T09:15:00Z",
        description: "Portfolio con casos de éxito en reclutamiento",
      },
    ],
  },
  {
    id: "3",
    name: "María López",
    email: "maria@llconsulting.com", // Keeping consistent email domain
    role: "consultor",
    status: "habilitado",
    created_at: "2023-03-10T11:15:00Z",
    last_login: "2024-02-05T13:20:00Z",
    documents: [
      {
        id: "doc-4",
        name: "CV_Maria_Lopez_2024.pdf",
        file_path: "/documents/maria/CV_Maria_Lopez_2024.pdf",
        file_size: 896000,
        uploaded_at: "2024-01-10T11:00:00Z",
        description: "CV actualizado",
      },
      {
        id: "doc-5",
        name: "Certificacion_Psicologia_Laboral.pdf",
        file_path: "/documents/maria/Certificacion_Psicologia_Laboral.pdf",
        file_size: 1536000,
        uploaded_at: "2024-01-25T16:45:00Z",
        description: "Certificación en psicología laboral",
      },
    ],
  },
  {
    id: "4",
    name: "Pedro Martínez",
    email: "pedro@llconsulting.com", // Keeping consistent email domain
    role: "consultor",
    status: "inhabilitado",
    created_at: "2023-04-05T16:00:00Z",
    last_login: "2024-01-28T10:15:00Z",
    documents: [
      {
        id: "doc-6",
        name: "CV_Pedro_Martinez.pdf",
        file_path: "/documents/pedro/CV_Pedro_Martinez.pdf",
        file_size: 1200000,
        uploaded_at: "2023-12-15T14:20:00Z",
        description: "CV profesional",
      },
    ],
  },
  {
    id: "5",
    name: "Laura Fernández",
    email: "laura@llconsulting.com", // Keeping consistent email domain
    role: "consultor",
    status: "habilitado",
    created_at: "2023-05-12T09:45:00Z",
    last_login: "2024-02-04T14:30:00Z",
    documents: [
      {
        id: "doc-7",
        name: "CV_Laura_Fernandez_2024.pdf",
        file_path: "/documents/laura/CV_Laura_Fernandez_2024.pdf",
        file_size: 1100000,
        uploaded_at: "2024-01-30T10:30:00Z",
        description: "CV actualizado 2024",
      },
      {
        id: "doc-8",
        name: "Certificacion_Headhunting.pdf",
        file_path: "/documents/laura/Certificacion_Headhunting.pdf",
        file_size: 1800000,
        uploaded_at: "2024-02-05T12:00:00Z",
        description: "Certificación en técnicas de headhunting",
      },
      {
        id: "doc-9",
        name: "Contrato_Confidencialidad.pdf",
        file_path: "/documents/laura/Contrato_Confidencialidad.pdf",
        file_size: 512000,
        uploaded_at: "2024-02-03T15:45:00Z",
        description: "Contrato de confidencialidad firmado",
      },
    ],
  },
  {
    id: "6",
    name: "Diego Morales",
    email: "diego@llconsulting.com", // Keeping consistent email domain
    role: "consultor",
    status: "inhabilitado",
    created_at: "2023-06-18T12:20:00Z",
    last_login: "2024-01-15T11:00:00Z",
    documents: [
      {
        id: "doc-10",
        name: "CV_Diego_Morales.pdf",
        file_path: "/documents/diego/CV_Diego_Morales.pdf",
        file_size: 950000,
        uploaded_at: "2023-11-20T13:15:00Z",
        description: "CV profesional",
      },
    ],
  },
]

// Mock Clients
export const mockClients: Client[] = [
  {
    id: "1",
    name: "TechCorp S.A.",
    contacts: [
      {
        id: "contact-1-1",
        name: "Juan Pérez",
        email: "juan.perez@techcorp.com",
        phone: "+56 9 1234 5678",
        position: "Gerente de RRHH",
        city: "Santiago",
        is_primary: true,
      },
      {
        id: "contact-1-2",
        name: "María González",
        email: "maria.gonzalez@techcorp.com",
        phone: "+56 9 8765 4321",
        position: "Jefa de Desarrollo",
        city: "Las Condes",
        is_primary: false,
      },
    ],
  },
  {
    id: "2",
    name: "Innovación Digital Ltda.",
    contacts: [
      {
        id: "contact-2-1",
        name: "Carmen Silva",
        email: "carmen.silva@innovacion.cl",
        phone: "+56 9 8765 4321",
        position: "Directora de Operaciones",
        city: "Providencia",
        is_primary: true,
      },
    ],
  },
  {
    id: "3",
    name: "Retail Solutions",
    contacts: [
      {
        id: "contact-3-1",
        name: "Roberto González",
        email: "roberto@retailsolutions.cl",
        phone: "+56 9 5555 1234",
        position: "Gerente General",
        city: "Viña del Mar",
        is_primary: true,
      },
      {
        id: "contact-3-2",
        name: "Ana Torres",
        email: "ana.torres@retailsolutions.cl",
        phone: "+56 9 4444 5555",
        position: "Gerente de Tiendas",
        city: "Valparaíso",
        is_primary: false,
      },
    ],
  },
  {
    id: "4",
    name: "Banco Nacional",
    contacts: [
      {
        id: "contact-4-1",
        name: "Patricia Morales",
        email: "patricia.morales@banconacional.cl",
        phone: "+56 9 9999 8888",
        position: "Gerente de Sucursal",
        city: "Santiago Centro",
        is_primary: true,
      },
    ],
  },
  {
    id: "5",
    name: "Constructora del Sur",
    contacts: [
      {
        id: "contact-5-1",
        name: "Miguel Torres",
        email: "miguel.torres@constructora.cl",
        phone: "+56 9 7777 6666",
        position: "Jefe de Proyectos",
        city: "Temuco",
        is_primary: true,
      },
      {
        id: "contact-5-2",
        name: "Claudia Ramírez",
        email: "claudia.ramirez@constructora.cl",
        phone: "+56 9 6666 7777",
        position: "Gerente de RRHH",
        city: "Concepción",
        is_primary: false,
      },
    ],
  },
]

// Mock Processes
export const mockProcesses: Process[] = [
  {
    id: "1",
    client_id: "1",
    client: mockClients[0],
    contact_id: "contact-1-1", // Juan Pérez
    service_type: "proceso_completo",
    position_title: "Desarrollador Full Stack Senior",
    description:
      "Buscamos un desarrollador con experiencia en React y Node.js para liderar proyectos de desarrollo web.",
    requirements: "5+ años de experiencia, React, Node.js, TypeScript, bases de datos SQL",
    vacancies: 1,
    consultant_id: "2",
    consultant: mockUsers[1],
    status: "en_progreso",
    created_at: "2024-01-15T10:00:00Z",
    started_at: "2024-01-16T09:00:00Z",
  },
  {
    id: "2",
    client_id: "2",
    client: mockClients[1],
    contact_id: "contact-2-1", // Carmen Silva
    service_type: "long_list",
    position_title: "Diseñador UX/UI",
    description: "Diseñador creativo para mejorar la experiencia de usuario en aplicaciones móviles.",
    requirements: "3+ años de experiencia, Figma, Adobe Creative Suite, portfolio sólido",
    vacancies: 2,
    consultant_id: "3",
    consultant: mockUsers[2],
    status: "iniciado",
    created_at: "2024-01-20T14:30:00Z",
    started_at: "2024-01-22T08:00:00Z",
  },
  {
    id: "3",
    client_id: "3",
    client: mockClients[2],
    contact_id: "contact-3-1", // Roberto González
    service_type: "evaluacion_psicolaboral",
    position_title: "Gerente de Ventas",
    description: "Evaluación psicológica para candidato preseleccionado para gerencia de ventas.",
    requirements: "Liderazgo, orientación a resultados, experiencia en retail",
    vacancies: 1,
    consultant_id: "2",
    consultant: mockUsers[1],
    status: "en_progreso",
    created_at: "2024-01-25T11:15:00Z",
    started_at: "2024-01-26T10:00:00Z",
  },
  {
    id: "4",
    client_id: "4",
    client: mockClients[3],
    contact_id: "contact-4-1", // Patricia Morales
    service_type: "test_psicolaboral",
    position_title: "Analista de Riesgos",
    description: "Test psicológico para evaluar capacidades analíticas y toma de decisiones.",
    requirements: "Análisis cuantitativo, gestión de riesgos, atención al detalle",
    vacancies: 1,
    consultant_id: "3",
    consultant: mockUsers[2],
    status: "creado",
    created_at: "2024-01-28T16:45:00Z",
  },
  {
    id: "5",
    client_id: "5",
    client: mockClients[4],
    contact_id: "contact-5-1", // Miguel Torres
    service_type: "targeted_recruitment",
    position_title: "Ingeniero Civil",
    description: "Búsqueda dirigida de ingeniero civil con experiencia en construcción.",
    requirements: "Título profesional, 8+ años experiencia, manejo de proyectos",
    vacancies: 1,
    consultant_id: "4",
    consultant: mockUsers[3],
    status: "completado",
    created_at: "2024-01-10T09:20:00Z",
    started_at: "2024-01-11T08:00:00Z",
    completed_at: "2024-01-30T17:00:00Z",
  },
  {
    id: "6",
    client_id: "1",
    client: mockClients[0],
    contact_id: "contact-1-2", // María González
    service_type: "long_list",
    position_title: "Analista de Datos",
    description: "Búsqueda y presentación de lista extendida de candidatos para analista de datos.",
    requirements: "Python, SQL, Power BI, experiencia en análisis estadístico",
    vacancies: 1,
    consultant_id: "2",
    consultant: mockUsers[1],
    status: "iniciado",
    created_at: "2024-02-01T13:00:00Z",
    started_at: "2024-02-02T09:30:00Z",
  },
  {
    id: "7",
    client_id: "2",
    client: mockClients[1],
    contact_id: "contact-2-1", // Carmen Silva
    service_type: "proceso_completo",
    position_title: "Product Manager Senior",
    description:
      "Buscamos un Product Manager con experiencia en productos digitales para liderar el desarrollo de nuevas funcionalidades en nuestra plataforma de e-commerce.",
    requirements:
      "5+ años de experiencia como Product Manager, conocimiento en metodologías ágiles, experiencia en e-commerce, inglés avanzado",
    vacancies: 1,
    consultant_id: "2",
    consultant: mockUsers[1],
    status: "creado",
    created_at: "2024-02-05T10:00:00Z",
  },
  {
    id: "8",
    client_id: "4",
    client: mockClients[3],
    contact_id: "contact-4-1", // Patricia Morales
    service_type: "evaluacion_psicolaboral",
    position_title: "Jefe de Sucursal",
    description:
      "Evaluación psicológica completa para candidato preseleccionado para jefatura de sucursal bancaria. Se requiere evaluar competencias de liderazgo, manejo de equipos y orientación al cliente.",
    requirements: "Experiencia en banca, liderazgo de equipos, orientación al cliente, manejo de metas comerciales",
    vacancies: 1,
    consultant_id: "2",
    consultant: mockUsers[1],
    status: "creado",
    created_at: "2024-02-06T14:30:00Z",
  },
  {
    id: "9",
    client_id: "1",
    client: mockClients[0],
    contact_id: "contact-1-1", // Juan Pérez
    service_type: "proceso_completo",
    position_title: "Desarrolladores Frontend",
    description: "Buscamos 3 desarrolladores frontend con experiencia en React para expandir nuestro equipo de desarrollo.",
    requirements: "3+ años de experiencia, React, JavaScript, CSS, HTML, experiencia con APIs REST",
    vacancies: 3,
    consultant_id: "2",
    consultant: mockUsers[1],
    status: "en_progreso",
    created_at: "2024-02-10T09:00:00Z",
    started_at: "2024-02-12T08:00:00Z",
  },
  {
    id: "10",
    client_id: "2",
    client: mockClients[1],
    contact_id: "contact-2-1", // Carmen Silva
    service_type: "long_list",
    position_title: "Diseñador UX/UI Senior",
    description: "Búsqueda de diseñador senior para liderar el equipo de diseño de productos digitales.",
    requirements: "5+ años de experiencia, Figma, Adobe Creative Suite, liderazgo de equipos, portfolio sólido",
    vacancies: 1,
    consultant_id: "3",
    consultant: mockUsers[2],
    status: "congelado",
    created_at: "2024-02-15T10:00:00Z",
    started_at: "2024-02-16T09:00:00Z",
  },
]

// Mock Candidates
export const mockCandidates: Candidate[] = [
  {
    id: "1",
    process_id: "1",
    name: "Alejandro Ruiz",
    email: "alejandro.ruiz@email.com",
    phone: "+56 9 1111 2222",
    cv_file: "alejandro_ruiz_cv.pdf",
    motivation: "Busco nuevos desafíos en desarrollo full stack",
    salary_expectation: 2500000,
    availability: "Inmediata",
    source_portal: "LinkedIn",
    consultant_rating: 5,
    status: "presentado",
    created_at: "2024-01-17T10:30:00Z",
    presentation_date: "2024-01-20T14:00:00Z",
    client_response: "aprobado",
    client_comments: "Excelente perfil técnico",
    presentation_status: "presentado",
  },
  {
    id: "2",
    process_id: "1",
    name: "Sofía Mendoza",
    email: "sofia.mendoza@email.com",
    phone: "+56 9 3333 4444",
    cv_file: "sofia_mendoza_cv.pdf",
    motivation: "Interesada en proyectos innovadores",
    salary_expectation: 2200000,
    availability: "2 semanas",
    source_portal: "GetOnBoard",
    consultant_rating: 4,
    status: "rechazado", // Changed to rejected status for example
    created_at: "2024-01-18T15:45:00Z",
    presentation_date: "2024-01-21T10:00:00Z",
    client_response: "rechazado",
    client_comments: "Falta experiencia en TypeScript",
    presentation_status: "presentado",
    rejection_reason: "Cliente rechazó por falta de experiencia específica en TypeScript",
  },
  {
    id: "3",
    process_id: "2",
    name: "Diego Vargas",
    email: "diego.vargas@email.com",
    phone: "+56 9 5555 6666",
    cv_file: "diego_vargas_cv.pdf",
    motivation: "Pasión por el diseño centrado en el usuario",
    salary_expectation: 1800000,
    availability: "1 mes",
    source_portal: "Behance",
    consultant_rating: 5,
    status: "presentado",
    created_at: "2024-01-23T09:15:00Z",
    presentation_status: "presentado",
  },
  {
    id: "4",
    process_id: "3",
    name: "Valentina Castro",
    email: "valentina.castro@email.com",
    phone: "+56 9 7777 8888",
    rut: "12.345.678-9",
    cv_file: "valentina_castro_cv.pdf",
    consultant_rating: 4,
    status: "postulado",
    created_at: "2024-01-26T11:30:00Z",
    presentation_status: "no_presentado",
    rejection_reason: "No cumple con requisitos mínimos de experiencia",
  },
  {
    id: "5",
    process_id: "4",
    name: "Rodrigo Sánchez",
    email: "rodrigo.sanchez@email.com",
    phone: "+56 9 9999 0000",
    rut: "98.765.432-1",
    cv_file: "rodrigo_sanchez_cv.pdf",
    consultant_rating: 3,
    status: "postulado",
    created_at: "2024-01-29T14:20:00Z",
    presentation_status: "presentado",
  },
  {
    id: "6",
    process_id: "8",
    name: "Andrea Morales",
    email: "andrea.morales@email.com",
    phone: "+56 9 1122 3344",
    rut: "15.678.432-5",
    cv_file: "andrea_morales_cv.pdf",
    consultant_rating: 5,
    status: "postulado",
    created_at: "2024-02-06T15:00:00Z",
    presentation_status: "presentado",
  },
  {
    id: "7",
    process_id: "1", // Carlos Rodriguez's process
    name: "María Elena Torres",
    email: "maria.torres@email.com",
    phone: "+56 9 8888 7777",
    cv_file: "maria_torres_cv.pdf",
    motivation: "Experiencia sólida en desarrollo full stack con React y Node.js",
    salary_expectation: 2800000,
    availability: "Inmediata",
    source_portal: "LinkedIn",
    consultant_rating: 5,
    status: "presentado", // Changed to filtrado so it appears in Module 3
    created_at: "2024-01-19T11:00:00Z",
    presentation_status: "presentado",
    age: 29,
    comuna: "Las Condes",
    profession: "Ingeniero en Informática",
    consultant_comment: "Candidata muy sólida con experiencia relevante en tecnologías requeridas",
  },
  {
    id: "8",
    process_id: "1", // Carlos Rodriguez's process
    name: "Roberto Silva Martínez",
    email: "roberto.silva@email.com",
    phone: "+56 9 6666 5555",
    cv_file: "roberto_silva_cv.pdf",
    motivation: "Busco oportunidades para aplicar mis conocimientos en desarrollo web moderno",
    salary_expectation: 2600000,
    availability: "2 semanas",
    source_portal: "GetOnBoard",
    consultant_rating: 4,
    status: "presentado", // Changed to filtrado so it appears in Module 3
    created_at: "2024-01-19T14:30:00Z",
    presentation_status: "presentado",
    age: 32,
    comuna: "Providencia",
    profession: "Desarrollador Full Stack",
    consultant_comment: "Buen candidato con experiencia práctica, aunque le falta algo de experiencia en TypeScript",
  },
  {
    id: "9",
    process_id: "1", // Carlos Rodriguez's process
    name: "Luis Fernando Vega",
    email: "luis.vega@email.com",
    phone: "+56 9 4444 3333",
    cv_file: "luis_vega_cv.pdf",
    motivation: "Interesado en desarrollo full stack",
    salary_expectation: 2400000,
    availability: "1 mes",
    source_portal: "Indeed",
    consultant_rating: 3,
    status: "postulado",
    created_at: "2024-01-20T09:00:00Z",
    presentation_status: "no_presentado", // This candidate should NOT appear in Module 3
    rejection_reason: "No cumple con todos los requisitos técnicos solicitados",
    age: 28,
    comuna: "Ñuñoa",
    profession: "Desarrollador Junior",
    consultant_comment: "Candidato junior con potencial pero falta experiencia senior",
  },
  {
    id: "10",
    process_id: "9", // Nuevo proceso con 3 vacantes
    name: "Carlos Mendoza",
    email: "carlos.mendoza@email.com",
    phone: "+56 9 1111 0000",
    cv_file: "carlos_mendoza_cv.pdf",
    motivation: "Desarrollador frontend con 4 años de experiencia en React y Vue.js",
    salary_expectation: 2000000,
    availability: "Inmediata",
    source_portal: "LinkedIn",
    consultant_rating: 4,
    status: "aprobado",
    created_at: "2024-02-12T10:00:00Z",
    presentation_date: "2024-02-15T14:00:00Z",
    client_response: "aprobado",
    client_comments: "Excelente perfil técnico, muy recomendado",
    presentation_status: "presentado",
    age: 29,
    comuna: "Las Condes",
    profession: "Desarrollador Frontend",
    consultant_comment: "Candidato sólido con buena experiencia en React",
  },
  {
    id: "11",
    process_id: "9", // Nuevo proceso con 3 vacantes
    name: "Ana Patricia Herrera",
    email: "ana.herrera@email.com",
    phone: "+56 9 2222 0000",
    cv_file: "ana_herrera_cv.pdf",
    motivation: "Frontend developer especializada en React y TypeScript",
    salary_expectation: 2200000,
    availability: "2 semanas",
    source_portal: "GetOnBoard",
    consultant_rating: 5,
    status: "aprobado",
    created_at: "2024-02-13T11:30:00Z",
    presentation_date: "2024-02-16T10:00:00Z",
    client_response: "aprobado",
    client_comments: "Muy buena candidata, experiencia relevante",
    presentation_status: "presentado",
    age: 31,
    comuna: "Providencia",
    profession: "Desarrolladora Frontend",
    consultant_comment: "Excelente candidata con experiencia sólida en tecnologías requeridas",
  },
  {
    id: "12",
    process_id: "9", // Nuevo proceso con 3 vacantes
    name: "Miguel Ángel Soto",
    email: "miguel.soto@email.com",
    phone: "+56 9 3333 0000",
    cv_file: "miguel_soto_cv.pdf",
    motivation: "Desarrollador full stack con enfoque en frontend",
    salary_expectation: 2100000,
    availability: "1 mes",
    source_portal: "Indeed",
    consultant_rating: 3,
    status: "aprobado",
    created_at: "2024-02-14T09:15:00Z",
    presentation_date: "2024-02-17T15:30:00Z",
    client_response: "aprobado",
    client_comments: "Buen candidato, aunque necesita más experiencia en React",
    presentation_status: "presentado",
    age: 26,
    comuna: "Maipú",
    profession: "Desarrollador Full Stack",
    consultant_comment: "Candidato con potencial, necesita desarrollo en React",
  },
]

// Mock Publications
export const mockPublications: Publication[] = [
  {
    id: "1",
    process_id: "1",
    portal: "LinkedIn",
    publication_date: "2024-01-16T12:00:00Z",
    status: "activa",
  },
  {
    id: "2",
    process_id: "1",
    portal: "GetOnBoard",
    publication_date: "2024-01-16T14:30:00Z",
    status: "activa",
  },
  {
    id: "3",
    process_id: "2",
    portal: "Behance",
    publication_date: "2024-01-22T10:15:00Z",
    status: "activa",
  },
  {
    id: "4",
    process_id: "6",
    portal: "Indeed",
    publication_date: "2024-02-02T11:00:00Z",
    status: "activa",
  },
]

// Mock Hitos (Milestones)
export const mockHitos: Hito[] = [
  {
    id: "1",
    process_id: "1",
    name: "Publicación en Portales",
    description: "Publicar la oferta en portales de empleo",
    start_trigger: "proceso_iniciado",
    duration_days: 3,
    anticipation_days: 1,
    status: "completado",
    start_date: "2024-01-16T09:00:00Z",
    due_date: "2024-01-19T17:00:00Z",
    completed_date: "2024-01-16T14:30:00Z",
  },
  {
    id: "2",
    process_id: "1",
    name: "Recolección de CVs",
    description: "Recopilar y filtrar candidatos",
    start_trigger: "publicacion_realizada",
    duration_days: 7,
    anticipation_days: 2,
    status: "completado",
    start_date: "2024-01-16T14:30:00Z",
    due_date: "2024-01-23T17:00:00Z",
    completed_date: "2024-01-20T16:00:00Z",
  },
  {
    id: "3",
    process_id: "1",
    name: "Presentación al Cliente",
    description: "Enviar candidatos preseleccionados al cliente",
    start_trigger: "candidatos_filtrados",
    duration_days: 2,
    anticipation_days: 1,
    status: "completado",
    start_date: "2024-01-20T16:00:00Z",
    due_date: "2024-01-22T17:00:00Z",
    completed_date: "2024-01-21T11:00:00Z",
  },
  {
    id: "4",
    process_id: "1",
    name: "Evaluación Psicolaboral",
    description: "Realizar evaluaciones psicológicas a candidatos aprobados",
    start_trigger: "candidatos_aprobados",
    duration_days: 5,
    anticipation_days: 2,
    status: "en_progreso",
    start_date: "2024-01-22T09:00:00Z",
    due_date: "2024-01-27T17:00:00Z",
  },
  {
    id: "5",
    process_id: "2",
    name: "Búsqueda de Candidatos",
    description: "Identificar y contactar candidatos potenciales",
    start_trigger: "proceso_iniciado",
    duration_days: 10,
    anticipation_days: 3,
    status: "en_progreso",
    start_date: "2024-01-22T08:00:00Z",
    due_date: "2024-02-01T17:00:00Z",
  },
  {
    id: "6",
    process_id: "3",
    name: "Programar Evaluación",
    description: "Coordinar fecha y hora de evaluación psicológica",
    start_trigger: "proceso_iniciado",
    duration_days: 2,
    anticipation_days: 1,
    status: "completado",
    start_date: "2024-01-26T10:00:00Z",
    due_date: "2024-01-28T17:00:00Z",
    completed_date: "2024-01-27T14:00:00Z",
  },
]

// Mock Psychological Evaluations
export const mockPsychologicalEvaluations: PsychologicalEvaluation[] = [
  {
    id: "1",
    candidate_id: "4",
    interview_date: "2024-01-30T10:00:00Z",
    interview_status: "programada",
    report_due_date: "2024-02-02T17:00:00Z",
    tests: [
      {
        id: "1",
        evaluation_id: "1",
        test_name: "Test de Liderazgo",
        result:
          "Alto dominio en habilidades de liderazgo, muestra capacidad para dirigir equipos y tomar decisiones estratégicas bajo presión",
      },
      {
        id: "2",
        evaluation_id: "1",
        test_name: "Evaluación de Competencias Comerciales",
        result:
          "Excelente orientación a resultados y habilidades de negociación, demuestra capacidad para establecer relaciones comerciales sólidas",
      },
    ],
  },
  {
    id: "2",
    candidate_id: "5",
    interview_date: "2024-02-01T14:00:00Z",
    interview_status: "programada",
    report_due_date: "2024-02-05T17:00:00Z",
    tests: [
      {
        id: "3",
        evaluation_id: "2",
        test_name: "Test de Análisis Cuantitativo",
        result:
          "Sobresaliente capacidad analítica y manejo de datos cuantitativos, demuestra precisión en cálculos complejos y interpretación estadística",
      },
    ],
  },
]

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: "1",
    user_id: "2",
    process_id: "1",
    hito_id: "4",
    type: "proxima_vencer",
    title: "Evaluación Psicolaboral próxima a vencer",
    message: "La evaluación psicolaboral para el proceso 'Desarrollador Full Stack Senior' vence en 1 día",
    created_at: "2024-01-26T09:00:00Z",
    read: false,
  },
  {
    id: "2",
    user_id: "3",
    process_id: "2",
    hito_id: "5",
    type: "proxima_vencer",
    title: "Búsqueda de candidatos próxima a vencer",
    message: "La búsqueda de candidatos para 'Diseñador UX/UI' vence en 2 días",
    created_at: "2024-01-30T08:00:00Z",
    read: false,
  },
  {
    id: "3",
    user_id: "2",
    process_id: "6",
    hito_id: "7",
    type: "vencida",
    title: "Hito vencido",
    message: "El hito 'Búsqueda de candidatos' para 'Analista de Datos' está vencido",
    created_at: "2024-02-03T10:00:00Z",
    read: false,
  },
]

// Service Type Labels
export const serviceTypeLabels: Record<ServiceType, string> = {
  proceso_completo: "Proceso Completo",
  long_list: "Long List",
  targeted_recruitment: "Targeted Recruitment",
  evaluacion_psicolaboral: "Evaluación Psicolaboral",
  test_psicolaboral: "Test Psicolaboral",
}

// Process Status Labels
export const processStatusLabels: Record<ProcessStatus, string> = {
  creado: "Creado",
  iniciado: "Iniciado",
  en_progreso: "En Progreso",
  completado: "Completado",
  cancelado: "Cancelado",
  congelado: "Congelado",
}

// Candidate Status Labels
export const candidateStatusLabels: Record<CandidateStatus, string> = {
  postulado: "Postulado",
  presentado: "Presentado",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
  contratado: "Contratado",
}

// Hito Status Labels
export const hitoStatusLabels: Record<HitoStatus, string> = {
  pendiente: "Pendiente",
  en_progreso: "En Progreso",
  completado: "Completado",
  vencido: "Vencido",
}

// Helper functions
export function getProcessesByConsultant(consultantId: string): Process[] {
  return mockProcesses.filter((process) => process.consultant_id === consultantId)
}

export function getCandidatesByProcess(processId: string): Candidate[] {
  return mockCandidates.filter((candidate) => candidate.process_id === processId)
}

export function getPublicationsByProcess(processId: string): Publication[] {
  return mockPublications.filter((publication) => publication.process_id === processId)
}

export function getHitosByProcess(processId: string): Hito[] {
  return mockHitos.filter((hito) => hito.process_id === processId)
}

export function getNotificationsByUser(userId: string): Notification[] {
  return mockNotifications.filter((notification) => notification.user_id === userId)
}

export function getPsychologicalEvaluationByCandidate(candidateId: string): PsychologicalEvaluation | undefined {
  return mockPsychologicalEvaluations.find((evaluation) => evaluation.candidate_id === candidateId)
}

export function getDocumentsByConsultant(consultantId: string): ConsultantDocument[] {
  const user = mockUsers.find((u) => u.id === consultantId)
  return user?.documents || []
}

// KPI Helper functions
export function getActiveProcessesByConsultant(): Record<string, number> {
  const activeProcesses = mockProcesses.filter((p) => p.status === "en_progreso" || p.status === "iniciado")
  const result: Record<string, number> = {}

  activeProcesses.forEach((process) => {
    const consultantName = process.consultant.name
    result[consultantName] = (result[consultantName] || 0) + 1
  })

  return result
}

export function getOverdueHitosByConsultant(): Record<string, number> {
  const overdueHitos = mockHitos.filter((h) => h.status === "vencido")
  const result: Record<string, number> = {}

  overdueHitos.forEach((hito) => {
    const process = mockProcesses.find((p) => p.id === hito.process_id)
    if (process) {
      const consultantName = process.consultant.name
      result[consultantName] = (result[consultantName] || 0) + 1
    }
  })

  return result
}

export function getProcessCompletionStats(): Array<{
  consultant: string
  completed: number
  onTime: number
  delayed: number
  completionRate: number
}> {
  const consultants = mockUsers.filter((u) => u.role === "consultor")

  return consultants.map((consultant) => {
    const processes = mockProcesses.filter((p) => p.consultant_id === consultant.id)
    const completed = processes.filter((p) => p.status === "completado").length
    const onTime = Math.floor(completed * 0.8) // Mock: 80% on time
    const delayed = completed - onTime
    const completionRate = processes.length > 0 ? (completed / processes.length) * 100 : 0

    return {
      consultant: consultant.name,
      completed,
      onTime,
      delayed,
      completionRate: Math.round(completionRate),
    }
  })
}

export function getRevenueByMonth(): Array<{ month: string; revenue: number; target: number }> {
  return [
    { month: "Ene", revenue: 45000000, target: 40000000 },
    { month: "Feb", revenue: 52000000, target: 45000000 },
    { month: "Mar", revenue: 38000000, target: 42000000 },
    { month: "Abr", revenue: 61000000, target: 48000000 },
    { month: "May", revenue: 55000000, target: 50000000 },
    { month: "Jun", revenue: 48000000, target: 47000000 },
  ]
}

export function getProcessesByServiceType(): Array<{ service: string; count: number; percentage: number }> {
  const serviceTypeCounts: Record<ServiceType, number> = {
    proceso_completo: 0,
    long_list: 0,
    targeted_recruitment: 0,
    evaluacion_psicolaboral: 0,
    test_psicolaboral: 0,
  }

  mockProcesses.forEach((process) => {
    serviceTypeCounts[process.service_type]++
  })

  const total = mockProcesses.length
  return Object.entries(serviceTypeCounts).map(([service, count]) => ({
    service: serviceTypeLabels[service as ServiceType],
    count,
    percentage: Math.round((count / total) * 100),
  }))
}

export function getClientSatisfactionData(): Array<{ client: string; satisfaction: number; processes: number }> {
  return mockClients.map((client) => {
    const clientProcesses = mockProcesses.filter((p) => p.client_id === client.id)
    return {
      client: client.name,
      satisfaction: Math.floor(Math.random() * 20) + 80, // Mock: 80-100% satisfaction
      processes: clientProcesses.length,
    }
  })
}

export function getTimeToHireData(): Array<{ process: string; days: number; target: number }> {
  return [
    { process: "Desarrollador Full Stack", days: 25, target: 30 },
    { process: "Diseñador UX/UI", days: 18, target: 20 },
    { process: "Gerente de Ventas", days: 35, target: 25 },
    { process: "Analista de Datos", days: 15, target: 20 },
    { process: "Product Manager Senior", days: 22, target: 28 },
    { process: "Ingeniero Civil", days: 15, target: 20 },
  ]
}

export function getCandidateSourceData(): Array<{ source: string; candidates: number; hired: number }> {
  return [
    { source: "LinkedIn", candidates: 45, hired: 8 },
    { source: "GetOnBoard", candidates: 32, hired: 5 },
    { source: "Indeed", candidates: 28, hired: 3 },
    { source: "Behance", candidates: 15, hired: 2 },
    { source: "Referidos", candidates: 12, hired: 4 },
  ]
}

export function getConsultantPerformanceData(): Array<{
  consultant: string
  processesCompleted: number
  avgTimeToHire: number
  clientSatisfaction: number
  efficiency: number
}> {
  return mockUsers
    .filter((u) => u.role === "consultor")
    .map((consultant) => ({
      consultant: consultant.name,
      processesCompleted: Math.floor(Math.random() * 10) + 5,
      avgTimeToHire: Math.floor(Math.random() * 15) + 20,
      clientSatisfaction: Math.floor(Math.random() * 15) + 85,
      efficiency: Math.floor(Math.random() * 20) + 80,
    }))
}

export function getAllProcesses(): Array<{
  id: string
  client: string
  position: string
  consultant: string
  status: string
  startDate: string
  serviceType: string
}> {
  return mockProcesses.map((process) => ({
    id: process.id,
    client: process.client.name,
    position: process.position_title,
    consultant: process.consultant.name,
    status: processStatusLabels[process.status] || process.status,
    startDate: process.started_at || process.created_at,
    serviceType: serviceTypeLabels[process.service_type],
  }))
}

export const predefinedPositions = [
  "Desarrollador Full Stack Senior",
  "Diseñador UX/UI",
  "Gerente de Ventas",
  "Analista de Datos",
  "Product Manager Senior",
  "Ingeniero Civil",
  "Analista de Riesgos",
  "Jefe de Sucursal",
  "Contador Senior",
  "Especialista en Marketing Digital",
  "Coordinador de RRHH",
  "Supervisor de Operaciones",
  "Ejecutivo Comercial",
  "Desarrollador Frontend",
  "Desarrollador Backend",
  "DevOps Engineer",
  "Scrum Master",
  "Business Analyst",
  "Quality Assurance Engineer",
  "Arquitecto de Software",
]
