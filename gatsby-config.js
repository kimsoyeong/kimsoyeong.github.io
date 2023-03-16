/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-config/
 */

/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
  siteMetadata: {
    title: `Gatsby Default Starter`,
    description: `Kick off your next, great Gatsby project with this default starter. This barebones starter ships with the main Gatsby configuration files you might need.`,
    language: `Korean`,
    author: {
      name: `Soyeong Kim`,
      bio: {
        command: `Hello, world!!`,
        thumbnail: `thumbnail_path`,
      },
      social: {
        github: `https://github.com/kimsoyeong`,
        linkedIn: `https://www.linkedin.com/in/soyeong-kim/`,
        email: `soyeong@csap.snu.ac.kr`,
      },
    },
    about: {
      timestamps: [
        // =====       [Timestamp Sample and Structure]      =====
        // ===== 🚫 Don't erase this sample (여기 지우지 마세요!) =====
        {
          date: 'test',
          activity: 'test',
          links: {
            github: '',
            post: '',
            googlePlay: '',
            appStore: '',
            demo: '',
          },
        },
        // ========================================================
        // ========================================================
        {
          date: '2022.03 ~ 재학중',
          activity: '서울대학교 컴퓨터공학부 석사',
        },
        {
          date: '2021.06 ~ 2021.08',
          activity: 'SI Analytics 인턴',
        },
        {
          date: '2018.03 ~ 2022.02',
          activity: '충남대학교 컴퓨터공학과 학사',
        },
      ],
      // experience: 경력
      projects: [
        // =====        [Project Sample and Structure]        =====
        // ===== 🚫 Don't erase this sample (여기 지우지 마세요!)  =====
        {
          title: '',
          description: '',
          techStack: ['', ''],
          thumbnailUrl: '',
          links: {
            post: '',
            github: '',
            googlePlay: '',
            appStore: '',
            demo: '',
          },
        },
        // ========================================================
        // ========================================================
        {
          title: '커밋냥(커밋기록 앱) 개발',
          description:
            '학생들이 예비 수강 신청 과정에서 겪게 되는 불편함을 개선하고자 예비 수강 신청을 도와줄 수 있는 웹사이트를 만들게 되었습니다...',
          techStack: ['kotlin', 'android studio', 'node.js', 'firebase'],
          thumbnailUrl: 'picky.png',
          links: {
            post: '/gatsby-starter-zoomkoding-introduction',
            github: 'https://github.com/zoomkoding/zoomkoding-gatsby-blog',
            demo: 'https://www.zoomkoding.com',
          },
        },
      ],
    },
  },
  plugins: [
    `gatsby-plugin-image`,
    `gatsby-plugin-emotion`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `contents`,
        path: `${__dirname}/contents`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: 'gatsby-remark-smartypants',
            options: {
              dashes: 'oldschool',
            },
          },
          {
            resolve: 'gatsby-remark-prismjs',
            options: {
              classPrefix: 'language-',
            },
          },
          {
            resolve: 'gatsby-remark-images',
            options: {
              maxWidth: 768,
              quality: 100,
              withWebp: true,
            },
          },
          {
            resolve: 'gatsby-remark-copy-linked-files',
            options: {},
          },
          {
            resolve: 'gatsby-remark-external-links',
            options: {
              target: '_blank',
              rel: 'nofollow',
            },
          },
        ],
      },
    },
    // {
    //   resolve: `gatsby-plugin-manifest`,
    //   options: {
    //     name: `gatsby-starter-default`,
    //     short_name: `starter`,
    //     start_url: `/`,
    //     background_color: `#663399`,
    //     // This will impact how browsers show your PWA/website
    //     // https://css-tricks.com/meta-theme-color-and-trickery/
    //     // theme_color: `#663399`,
    //     display: `minimal-ui`,
    //     icon: `src/images/gatsby-icon.png`, // This path is relative to the root of the site.
    //   },
    // },
  ],
}
