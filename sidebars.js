// @ts-check

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.

 @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  technicalSidebar: [
    {
      type: 'category',
      label: 'Documentación Técnica',
      collapsible: false,
      collapsed: false,
      items: [
        'technical/overview',
        'technical/architecture',
        'technical/environment',
        'technical/auth-mongo',
        'technical/media-ocr',
        'technical/openai-parsing',
        'technical/data-model',
        'technical/state-machine',
        'technical/fuzzy-matching',
        'technical/sessions-recovery',
        'technical/error-handling',
        'technical/security',
        'technical/deployment',
        'technical/maintenance',
        'technical/extensibility',
        'technical/endpoints',
        'technical/testing',
        'technical/changelog',
      ],
    },
  ],
  usersSidebar: [
    {
      type: 'category',
      label: 'Manual de Usuario',
      collapsible: false,
      collapsed: false,
      items: [
        'users/introduction',
        'users/basic-flow',
        'users/destinatarios',
        'users/metodos-pago',
        'users/modification',
        'users/lists',
        'users/creation',
        'users/errors-retries',
        'users/best-practices',
        'users/faq',
        'users/troubleshooting',
        'users/glossary',
        'users/limitations',
        'users/summary',
      ],
    },
  ],
};

export default sidebars;
