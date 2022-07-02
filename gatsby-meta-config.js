module.exports = {
  title: `soyang.dev`,
  description: `소소한 개발일기`,
  language: `ko`, // `ko`, `en` => currently support versions for Korean and English
  siteUrl: `https://www.kimsoyeong.github.io`,
  ogImage: `/og-image.png`, // Path to your in the 'static' folder
  comments: {
    utterances: {
      repo: `kimsoyeong/kimsoyeong.github.io`, // `zoomkoding/zoomkoding-gatsby-blog`,
    },
  },
  ga: 'G-Q0ND4DX22F', // Google Analytics Tracking ID
  author: {
    name: `김소영`,
    bio: {
      role: `대학원생`,
      description: ['생각하는', '능동적으로 일하는', '새로움에 도전하는'],
      thumbnail: 'zoomkoding.gif', // Path to the image in the 'asset' folder
    },
    social: {
      github: `https://github.com/kimsoyeong`,
      linkedIn: `https://www.linkedin.com/in/soyeong-kim/`,
      email: `soyeong.kim9@gmail.com`,
    },
  },

  // metadata for About Page
  about: {
    timestamps: [
      // =====       [Timestamp Sample and Structure]      =====
      // ===== 🚫 Don't erase this sample (여기 지우지 마세요!) =====
      {
        date: '',
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
        date: '2022.03 ~',
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
        title: '개발 블로그 테마 개발',
        description:
          '개발 블로그를 운영하는 기간이 조금씩 늘어나고 점점 많은 생각과 경험이 블로그에 쌓아가면서 제 이야기를 담고 있는 블로그를 직접 만들어보고 싶게 되었습니다...',
        techStack: ['gatsby', 'react'],
        thumbnailUrl: 'blog.png',
        links: {
          post: '/gatsby-starter-zoomkoding-introduction',
          github: 'https://github.com/zoomkoding/zoomkoding-gatsby-blog',
          googlePlay: 'https://play.google.com/store/apps/details?id=care.jivaka.picky',
          demo: 'https://www.zoomkoding.com',
        },
      },
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
};
