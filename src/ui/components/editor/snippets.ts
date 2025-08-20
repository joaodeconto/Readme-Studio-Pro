// Preset snippets available in the editor's snippet library
// Keep content small; users can customise after inserting

export type Snippet = {
  id: string;
  label: string;
  category: string;
  content: string;
};

export const snippetCategories = ["Sections", "Badges"];

export const snippets: Snippet[] = [
  {
    id: "section-install",
    label: "Installation section",
    category: "Sections",
    content: "## Installation\n\n```bash\nnpm install\n```\n",
  },
  {
    id: "section-usage",
    label: "Usage section",
    category: "Sections",
    content: "## Usage\n\n```bash\nnpm start\n```\n",
  },
  {
    id: "section-contributing",
    label: "Contributing section",
    category: "Sections",
    content: "## Contributing\n\nPull requests are welcome.\n",
  },
  {
    id: "section-license",
    label: "License section",
    category: "Sections",
    content: "## License\n\nMIT\n",
  },
  {
    id: "badge-build",
    label: "Build badge",
    category: "Badges",
    content:
      "![Build](https://img.shields.io/badge/build-passing-brightgreen)\n",
  },
  {
    id: "badge-license",
    label: "License badge",
    category: "Badges",
    content:
      "![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)\n",
  },
];

