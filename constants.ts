export const METADATA = {
  title: "Portfolio | Vinay Yalamanchi",
  description:
    "AI/ML Engineer and Computer Science master's graduate with 3+ years of experience building scalable software applications, REST APIs, and AI-enabled solutions using Python, C#, FastAPI, SQL, PostgreSQL, and Microsoft Azure.",
  siteUrl: "https://vinay-yalamanchi.github.io/Portfolio/",
};

export const MENULINKS = [
  { name: "Home", ref: "home" },
  { name: "Works", ref: "works" },
  { name: "Skills", ref: "skills" },
  { name: "Timeline", ref: "timeline" },
  { name: "Contact", ref: "contact" },
];

export const TYPED_STRINGS = [
  "I build AI-enabled applications",
  "I develop scalable REST APIs",
  "I integrate machine learning solutions",
  "I deploy software on Microsoft Azure",
];

export const EMAIL = "yalamanchivinay9@gmail.com";
export const PHONE = "+1 (978) 726-0619";
export const LOCATION = "Fremont, California, USA";

export const SOCIAL_LINKS = {
  linkedin: "https://www.linkedin.com/in/vinay-yalamanchi",
  github: "https://github.com/VINAY-YALAMANCHI",
};

export interface IProject {
  name: string;
  image: string;
  blurImage: string;
  description: string;
  gradient: [string, string];
  url: string;
  tech: string[];
  preview: "interview" | "hosting" | "tts" | "iot";
}

export const PROJECTS: IProject[] = [
  {
    name: "AI-Assisted Interview Simulator",
    image: "/projects/interview-simulator.jpg",
    blurImage: "/projects/blur/interview-simulator-blur.jpg",
    description:
      "Role-specific mock interviews with speech analysis, semantic scoring, confidence feedback, and dashboards.",
    gradient: ["#1F6582", "#1ABCFE"],
    url: "",
    tech: ["python", "streamlit", "huggingface", "pytorch", "postgresql"],
    preview: "interview",
  },
  {
    name: "Decentralized Web Hosting",
    image: "/projects/decentralized-hosting.jpg",
    blurImage: "/projects/blur/decentralized-hosting-blur.jpg",
    description:
      "A blockchain-based web hosting platform designed for data integrity, transparency, and trust.",
    gradient: ["#153BB9", "#0E2C8B"],
    url: "",
    tech: ["blockchain"],
    preview: "hosting",
  },
  {
    name: "Text-to-Speech Speed Analysis",
    image: "/projects/tts-analysis.jpg",
    blurImage: "/projects/blur/tts-analysis-blur.jpg",
    description:
      "End-to-end FPT.AI text-to-speech performance analysis with optimized local and remote data flow.",
    gradient: ["#245B57", "#004741"],
    url: "",
    tech: ["python", "api"],
    preview: "tts",
  },
  {
    name: "Smart Agriculture & Home Automation",
    image: "/projects/iot-automation.jpg",
    blurImage: "/projects/blur/iot-automation-blur.jpg",
    description:
      "Internet of Things projects focused on smart agriculture and home automation applications.",
    gradient: ["#003052", "#167187"],
    url: "",
    tech: ["iot"],
    preview: "iot",
  },
];

export const SKILLS = {
  programmingDevelopment: [
    "python",
    "csharp",
    "javascript",
    "sql",
    "fastapi",
    "react",
    "html",
    "css",
  ],
  aiMachineLearning: [
    "scikitlearn",
    "tensorflow",
    "pytorch",
    "huggingface",
    "generativeai",
  ],
  cloudDataDevOps: [
    "postgresql",
    "mysql",
    "azure",
    "azuredevops",
    "docker",
    "git",
    "github",
    "cicd",
  ],
};

export enum Branch {
  LEFT = "leftSide",
  RIGHT = "rightSide",
}

export enum NodeTypes {
  CONVERGE = "converge",
  DIVERGE = "diverge",
  CHECKPOINT = "checkpoint",
}

export enum ItemSize {
  SMALL = "small",
  LARGE = "large",
}

interface TimelineEntry {
  sortDate: string;
  title: string;
  organization: string;
  description: string;
  alignment: Branch;
  spacing?: number;
  slideImage?: string;
}

const yearNode = (year: string): CheckpointNode => ({
  type: NodeTypes.CHECKPOINT,
  title: year,
  size: ItemSize.LARGE,
  shouldDrawLine: false,
  alignment: Branch.LEFT,
});

const entryNode = (entry: TimelineEntry): CheckpointNode => ({
  type: NodeTypes.CHECKPOINT,
  title: entry.title,
  subtitle: `${entry.organization} | ${entry.description}`,
  size: ItemSize.SMALL,
  shouldDrawLine: true,
  alignment: entry.alignment,
  spacing: entry.spacing,
  slideImage: entry.slideImage,
});

