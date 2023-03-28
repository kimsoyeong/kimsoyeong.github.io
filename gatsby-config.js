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
    siteUrl: `https://kimsoyeong.github.io/`,
    title: `Mac-theme gatsby theme (developing)`,
    description: `Welcome to Soyeong Kim's personal website.`,
    language: `Korean`,
    author: {
      name: `Soyeong Kim`,
      role: `Graduate Student`,
      bio: {
        command: `안녕하세요 :) 척척학사 대학원생 김소영입니다. 👋🏻`,
        intro: `저는 C++, Python, JAVA를 주요 사용하고 AI 연구와 웹/앱 개발에 관심이 많습니다.`,
        thumbnail: `thumbnail.png`,
      },
      social: {
        github: `https://github.com/kimsoyeong`,
        linkedIn: `https://www.linkedin.com/in/soyeong-kim/`,
        tistory: `https://soso-cod3v.tistory.com/`,
        email: `soyeong@csap.snu.ac.kr`,
      },
    },
    about: {
      school: [
        // =====       [Timestamp Sample and Structure]      =====
        // ===== 🚫 Don't erase this sample (여기 지우지 마세요!) =====
        {
          date: '학력',
          activity: '',
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
          date: '2018.03 ~ 2022.02',
          activity: '충남대학교 컴퓨터공학과 학사',
        },
      ],
      experience: [
        {
          date: '경력',
          activity: '',
          links: {
            github: '',
            post: '',
            googlePlay: '',
            appStore: '',
            demo: '',
          },
        },
        {
          date: '2021.06 ~ 2021.08',
          activity: 'SI Analytics 인턴',
        },
      ],
      // experience: 경력
      projects: [
        // =====        [Project Sample and Structure]        =====
        // ===== 🚫 Don't erase this sample (여기 지우지 마세요!)  =====
        {
          title: '프로젝트',
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
          title: 'YOCO: You Only Cook Once',
          description:
            'YOCO is a cooking AI based on the Unbiased teacher v2 network. It helps users cook easily by predicting doneness of the ingredients.',
          techStack: ['python', 'pytorch', 'detectron2', 'ubteacher v2'],
          thumbnailUrl:
            'https://user-images.githubusercontent.com/43427380/222368809-683b0c2e-0aca-4f7e-ac1e-eb8eef6e51d1.png',
          links: {
            github: 'https://github.com/SNU-YOCO/YOCO',
          },
        },
        {
          title: '소복소복: Send me sobok',
          description:
            '"Bok" means luck in Korean. In the new year, Koreans wish a happy new year by sharing words of blessing with people around them.',
          techStack: ['react.js', 'node.js', 'express', 'mongo db'],
          thumbnailUrl:
            'https://user-images.githubusercontent.com/43427380/226523633-c0b6c1e5-5143-4939-b1da-159e967824e2.png',
          links: {
            post: 'https://rainbow-libra-648.notion.site/2a0285cb699f4f97bc2d8ad1f1af52cd',
            github: 'https://github.com/horangtteok/sendmesobok',
          },
        },
        {
          title: 'PURUPURU: EASY Waste-Sorting Guide App',
          description:
            'An Android App for waste sorting using a Real-time object detection on camera feed.',
          techStack: [
            'python',
            'fast.ai',
            'kotlin',
            'android studio',
            'tensorflow',
            'tflite',
            'firebase',
          ],
          thumbnailUrl:
            'https://user-images.githubusercontent.com/43427380/143508106-19002018-3890-4fea-aadf-5030c56671ce.png',
          links: {
            github: 'https://github.com/PA-roketdan/PruPru',
          },
        },
        {
          title: '커밋냥: 커밋기록 앱',
          description: '1일 1커밋 도우미 애플리케이션 구현',
          techStack: [
            'kotlin',
            'android studio',
            'node.js',
            'firebase',
            'heroku',
          ],
          links: {
            github: 'https://github.com/Soyeong-personal/GitMeow_android',
          },
        },
      ],
      awards: [
        {
          date: 'YYYY',
          title: '대회 이름',
          host: '주최',
          description: '수상내역',
          links: {
            github: '',
            post: '',
            googlePlay: '',
            appStore: '',
            demo: '',
          },
        },
        {
          date: '2023',
          title: '앰비언트 AI Competition',
          host: '서울대학교 데이터사이언스대학원',
          description: '교내 최우수상 수상',
        },
        {
          date: '2021',
          title: '2021 CNU 창의SW축전',
          host: '충남대학교 컴퓨터공학과',
          description: '교내 창의작품 경진대회 우수상(2등) 수상',
        },
        {
          date: '2021',
          title:
            '2021 CNU Engineering Fair: 캡스톤 디자인 및 졸업작품 경진대회',
          host: '충남대학교 공과대학',
          description: '교내 캡스톤 디자인 및 졸업작품 경진대회 우수상 수상',
        },
        {
          date: '2021',
          title: '2021 생각하는 프로그래밍 대회',
          host: '충남대학교 컴퓨터공학과',
          description: '교내 알고리즘 경진대회 은상 수상',
        },
        {
          date: '2021',
          title: '2021 CNU/AI Project Fair',
          host: '충남대학교 컴퓨터공학과',
          description: '교내 AI/SW 프로젝트 경진대회 우수상(2등) 수상',
        },
        {
          date: '2020',
          title: '2020 생각하는 프로그래밍 대회',
          host: '충남대학교 컴퓨터공학과',
          description: '교내 알고리즘 대회 동상 수상',
        },
        {
          date: '2018',
          title: '2018 생각하는 프로그래밍 대회',
          host: '충남대학교 컴퓨터공학과',
          description: '교내 알고리즘 경진대회 신입생 2등상 수상',
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
    `gatsby-plugin-sitemap`,
    {
      resolve: 'gatsby-plugin-robots-txt',
      options: {
        policy: [{ userAgent: '*', allow: '/' }],
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
