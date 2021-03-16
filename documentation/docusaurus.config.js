module.exports = {
  title: 'Chimp.js',
  tagline: 'Tooling that helps you do quality, faster.',
  url: 'https://www.chimpjs.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  favicon: 'favicon-96x96.png',
  organizationName: 'xolvio', // Usually your GitHub org/user name.
  projectName: 'chimp', // Usually your repo name.
  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      switchConfig: {
        darkIcon: '◑',
        darkIconStyle: {
          color: '#ffffff',
        },
        lightIcon: '◑',
        lightIconStyle: {
          color: '#ffffff',
        },
      },
    },
    navbar: {
      hideOnScroll: true,
      title: '',
      logo: {
        href: 'https://www.chimpjs.com/',
        alt: 'Chimp.js Logo',
        src: 'img/logo.svg',
        srcDark: 'img/logo-dark.svg',
        target: '_self',
      },
      items: [],
    },
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} Xolv.io.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          // It is recommended to set document id as docs home page (`docs/` path).
          homePageId: 'doc1',
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/facebook/docusaurus/edit/master/website/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl: 'https://github.com/facebook/docusaurus/edit/master/website/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