// The array intentionally follows the original Folio visual model:
// newest years first so 2026 renders at the top and 2018 at the bottom.
// Month-level details are small entries beneath their year heading, while
// DIVERGE/CONVERGE nodes activate the original curved secondary track only
// for periods where education and employment overlap.
export const TIMELINE: Array<TimelineNodeV2> = [
  yearNode("2026"),
  entryNode({
    sortDate: "2026-03-01",
    title: "March — AI Engineer (Present)",
    organization: "UL Solutions",
    description:
      "Developing AI-enabled applications, backend services, APIs, automation workflows, CI/CD pipelines, and data-processing solutions using Python, FastAPI, SQL, cloud technologies, and machine learning.",
    alignment: Branch.LEFT,
    spacing: 520,
    slideImage: "/timeline/01-ul-solutions.jpg",
  }),

  yearNode("2025"),
  entryNode({
    sortDate: "2025-12-31",
    title: "Master of Science completed",
    organization: "Rivier University, USA",
    description: "Completed the Master of Science in Computer Science program.",
    alignment: Branch.LEFT,
    spacing: 420,
    slideImage: "/timeline/02-rivier-graduation.jpg",
  }),

  yearNode("2024"),
  entryNode({
    sortDate: "2024-01-01",
    title: "January — Master of Science started",
    organization: "Rivier University, USA",
    description: "Started the Master of Science in Computer Science program.",
    alignment: Branch.LEFT,
    spacing: 440,
    slideImage: "/timeline/03-rivier-university.jpg",
  }),

  yearNode("2023"),
  { type: NodeTypes.DIVERGE },
  entryNode({
    sortDate: "2023-11-30",
    title: "November — AI Engineer role ended",
    organization: "Fractal Analytics",
    description: "Completed the AI Engineer role.",
    alignment: Branch.RIGHT,
    spacing: 400,
    slideImage: "/timeline/04-fractal-ai-engineer.jpg",
  }),
  entryNode({
    sortDate: "2023-02-01",
    title: "February — AI Engineer role started",
    organization: "Fractal Analytics",
    description:
      "Developed AI-powered applications, microservices, REST APIs, Generative AI capabilities, and Azure DevOps CI/CD pipelines using Python, C#, FastAPI, and Hugging Face Transformers.",
    alignment: Branch.RIGHT,
    spacing: 540,
    slideImage: "/timeline/04-fractal-ai-engineer.jpg",
  }),
  entryNode({
    sortDate: "2023-01-31",
    title: "January — Machine Learning Engineer role ended",
    organization: "Fractal Analytics",
    description: "Completed the Machine Learning Engineer role.",
    alignment: Branch.RIGHT,
    spacing: 420,
    slideImage: "/timeline/05-fractal-ml-engineer.jpg",
  }),
  { type: NodeTypes.CONVERGE },

  yearNode("2022"),
  { type: NodeTypes.DIVERGE },
  entryNode({
    sortDate: "2022-12-31",
    title: "Bachelor of Technology completed",
    organization: "Jawaharlal Nehru Technological University, MIST",
    description:
      "Completed the Bachelor of Technology in Computer Science and Engineering.",
    alignment: Branch.LEFT,
    spacing: 460,
    slideImage: "/timeline/06-bachelors-graduation.jpg",
  }),
  entryNode({
    sortDate: "2021-09-01",
    title: "September 2021 — Machine Learning Engineer role started",
    organization: "Fractal Analytics",
    description:
      "Built machine learning solutions with Python and Scikit-Learn, improved predictive accuracy by 12%, developed TensorFlow and PyTorch prototypes, and automated Azure model deployments.",
    alignment: Branch.RIGHT,
    spacing: 560,
    slideImage: "/timeline/05-fractal-ml-engineer.jpg",
  }),
  entryNode({
    sortDate: "2021-08-31",
    title: "August 2021 — Software Engineering Internship ended",
    organization: "Claro Software Solutions Pvt Ltd",
    description: "Completed the Software Engineering Internship.",
    alignment: Branch.RIGHT,
    spacing: 420,
    slideImage: "/timeline/07-claro-internship.jpg",
  }),
  entryNode({
    sortDate: "2021-02-01",
    title: "February 2021 — Software Engineering Internship started",
    organization: "Claro Software Solutions Pvt Ltd",
    description:
      "Developed responsive web applications, authentication, order tracking, and payment-processing features using HTML, CSS, and JavaScript in an Agile environment.",
    alignment: Branch.RIGHT,
    spacing: 540,
    slideImage: "/timeline/07-claro-internship.jpg",
  }),
  { type: NodeTypes.CONVERGE },

  yearNode("2021"),

  yearNode("2018"),
  entryNode({
    sortDate: "2018-01-01",
    title: "Bachelor of Technology started",
    organization: "Jawaharlal Nehru Technological University, MIST",
    description:
      "Started the Bachelor of Technology in Computer Science and Engineering program.",
    alignment: Branch.LEFT,
    spacing: 460,
    slideImage: "/timeline/06-bachelors-graduation.jpg",
  }),
];

export type TimelineNodeV2 = CheckpointNode | BranchNode;

export interface CheckpointNode {
  type: NodeTypes.CHECKPOINT;
  title: string;
  subtitle?: string;
  size: ItemSize;
  image?: string;
  slideImage?: string;
  shouldDrawLine: boolean;
  alignment: Branch;
  spacing?: number;
}

export interface BranchNode {
  type: NodeTypes.CONVERGE | NodeTypes.DIVERGE;
}

export const GTAG = "";
