/**
 * EvotoLite - 쉬운 리퀴파이 & 인물·색감 올인원 보정 스튜디오
 * Zero-Dependency Pure HTML5 Canvas Engine (PC & Smartphone PWA)
 */
(function () {
  'use strict';

  // =========================================================================
  // 1. 기본 보정 파라미터 정의 (총 48개 정밀 파라미터 - 4대 카테고리 분류)
  // =========================================================================
  const PARAM_GROUPS = {
    beauty: [
      'skinSmooth', 'skinBrighten', 'shineRemove', 'skinRednessRemove', 'faceContour',
      'darkCircle', 'nasolabialFold', 'neckWrinkle', 'doubleChin',
      'eyeBrighten', 'teethWhiten', 'lipTint', 'hairVolume', 'hairlineFill', 'hairGloss'
    ],
    liquify: [
      'faceSlim', 'faceSymmetry', 'vLine', 'cheekSlim', 'midfaceShorten',
      'foreheadHeight', 'chinLength', 'eyeSize', 'eyeWidth', 'eyeDistance',
      'eyeTilt', 'noseSlim', 'lipPlump', 'smileLift',
      'neckLengthen', 'shoulderWidth', 'armSlim', 'waistSlim', 'hipVolume',
      'legLength', 'clothesDewrinkle'
    ],
    color: [
      'bgBlur', 'bgClean', 'bgTintMode', 'bgTintStrength',
      'temperature', 'tint', 'exposure', 'contrast', 'highlights', 'shadows',
      'whites', 'blacks', 'vibrance', 'saturation', 'aquaBlueBoost', 'foliageGreen',
      'splitHighlightAmount', 'splitHighlightHue', 'splitShadowAmount', 'splitShadowHue',
      'straighten', 'flipH'
    ],
    effects: [
      'dehaze', 'grainAmount', 'grainSize', 'halation', 'clarity', 'sharpness', 'vignette', 'fade'
    ]
  };

  function createDefaultParams() {
    return {
      // 1) 인물 피부·주름·눈·치아·헤어 (Evoto Beauty)
      skinSmooth: 0,
      skinBrighten: 0,
      shineRemove: 0,
      skinRednessRemove: 0,
      faceContour: 0,
      darkCircle: 0,
      nasolabialFold: 0,
      neckWrinkle: 0,
      doubleChin: 0,
      eyeBrighten: 0,
      teethWhiten: 0,
      lipTint: 0,
      hairVolume: 0,
      hairlineFill: 0,
      hairGloss: 0,

      // 2) 이보토 슬라이더 리퀴파이 (얼굴·눈코입·체형·옷주름)
      faceSlim: 0,
      faceSymmetry: 0,
      vLine: 0,
      cheekSlim: 0,
      midfaceShorten: 0,
      foreheadHeight: 0,
      chinLength: 0,
      eyeSize: 0,
      eyeWidth: 0,
      eyeDistance: 0,
      eyeTilt: 0,
      noseSlim: 0,
      lipPlump: 0,
      smileLift: 0,
      neckLengthen: 0,
      shoulderWidth: 0,
      armSlim: 0,
      waistSlim: 0,
      hipVolume: 0,
      legLength: 0,
      clothesDewrinkle: 0,

      // 3) 색감 · 스튜디오 배경 · 구도
      bgBlur: 0,
      bgClean: 0,
      bgTintMode: 'none',
      bgTintStrength: 0,
      temperature: 0,
      tint: 0,
      exposure: 0,
      contrast: 0,
      highlights: 0,
      shadows: 0,
      whites: 0,
      blacks: 0,
      vibrance: 0,
      saturation: 0,
      aquaBlueBoost: 0,
      foliageGreen: 0,
      splitHighlightAmount: 0,
      splitHighlightHue: 42,
      splitShadowAmount: 0,
      splitShadowHue: 205,
      straighten: 0,
      flipH: false,

      // 4) 디헤이즈 · 필름그레인 · 특수효과
      dehaze: 0,
      grainAmount: 0,
      grainSize: 1.4,
      halation: 0,
      clarity: 0,
      sharpness: 0,
      vignette: 0,
      fade: 0
    };
  }

  // 인물 패키지 원클릭 프리셋 (탭 1 상단)
  const BEAUTY_PACKS = {
    cleanId: {
      name: '깨끗한 증명·프로필',
      values: {
        skinSmooth: 55, skinBrighten: 22, shineRemove: 45, skinRednessRemove: 30,
        faceContour: 25, darkCircle: 65, nasolabialFold: 45, neckWrinkle: 40,
        doubleChin: 40, eyeBrighten: 45, teethWhiten: 40, lipTint: 25,
        hairVolume: 30, hairlineFill: 25, hairGloss: 30
      }
    },
    dewyGlow: {
      name: '화사한 물광 여신',
      values: {
        skinSmooth: 65, skinBrighten: 45, shineRemove: 15, skinRednessRemove: 40,
        faceContour: 40, darkCircle: 70, nasolabialFold: 55, neckWrinkle: 45,
        doubleChin: 35, eyeBrighten: 60, teethWhiten: 50, lipTint: 50,
        hairVolume: 45, hairlineFill: 30, hairGloss: 55
      }
    },
    menNatural: {
      name: '남성 깔끔 피부·윤곽',
      values: {
        skinSmooth: 32, skinBrighten: 10, shineRemove: 60, skinRednessRemove: 35,
        faceContour: 45, darkCircle: 55, nasolabialFold: 35, neckWrinkle: 30,
        doubleChin: 45, eyeBrighten: 35, teethWhiten: 35, lipTint: 12,
        hairVolume: 25, hairlineFill: 35, hairGloss: 20
      }
    },
    youngFresh: {
      name: '다크·팔자 지우개 (동안)',
      values: {
        skinSmooth: 50, skinBrighten: 30, shineRemove: 35, skinRednessRemove: 25,
        faceContour: 30, darkCircle: 85, nasolabialFold: 80, neckWrinkle: 70,
        doubleChin: 65, eyeBrighten: 50, teethWhiten: 45, lipTint: 35,
        hairVolume: 35, hairlineFill: 30, hairGloss: 35
      }
    }
  };

  // 원클릭 리퀴파이 콤보 (탭 2 상단)
  const LIQUIFY_COMBOS = {
    natural: {
      name: '자연스러운 윤곽 정리',
      values: {
        faceSlim: 24, faceSymmetry: 25, vLine: 28, cheekSlim: 22, midfaceShorten: 15,
        eyeSize: 16, noseSlim: 18, smileLift: 15, neckLengthen: 20, clothesDewrinkle: 35
      }
    },
    vline: {
      name: '아이돌 V라인 + 중안부 축소',
      values: {
        faceSlim: 45, faceSymmetry: 35, vLine: 55, cheekSlim: 42, midfaceShorten: 42,
        chinLength: -15, eyeSize: 38, eyeWidth: 25, eyeTilt: 15, noseSlim: 35,
        lipPlump: 25, smileLift: 28, neckLengthen: 30
      }
    },
    body: {
      name: '전신 황금비율 + 직각 어깨',
      values: {
        faceSlim: 38, vLine: 30, neckLengthen: 50, shoulderWidth: 28,
        armSlim: 42, waistSlim: 48, hipVolume: 32, legLength: 62, clothesDewrinkle: 50
      }
    },
    studio: {
      name: '증명사진 대칭 · 옷주름 정돈',
      values: {
        faceSlim: 20, faceSymmetry: 55, vLine: 25, cheekSlim: 20,
        eyeSize: 15, smileLift: 22, neckLengthen: 32, shoulderWidth: 20, clothesDewrinkle: 75
      }
    }
  };

  // =========================================================================
  // 2. 30종 내장 감성·스튜디오 프리셋 데이터
  // =========================================================================
  const BUILTIN_PRESETS = [
    // [1] 인물 · 스튜디오 (7종)
    {
      id: 'evoto-clean',
      name: '이보토 클린 스튜디오',
      category: 'portrait',
      badge: '인물 대표',
      desc: '맑고 깨끗한 도자기 피부와 정돈된 스튜디오 조명 톤',
      gradient: 'linear-gradient(135deg, #ff9a8b, #ff6a88)',
      params: {
        skinSmooth: 48, skinBrighten: 26, darkCircle: 50, nasolabialFold: 35,
        eyeBrighten: 40, exposure: 10, contrast: 8, highlights: -14, shadows: 22,
        temperature: 4, tint: 6, vibrance: 16, clarity: 6
      }
    },
    {
      id: 'peach-blossom',
      name: '피치 블러썸 과즙',
      category: 'portrait',
      badge: '화사함',
      desc: '생기 넘치는 복숭아빛 볼터치와 화사한 봄날 인물 색감',
      gradient: 'linear-gradient(135deg, #ffecd2, #fcb69f)',
      params: {
        skinSmooth: 42, skinBrighten: 34, lipTint: 40, temperature: 12, tint: 18,
        exposure: 14, contrast: -6, highlights: -10, shadows: 28,
        vibrance: 24, splitHighlightHue: 28, splitHighlightAmount: 22
      }
    },
    {
      id: 'milky-soft',
      name: '밀키 소프트 크림',
      category: 'portrait',
      badge: '부드러움',
      desc: '우유를 탄 듯 뽀얗고 부드러운 로우 콘트라스트 감성',
      gradient: 'linear-gradient(135deg, #fdfbfb, #ebedee)',
      params: {
        skinSmooth: 55, skinBrighten: 38, shineRemove: 35, exposure: 16,
        contrast: -22, highlights: -24, shadows: 35, blacks: 18,
        saturation: -12, vibrance: 10, fade: 22
      }
    },
    {
      id: 'glass-skin-cool',
      name: '투명 유리알 쿨톤',
      category: 'portrait',
      badge: '쿨톤 투명',
      desc: '노란기를 쏙 뺀 맑고 차가운 백옥 유리알 피부 표현',
      gradient: 'linear-gradient(135deg, #a1c4fd, #c2e9fb)',
      params: {
        skinSmooth: 45, skinBrighten: 32, skinRednessRemove: 40, eyeBrighten: 50,
        teethWhiten: 45, temperature: -16, tint: 12, exposure: 12,
        highlights: 8, shadows: 18, whites: 15, vibrance: 14
      }
    },
    {
      id: 'pro-headshot',
      name: '프로페셔널 배우 프로필',
      category: 'portrait',
      badge: '입체 윤곽',
      desc: '깊이 있는 음영과 선명한 눈빛을 살리는 배우 프로필 톤',
      gradient: 'linear-gradient(135deg, #434343, #000000)',
      params: {
        skinSmooth: 35, faceContour: 50, darkCircle: 45, eyeBrighten: 55,
        hairGloss: 40, contrast: 22, highlights: -18, shadows: -8,
        whites: 14, blacks: -12, clarity: 24, sharpness: 28, saturation: -8, vignette: -22
      }
    },
    {
      id: 'warm-editorial',
      name: '웜 베이지 에디토리얼',
      category: 'portrait',
      badge: '화보 감성',
      desc: '매거진 화보처럼 차분하고 고급스러운 웜 베이지 무드',
      gradient: 'linear-gradient(135deg, #d7d2cc, #304352)',
      params: {
        skinSmooth: 40, shineRemove: 40, temperature: 18, tint: 4,
        exposure: 4, contrast: 10, highlights: -20, shadows: 16,
        saturation: -18, vibrance: 12, splitHighlightHue: 38, splitHighlightAmount: 26, fade: 14
      }
    },
    {
      id: 'wedding-pure',
      name: '웨딩 퓨어 화이트',
      category: 'portrait',
      badge: '웨딩·드레스',
      desc: '드레스 디테일과 화사한 신부 피부톤을 동시에 살리는 웨딩 프리셋',
      gradient: 'linear-gradient(135deg, #fff1eb, #ace0f9)',
      params: {
        skinSmooth: 52, skinBrighten: 35, darkCircle: 60, neckWrinkle: 50,
        teethWhiten: 50, exposure: 12, highlights: -32, shadows: 26,
        whites: 18, temperature: 6, tint: 10, halation: 24
      }
    },

    // [2] 필름 · 빈티지 (7종)
    {
      id: 'kodak-portra-400',
      name: '코닥 포트라 400',
      category: 'film',
      badge: '인물 필름',
      desc: '따뜻한 황금빛 살결과 고운 입자감의 전설적인 인물 필름',
      gradient: 'linear-gradient(135deg, #f6d365, #fda085)',
      params: {
        temperature: 16, tint: 6, exposure: 6, contrast: 12,
        highlights: -18, shadows: 14, vibrance: 22, saturation: -6,
        splitHighlightHue: 42, splitHighlightAmount: 25,
        splitShadowHue: 210, splitShadowAmount: 14,
        grainAmount: 26, grainSize: 1.4, fade: 14
      }
    },
    {
      id: 'fuji-pro-400h',
      name: '후지 프로 400H',
      category: 'film',
      badge: '청량 필름',
      desc: '맑은 민트·시안 하이라이트와 싱그러운 초록빛의 후지 필름',
      gradient: 'linear-gradient(135deg, #84fab0, #8fd3f4)',
      params: {
        temperature: -8, tint: -6, exposure: 10, contrast: 6,
        highlights: -14, shadows: 24, vibrance: 20,
        aquaBlueBoost: 35, foliageGreen: 40,
        splitHighlightHue: 175, splitHighlightAmount: 20,
        grainAmount: 22, grainSize: 1.3, fade: 12
      }
    },
    {
      id: 'kodak-gold-200',
      name: '코닥 골드 200',
      category: 'film',
      badge: '레트로 웜',
      desc: '햇살 머금은 노란빛과 향수를 부르는 따뜻한 빈티지 필름',
      gradient: 'linear-gradient(135deg, #f09819, #edde5d)',
      params: {
        temperature: 28, tint: 8, exposure: 8, contrast: 16,
        highlights: -10, shadows: 10, vibrance: 26,
        splitHighlightHue: 48, splitHighlightAmount: 35,
        grainAmount: 34, grainSize: 1.6, vignette: -18, fade: 18
      }
    },
    {
      id: 'cinestill-800t',
      name: '시네스틸 800T 야경',
      category: 'film',
      badge: '나이트 필름',
      desc: '푸른 텅스텐 색감과 조명이 번지는 붉은 할레이션 영화 필름',
      gradient: 'linear-gradient(135deg, #0f2027, #2c5364)',
      params: {
        temperature: -26, tint: 10, exposure: -4, contrast: 24,
        highlights: 12, shadows: -8, vibrance: 28,
        splitHighlightHue: 18, splitHighlightAmount: 30,
        splitShadowHue: 200, splitShadowAmount: 38,
        halation: 55, grainAmount: 38, grainSize: 1.8, vignette: -28
      }
    },
    {
      id: 'agfa-vista-200',
      name: '아그파 비스타 200',
      category: 'film',
      badge: '비비드 필름',
      desc: '쨍한 원색 채도와 묵직한 대비가 매력적인 유럽 감성 필름',
      gradient: 'linear-gradient(135deg, #ff416c, #ff4b2b)',
      params: {
        temperature: 8, tint: 4, contrast: 28, highlights: -12,
        shadows: -10, blacks: -15, saturation: 22, vibrance: 30,
        foliageGreen: 30, grainAmount: 30, grainSize: 1.5, vignette: -24
      }
    },
    {
      id: 'faded-polaroid',
      name: '바랜 폴라로이드 1998',
      category: 'film',
      badge: '빈티지 페이드',
      desc: '서랍 속 오래된 즉석사진처럼 아련하게 들뜬 매트 빈티지',
      gradient: 'linear-gradient(135deg, #c79081, #dfa579)',
      params: {
        temperature: 14, tint: 12, exposure: 6, contrast: -18,
        highlights: -26, shadows: 30, saturation: -24,
        splitHighlightHue: 45, splitHighlightAmount: 32,
        splitShadowHue: 260, splitShadowAmount: 18,
        grainAmount: 42, grainSize: 1.9, fade: 48, vignette: -20
      }
    },
    {
      id: 'kyoto-film-diary',
      name: '교토 산책 필름 일기',
      category: 'film',
      badge: '일본 감성',
      desc: '차분하고 맑은 하늘빛과 낮은 채도의 고즈넉한 일본 영화 톤',
      gradient: 'linear-gradient(135deg, #89f7fe, #66a6ff)',
      params: {
        temperature: -10, tint: -4, exposure: 14, contrast: -14,
        highlights: -16, shadows: 32, saturation: -14, vibrance: 18,
        aquaBlueBoost: 45, foliageGreen: 25, grainAmount: 24, grainSize: 1.3, fade: 24
      }
    },

    // [3] 시네마틱 · 감성 무드 (6종)
    {
      id: 'summer-youth-dehaze',
      name: '청량한 여름날 (디헤이즈)',
      category: 'cinema',
      badge: '디헤이즈 추천',
      desc: '뿌연 역광을 걷어내고 파란 하늘과 초록 잎사귀를 맑게 살립니다',
      gradient: 'linear-gradient(135deg, #00c6ff, #0072ff)',
      params: {
        dehaze: 55, temperature: -8, exposure: 8, contrast: 14,
        highlights: -20, shadows: 22, vibrance: 34,
        aquaBlueBoost: 50, foliageGreen: 40, clarity: 18, sharpness: 20
      }
    },
    {
      id: 'teal-and-orange',
      name: '시네마 티얼 앤 오렌지',
      category: 'cinema',
      badge: '헐리우드 영화',
      desc: '차가운 청록빛 그림자와 따뜻한 피부톤의 강렬한 영화 색감',
      gradient: 'linear-gradient(135deg, #134e5e, #f7971e)',
      params: {
        dehaze: 28, contrast: 22, highlights: -16, shadows: 12,
        vibrance: 26, saturation: -8,
        splitHighlightHue: 32, splitHighlightAmount: 44,
        splitShadowHue: 196, splitShadowAmount: 48,
        clarity: 20, vignette: -25
      }
    },
    {
      id: 'golden-sunset',
      name: '골든 아워 노을빛',
      category: 'cinema',
      badge: '노을 역광',
      desc: '해 질 녘 황금빛 노을이 머리카락과 어깨를 감싸는 로맨틱 무드',
      gradient: 'linear-gradient(135deg, #ff8008, #ffc837)',
      params: {
        temperature: 36, tint: 16, exposure: 8, contrast: 10,
        highlights: -14, shadows: 24, vibrance: 28,
        splitHighlightHue: 34, splitHighlightAmount: 42,
        splitShadowHue: 285, splitShadowAmount: 20,
        halation: 38, grainAmount: 18
      }
    },
    {
      id: 'seoul-night-clear',
      name: '서울 나이트 네온 (선명)',
      category: 'cinema',
      badge: '야경 디헤이즈',
      desc: '야간 촬영의 빛 번짐과 안개를 잡아주고 네온 색감을 살립니다',
      gradient: 'linear-gradient(135deg, #654ea3, #eaafc8)',
      params: {
        dehaze: 62, temperature: -18, tint: 20, contrast: 22,
        highlights: -28, shadows: 18, blacks: -14, vibrance: 36,
        splitHighlightHue: 315, splitHighlightAmount: 28,
        splitShadowHue: 220, splitShadowAmount: 36,
        clarity: 24, sharpness: 24
      }
    },
    {
      id: 'autumn-espresso',
      name: '가을 카페 에스프레소',
      category: 'cinema',
      badge: '브라운 무드',
      desc: '깊고 진한 커피향처럼 차분한 브라운·앰버 감성 톤',
      gradient: 'linear-gradient(135deg, #603813, #b29f94)',
      params: {
        temperature: 22, tint: 6, exposure: -4, contrast: 16,
        highlights: -24, shadows: 14, saturation: -26, vibrance: 14,
        splitHighlightHue: 38, splitHighlightAmount: 34,
        splitShadowHue: 28, splitShadowAmount: 26,
        grainAmount: 25, vignette: -28, fade: 20
      }
    },
    {
      id: 'dreamy-mist-glow',
      name: '몽환적 안개 글로우',
      category: 'cinema',
      badge: '소프트 헤이즈',
      desc: '디헤이즈를 반대로 활용해 꿈속 같은 뽀얀 안개와 빛번짐 연출',
      gradient: 'linear-gradient(135deg, #e0c3fc, #8ec5fc)',
      params: {
        dehaze: -28, skinSmooth: 50, exposure: 12, contrast: -16,
        highlights: 14, shadows: 28, halation: 60,
        grainAmount: 28, grainSize: 1.5, fade: 26
      }
    },

    // [4] 흑백 · 모노크롬 (4종)
    {
      id: 'leica-mono',
      name: '라이카 모노크롬 정통 흑백',
      category: 'mono',
      badge: '클래식 흑백',
      desc: '단단한 명암 계조와 은입자 질감이 살아 있는 정통 흑백 사진',
      gradient: 'linear-gradient(135deg, #2c3e50, #bdc3c7)',
      params: {
        saturation: -100, dehaze: 22, contrast: 32,
        highlights: -14, shadows: 8, whites: 18, blacks: -18,
        clarity: 26, sharpness: 24, grainAmount: 36, grainSize: 1.6, vignette: -26
      }
    },
    {
      id: 'silver-portrait-bw',
      name: '실버 소프트 인물 흑백',
      category: 'mono',
      badge: '부드러운 흑백',
      desc: '피부결이 거칠어 보이지 않고 부드럽게 빛나는 스튜디오 흑백',
      gradient: 'linear-gradient(135deg, #757f9a, #d7dde8)',
      params: {
        saturation: -100, skinSmooth: 50, darkCircle: 55,
        exposure: 8, contrast: 12, highlights: -20, shadows: 24,
        clarity: -8, grainAmount: 20, grainSize: 1.3, fade: 18
      }
    },
    {
      id: 'cinema-noir-bw',
      name: '하이 콘트라스트 느와르',
      category: 'mono',
      badge: '강렬한 흑백',
      desc: '깊은 암부와 극적인 빛의 대비를 강조하는 느와르 영화 흑백',
      gradient: 'linear-gradient(135deg, #000000, #434343)',
      params: {
        saturation: -100, dehaze: 42, exposure: -6, contrast: 50,
        highlights: 12, shadows: -24, whites: 24, blacks: -26,
        clarity: 35, grainAmount: 48, grainSize: 1.9, vignette: -42
      }
    },
    {
      id: 'warm-sepia-archive',
      name: '따뜻한 세피아 인화지',
      category: 'mono',
      badge: '세피아 은염',
      desc: '오래된 아날로그 암실에서 인화한 따뜻한 브라운 흑백 감성',
      gradient: 'linear-gradient(135deg, #3e2723, #d7ccc8)',
      params: {
        saturation: -92, temperature: 24, contrast: 18,
        highlights: -16, shadows: 16,
        splitHighlightHue: 42, splitHighlightAmount: 36,
        splitShadowHue: 32, splitShadowAmount: 34,
        grainAmount: 32, grainSize: 1.5, fade: 26, vignette: -24
      }
    },

    // [5] 이보토 성형 + 피부 + 색감 올인원 패키지 (6종)
    {
      id: 'allinone-idol-studio',
      name: '아이돌 V라인 + 도자기 피부',
      category: 'liquify',
      badge: '성형+피부+색감',
      desc: '소두·V라인·중안부 축소·큰눈·뿌리볼륨과 복숭아빛 피부를 한 번에!',
      gradient: 'linear-gradient(135deg, #ff758c, #ff7eb3)',
      params: {
        faceSlim: 42, faceSymmetry: 35, vLine: 52, cheekSlim: 38, midfaceShorten: 38,
        eyeSize: 36, eyeWidth: 24, noseSlim: 32, lipPlump: 25, smileLift: 26,
        skinSmooth: 60, skinBrighten: 38, darkCircle: 70, nasolabialFold: 55,
        eyeBrighten: 55, teethWhiten: 45, lipTint: 42, hairVolume: 42,
        temperature: 6, tint: 14, exposure: 10, shadows: 20, vibrance: 20
      }
    },
    {
      id: 'allinone-id-photo',
      name: '취업·증명사진 원클릭 완성',
      category: 'liquify',
      badge: '대칭+옷주름+배경',
      desc: '좌우 비대칭·승모근·셔츠 옷주름 정리 + 깨끗한 피부 + 정돈된 배경',
      gradient: 'linear-gradient(135deg, #3a7bd5, #3a6073)',
      params: {
        faceSlim: 22, faceSymmetry: 60, vLine: 26, cheekSlim: 22,
        eyeSize: 16, smileLift: 24, neckLengthen: 36, shoulderWidth: 22, clothesDewrinkle: 80,
        skinSmooth: 55, skinBrighten: 25, shineRemove: 55, darkCircle: 75,
        nasolabialFold: 60, doubleChin: 50, eyeBrighten: 45, teethWhiten: 50,
        hairVolume: 30, hairlineFill: 35, bgClean: 65, exposure: 8, contrast: 10
      }
    },
    {
      id: 'allinone-body-master',
      name: '전신 8등신 비율 + 청량 야외',
      category: 'liquify',
      badge: '전신비율+디헤이즈',
      desc: '작은 얼굴, 직각 어깨, 잘록한 허리, 긴 다리 비율과 맑은 디헤이즈 색감',
      gradient: 'linear-gradient(135deg, #11998e, #38ef7d)',
      params: {
        faceSlim: 40, vLine: 32, neckLengthen: 48, shoulderWidth: 30,
        armSlim: 44, waistSlim: 46, hipVolume: 30, legLength: 65, clothesDewrinkle: 45,
        skinSmooth: 40, skinBrighten: 24, dehaze: 35,
        exposure: 8, shadows: 20, vibrance: 26, aquaBlueBoost: 35
      }
    },
    {
      id: 'allinone-natural-daily',
      name: '인스타 감성 내추럴 윤곽',
      category: 'liquify',
      badge: '티 안 나는 보정',
      desc: '보정한 티 전혀 없이 원래 예쁜 것처럼 윤곽과 피부결만 살짝 정리',
      gradient: 'linear-gradient(135deg, #f77062, #fe5196)',
      params: {
        faceSlim: 22, vLine: 26, cheekSlim: 20, midfaceShorten: 18,
        eyeSize: 18, noseSlim: 18, smileLift: 16, neckLengthen: 22,
        skinSmooth: 42, skinBrighten: 20, darkCircle: 50, nasolabialFold: 40,
        eyeBrighten: 35, lipTint: 25, hairVolume: 25,
        temperature: 8, tint: 8, exposure: 8, shadows: 18, vibrance: 16
      }
    },
    {
      id: 'allinone-wedding-snap',
      name: '본식·웨딩스냅 마스터',
      category: 'liquify',
      badge: '승모근+팔뚝+물광',
      desc: '드레스 라인에 중요한 승모근·팔뚝·목선 정리와 화사한 피부 광채',
      gradient: 'linear-gradient(135deg, #fbc2eb, #a6c1ee)',
      params: {
        faceSlim: 32, vLine: 36, cheekSlim: 28, eyeSize: 22, smileLift: 25,
        neckLengthen: 55, shoulderWidth: 25, armSlim: 52, waistSlim: 38,
        skinSmooth: 58, skinBrighten: 36, darkCircle: 65, nasolabialFold: 50,
        neckWrinkle: 65, doubleChin: 55, teethWhiten: 55, lipTint: 35, hairVolume: 38,
        exposure: 12, highlights: -26, shadows: 24, halation: 28
      }
    },
    {
      id: 'allinone-men-dandy',
      name: '남성 댄디 턱선 + 피부 정돈',
      category: 'liquify',
      badge: '남성 전용',
      desc: '과하지 않은 날렵한 턱선, 넓은 어깨, 유분기·다크서클 제거 패키지',
      gradient: 'linear-gradient(135deg, #2b5876, #4e4376)',
      params: {
        faceSlim: 20, faceSymmetry: 40, vLine: 34, doubleChin: 55,
        neckLengthen: 28, shoulderWidth: 38, clothesDewrinkle: 65,
        skinSmooth: 34, shineRemove: 65, skinRednessRemove: 40,
        faceContour: 45, darkCircle: 60, nasolabialFold: 40, eyeBrighten: 40,
        hairVolume: 28, hairlineFill: 40, contrast: 14, clarity: 16
      }
    }
  ];

  // =========================================================================
  // 3. 내장 고해상도 샘플 이미지 3종 생성기 (즉시 테스트용)
  // =========================================================================
  function createSamplePortraitCanvas(type) {
    const w = 720;
    const h = 900;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');

    if (type === 'hazy') {
      // 샘플 2: 뿌연 역광·안개 야외 인물 (디헤이즈 & 청량감 테스트용)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#c8d9eb');
      skyGrad.addColorStop(0.5, '#dce6f0');
      skyGrad.addColorStop(1, '#a9c2b5');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // 먼 산과 나무 배경
      ctx.fillStyle = '#8fa99e';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.62);
      ctx.quadraticCurveTo(w * 0.28, h * 0.48, w * 0.55, h * 0.6);
      ctx.quadraticCurveTo(w * 0.8, h * 0.5, w, h * 0.58);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // 나뭇잎 보케
      for (let i = 0; i < 28; i++) {
        ctx.fillStyle = i % 2 === 0 ? 'rgba(98, 155, 115, 0.35)' : 'rgba(130, 185, 220, 0.3)';
        ctx.beginPath();
        ctx.arc((i * 97) % w, ((i * 67) % (h * 0.55)), 24 + (i % 4) * 12, 0, Math.PI * 2);
        ctx.fill();
      }

      drawPersonFigure(ctx, w, h, {
        headY: 0.34,
        headRx: 105,
        headRy: 132,
        skinBase: '#eac5b0',
        hairColor: '#2d241f',
        shirtColor: '#486b8a',
        fullBody: false
      });

      // 뿌연 안개/역광 베일 덮기 (디헤이즈를 올리면 맑아지도록!)
      const hazeGrad = ctx.createRadialGradient(w * 0.5, h * 0.25, 40, w * 0.5, h * 0.45, w * 0.85);
      hazeGrad.addColorStop(0, 'rgba(245, 248, 255, 0.46)');
      hazeGrad.addColorStop(1, 'rgba(225, 232, 240, 0.28)');
      ctx.fillStyle = hazeGrad;
      ctx.fillRect(0, 0, w, h);
    } else if (type === 'fullbody') {
      // 샘플 3: 전신 비율 보정 샘플
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#d8d3c8');
      bgGrad.addColorStop(0.68, '#cbc4b8');
      bgGrad.addColorStop(0.69, '#b5ada0');
      bgGrad.addColorStop(1, '#9e9587');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      drawPersonFigure(ctx, w, h, {
        headY: 0.19,
        headRx: 52,
        headRy: 66,
        skinBase: '#f0c8b4',
        hairColor: '#231c18',
        shirtColor: '#f7f5f0',
        pantsColor: '#2b394a',
        fullBody: true
      });
    } else {
      // 샘플 1: 스튜디오 클로즈업 인물 (피부·다크서클·팔자·치아·리퀴파이 테스트용)
      const studioGrad = ctx.createRadialGradient(w * 0.5, h * 0.38, 60, w * 0.5, h * 0.5, w * 0.85);
      studioGrad.addColorStop(0, '#dcd7ce');
      studioGrad.addColorStop(0.65, '#c4bdb2');
      studioGrad.addColorStop(1, '#9d9589');
      ctx.fillStyle = studioGrad;
      ctx.fillRect(0, 0, w, h);

      // 배경지 미세 얼룩 (호리존 배경 정리 테스트용)
      ctx.fillStyle = 'rgba(90, 82, 72, 0.08)';
      ctx.beginPath();
      ctx.arc(w * 0.16, h * 0.2, 55, 0, Math.PI * 2);
      ctx.arc(w * 0.85, h * 0.26, 65, 0, Math.PI * 2);
      ctx.fill();

      drawPersonFigure(ctx, w, h, {
        headY: 0.36,
        headRx: 118,
        headRy: 148,
        skinBase: '#f1c7b1',
        hairColor: '#221a16',
        shirtColor: '#f4f1ea',
        fullBody: false
      });
    }

    return c;
  }

  function drawPersonFigure(ctx, w, h, opts) {
    const cx = w * 0.5;
    const cy = h * opts.headY;
    const rx = opts.headRx;
    const ry = opts.headRy;

    ctx.save();

    // 뒷머리 볼륨
    ctx.fillStyle = opts.hairColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy - ry * 0.06, rx * 1.24, ry * 1.22, 0, 0, Math.PI * 2);
    ctx.fill();

    if (opts.fullBody) {
      // 전신 목·어깨·상체·허리·골반·다리
      ctx.fillStyle = opts.skinBase;
      ctx.fillRect(cx - rx * 0.38, cy + ry * 0.78, rx * 0.76, ry * 0.65);

      // 상의 (화이트 셔츠)
      ctx.fillStyle = opts.shirtColor;
      ctx.beginPath();
      ctx.moveTo(cx - rx * 1.85, cy + ry * 1.32);
      ctx.quadraticCurveTo(cx, cy + ry * 1.15, cx + rx * 1.85, cy + ry * 1.32);
      ctx.lineTo(cx + rx * 1.35, cy + ry * 3.85);
      ctx.lineTo(cx - rx * 1.35, cy + ry * 3.85);
      ctx.closePath();
      ctx.fill();

      // 팔
      ctx.fillStyle = opts.skinBase;
      ctx.beginPath();
      ctx.roundRect(cx - rx * 2.15, cy + ry * 1.38, rx * 0.48, ry * 3.1, 20);
      ctx.roundRect(cx + rx * 1.67, cy + ry * 1.38, rx * 0.48, ry * 3.1, 20);
      ctx.fill();

      // 하의 (슬랙스/데님 다리)
      ctx.fillStyle = opts.pantsColor || '#2b394a';
      ctx.beginPath();
      ctx.moveTo(cx - rx * 1.35, cy + ry * 3.8);
      ctx.lineTo(cx + rx * 1.35, cy + ry * 3.8);
      ctx.lineTo(cx + rx * 1.55, cy + ry * 5.2);
      ctx.lineTo(cx + rx * 1.05, h * 0.93);
      ctx.lineTo(cx + rx * 0.18, h * 0.93);
      ctx.lineTo(cx, cy + ry * 5.4);
      ctx.lineTo(cx - rx * 0.18, h * 0.93);
      ctx.lineTo(cx - rx * 1.05, h * 0.93);
      ctx.lineTo(cx - rx * 1.55, cy + ry * 5.2);
      ctx.closePath();
      ctx.fill();
    } else {
      // 상반신 승모근 & 목 & 셔츠/자켓
      ctx.fillStyle = '#dfb29b';
      ctx.beginPath();
      ctx.moveTo(cx - rx * 0.46, cy + ry * 0.72);
      ctx.lineTo(cx + rx * 0.46, cy + ry * 0.72);
      ctx.lineTo(cx + rx * 1.25, cy + ry * 1.48);
      ctx.lineTo(cx - rx * 1.25, cy + ry * 1.48);
      ctx.closePath();
      ctx.fill();

      // 목주름 샘플 선 (목주름 완화 확인용)
      ctx.strokeStyle = 'rgba(145, 95, 76, 0.35)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy + ry * 0.98, rx * 0.38, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();

      // 셔츠/자켓 어깨
      ctx.fillStyle = opts.shirtColor;
      ctx.beginPath();
      ctx.moveTo(cx - rx * 2.25, h);
      ctx.quadraticCurveTo(cx - rx * 2.0, cy + ry * 1.35, cx - rx * 0.62, cy + ry * 1.28);
      ctx.lineTo(cx, cy + ry * 1.85);
      ctx.lineTo(cx + rx * 0.62, cy + ry * 1.28);
      ctx.quadraticCurveTo(cx + rx * 2.0, cy + ry * 1.35, cx + rx * 2.25, h);
      ctx.closePath();
      ctx.fill();

      // 의상 주름 샘플 선 (옷 주름 다림질 확인용)
      ctx.strokeStyle = 'rgba(120, 125, 138, 0.32)';
      ctx.lineWidth = 4;
      for (let i = -2; i <= 2; i++) {
        if (i === 0) continue;
        ctx.beginPath();
        ctx.moveTo(cx + i * rx * 0.42, cy + ry * 1.65);
        ctx.quadraticCurveTo(cx + i * rx * 0.55, cy + ry * 2.1, cx + i * rx * 0.35, cy + ry * 2.55);
        ctx.stroke();
      }
    }

    // 이중턱 그림자
    ctx.fillStyle = 'rgba(130, 82, 65, 0.38)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + ry * 0.95, rx * 0.52, ry * 0.16, 0, 0, Math.PI);
    ctx.fill();

    // 얼굴 윤곽 (타원+턱선)
    const faceGrad = ctx.createRadialGradient(cx - rx * 0.12, cy - ry * 0.15, rx * 0.15, cx, cy, ry * 1.15);
    faceGrad.addColorStop(0, '#f8d7c4');
    faceGrad.addColorStop(0.65, opts.skinBase);
    faceGrad.addColorStop(1, '#d9a48c');
    ctx.fillStyle = faceGrad;
    ctx.beginPath();
    ctx.moveTo(cx, cy - ry);
    ctx.bezierCurveTo(cx + rx * 1.06, cy - ry, cx + rx * 1.05, cy + ry * 0.18, cx + rx * 0.78, cy + ry * 0.62);
    ctx.bezierCurveTo(cx + rx * 0.48, cy + ry * 0.96, cx + rx * 0.18, cy + ry * 1.02, cx, cy + ry * 1.02);
    ctx.bezierCurveTo(cx - rx * 0.18, cy + ry * 1.02, cx - rx * 0.48, cy + ry * 0.96, cx - rx * 0.78, cy + ry * 0.62);
    ctx.bezierCurveTo(cx - rx * 1.05, cy + ry * 0.18, cx - rx * 1.06, cy - ry, cx, cy - ry);
    ctx.closePath();
    ctx.fill();

    // T존/이마 유분기 하이라이트 (번들거림 제거 테스트용)
    ctx.fillStyle = 'rgba(255, 250, 245, 0.38)';
    ctx.beginPath();
    ctx.ellipse(cx, cy - ry * 0.42, rx * 0.36, ry * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();

    // 볼 홍조 및 미세 잡티 (피부결·홍조 테스트용)
    ctx.fillStyle = 'rgba(225, 110, 105, 0.22)';
    ctx.beginPath();
    ctx.arc(cx - rx * 0.48, cy + ry * 0.16, rx * 0.24, 0, Math.PI * 2);
    ctx.arc(cx + rx * 0.48, cy + ry * 0.16, rx * 0.24, 0, Math.PI * 2);
    ctx.fill();

    // 다크서클 그늘 (다크서클 지우개 테스트용)
    ctx.fillStyle = 'rgba(115, 78, 72, 0.32)';
    ctx.beginPath();
    ctx.ellipse(cx - rx * 0.36, cy - ry * 0.02, rx * 0.22, ry * 0.075, 0.08, 0, Math.PI);
    ctx.ellipse(cx + rx * 0.36, cy - ry * 0.02, rx * 0.22, ry * 0.075, -0.08, 0, Math.PI);
    ctx.fill();

    // 팔자주름 그늘 (팔자주름 완화 테스트용)
    ctx.strokeStyle = 'rgba(145, 88, 72, 0.38)';
    ctx.lineWidth = Math.max(2, rx * 0.032);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - rx * 0.2, cy + ry * 0.26);
    ctx.quadraticCurveTo(cx - rx * 0.34, cy + ry * 0.42, cx - rx * 0.36, cy + ry * 0.56);
    ctx.moveTo(cx + rx * 0.2, cy + ry * 0.26);
    ctx.quadraticCurveTo(cx + rx * 0.34, cy + ry * 0.42, cx + rx * 0.36, cy + ry * 0.56);
    ctx.stroke();

    // 눈썹
    ctx.strokeStyle = opts.hairColor;
    ctx.lineWidth = Math.max(3, rx * 0.065);
    ctx.beginPath();
    ctx.moveTo(cx - rx * 0.58, cy - ry * 0.22);
    ctx.quadraticCurveTo(cx - rx * 0.36, cy - ry * 0.3, cx - rx * 0.16, cy - ry * 0.23);
    ctx.moveTo(cx + rx * 0.16, cy - ry * 0.23);
    ctx.quadraticCurveTo(cx + rx * 0.36, cy - ry * 0.3, cx + rx * 0.58, cy - ry * 0.22);
    ctx.stroke();

    // 왼쪽·오른쪽 눈 (흰자 + 홍채 + 동공 + 캐치라이트)
    [-1, 1].forEach((dir) => {
      const ex = cx + dir * rx * 0.36;
      const ey = cy - ry * 0.09;
      ctx.fillStyle = '#f3eee8';
      ctx.beginPath();
      ctx.ellipse(ex, ey, rx * 0.19, ry * 0.085, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#3b2820';
      ctx.beginPath();
      ctx.arc(ex, ey, rx * 0.095, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#140e0c';
      ctx.beginPath();
      ctx.arc(ex, ey, rx * 0.048, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ex - rx * 0.03, ey - ry * 0.025, rx * 0.024, 0, Math.PI * 2);
      ctx.fill();
    });

    // 코 & 콧망울
    ctx.strokeStyle = 'rgba(165, 108, 88, 0.55)';
    ctx.lineWidth = Math.max(2, rx * 0.028);
    ctx.beginPath();
    ctx.moveTo(cx - rx * 0.05, cy - ry * 0.06);
    ctx.lineTo(cx - rx * 0.06, cy + ry * 0.22);
    ctx.arc(cx, cy + ry * 0.23, rx * 0.13, Math.PI * 0.85, Math.PI * 0.15, true);
    ctx.stroke();

    // 입술 & 살짝 보이는 치아 (치아 미백 & 입술 혈색 테스트용)
    const mouthY = cy + ry * 0.52;
    ctx.fillStyle = '#d4746a';
    ctx.beginPath();
    ctx.ellipse(cx, mouthY, rx * 0.28, ry * 0.105, 0, 0, Math.PI * 2);
    ctx.fill();

    // 치아 영역 (약간 아이보리 톤 -> 치아 미백 시 순백색으로 변화)
    ctx.fillStyle = '#ece1cc';
    ctx.beginPath();
    ctx.ellipse(cx, mouthY + ry * 0.005, rx * 0.19, ry * 0.038, 0, 0, Math.PI * 2);
    ctx.fill();

    // 앞머리/헤어라인
    ctx.fillStyle = opts.hairColor;
    ctx.beginPath();
    ctx.moveTo(cx - rx * 1.05, cy - ry * 0.18);
    ctx.quadraticCurveTo(cx - rx * 0.85, cy - ry * 1.08, cx, cy - ry * 1.06);
    ctx.quadraticCurveTo(cx + rx * 0.85, cy - ry * 1.08, cx + rx * 1.05, cy - ry * 0.18);
    ctx.quadraticCurveTo(cx + rx * 0.52, cy - ry * 0.68, cx, cy - ry * 0.56);
    ctx.quadraticCurveTo(cx - rx * 0.52, cy - ry * 0.68, cx - rx * 1.05, cy - ry * 0.18);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // =========================================================================
  // 4. 애플리케이션 상태 관리 (다중 사진 필름스트립 + 보정 수치 복붙)
  // =========================================================================
  const GRID_W = 96;
  const GRID_H = 120;

  function createEmptyGrid() {
    return {
      dx: new Float32Array(GRID_W * GRID_H),
      dy: new Float32Array(GRID_W * GRID_H),
      freeze: new Float32Array(GRID_W * GRID_H)
    };
  }

  function createPhotoSlot(id, title, badge, sourceCanvas, defaultFaceGuide) {
    const grid = createEmptyGrid();
    return {
      id,
      title,
      badge,
      sourceCanvas,
      thumbDataUrl: createThumbnailDataUrl(sourceCanvas),
      params: createDefaultParams(),
      activePresetId: null,
      presetIntensity: 100,
      faceGuide: defaultFaceGuide || { cx: 0.5, cy: 0.36, rx: 0.17, ry: 0.17 },
      manualDx: grid.dx,
      manualDy: grid.dy,
      freezeMask: grid.freeze,
      spotHeals: [],
      undoStack: [],
      redoStack: []
    };
  }

  function createThumbnailDataUrl(srcCanvas) {
    const tc = document.createElement('canvas');
    tc.width = 72;
    tc.height = 80;
    const tctx = tc.getContext('2d');
    tctx.drawImage(srcCanvas, 0, 0, tc.width, tc.height);
    return tc.toDataURL('image/jpeg', 0.75);
  }

  const state = {
    photos: [],
    activePhotoIndex: 0,
    activeTab: 'beauty',
    activePresetCategory: 'all',
    customPresets: [],
    clipboardSettings: null,
    copyCategories: {
      beauty: true,
      liquify: true,
      color: true,
      effects: true
    },
    brushMode: 'push',
    brushRadius: 65,
    brushStrength: 55,
    showMeshGrid: false,
    showFaceGuide: false,
    panMode: false,
    splitCompare: false,
    splitRatio: 0.5,
    holdOriginal: false,
    zoom: 1,
    panX: 0,
    panY: 0,
    renderScheduled: false
  };

  function getActivePhoto() {
    return state.photos[state.activePhotoIndex] || state.photos[0];
  }

  // =========================================================================
  // 5. Undo / Redo 히스토리 스냅샷
  // =========================================================================
  function pushUndoSnapshot(photo) {
    const target = photo || getActivePhoto();
    if (!target) return;

    const snap = {
      params: JSON.parse(JSON.stringify(target.params)),
      activePresetId: target.activePresetId,
      presetIntensity: target.presetIntensity,
      faceGuide: { ...target.faceGuide },
      manualDx: new Float32Array(target.manualDx),
      manualDy: new Float32Array(target.manualDy),
      freezeMask: new Float32Array(target.freezeMask),
      spotHeals: JSON.parse(JSON.stringify(target.spotHeals))
    };

    target.undoStack.push(snap);
    if (target.undoStack.length > 25) {
      target.undoStack.shift();
    }
    target.redoStack.length = 0;
    updateUndoRedoButtons();
  }

  function restoreSnapshot(photo, snap) {
    photo.params = JSON.parse(JSON.stringify(snap.params));
    photo.activePresetId = snap.activePresetId;
    photo.presetIntensity = snap.presetIntensity;
    photo.faceGuide = { ...snap.faceGuide };
    photo.manualDx = new Float32Array(snap.manualDx);
    photo.manualDy = new Float32Array(snap.manualDy);
    photo.freezeMask = new Float32Array(snap.freezeMask);
    photo.spotHeals = JSON.parse(JSON.stringify(snap.spotHeals));
  }

  function undoAction() {
    const photo = getActivePhoto();
    if (!photo || photo.undoStack.length === 0) return;
    const currentSnap = {
      params: JSON.parse(JSON.stringify(photo.params)),
      activePresetId: photo.activePresetId,
      presetIntensity: photo.presetIntensity,
      faceGuide: { ...photo.faceGuide },
      manualDx: new Float32Array(photo.manualDx),
      manualDy: new Float32Array(photo.manualDy),
      freezeMask: new Float32Array(photo.freezeMask),
      spotHeals: JSON.parse(JSON.stringify(photo.spotHeals))
    };
    photo.redoStack.push(currentSnap);
    const prev = photo.undoStack.pop();
    restoreSnapshot(photo, prev);
    syncUIFromActivePhoto();
    scheduleRender();
    showToast('이전 단계로 되돌렸습니다.');
  }

  function redoAction() {
    const photo = getActivePhoto();
    if (!photo || photo.redoStack.length === 0) return;
    const currentSnap = {
      params: JSON.parse(JSON.stringify(photo.params)),
      activePresetId: photo.activePresetId,
      presetIntensity: photo.presetIntensity,
      faceGuide: { ...photo.faceGuide },
      manualDx: new Float32Array(photo.manualDx),
      manualDy: new Float32Array(photo.manualDy),
      freezeMask: new Float32Array(photo.freezeMask),
      spotHeals: JSON.parse(JSON.stringify(photo.spotHeals))
    };
    photo.undoStack.push(currentSnap);
    const next = photo.redoStack.pop();
    restoreSnapshot(photo, next);
    syncUIFromActivePhoto();
    scheduleRender();
    showToast('다시 실행했습니다.');
  }

  function updateUndoRedoButtons() {
    const photo = getActivePhoto();
    const btnUndo = document.getElementById('btn-undo');
    const btnRedo = document.getElementById('btn-redo');
    if (btnUndo) btnUndo.disabled = !photo || photo.undoStack.length === 0;
    if (btnRedo) btnRedo.disabled = !photo || photo.redoStack.length === 0;
  }

  // =========================================================================
  // 6. 이보토 핵심: 보정 수치 복사 / 붙여넣기 / 텍스트 코드 공유 / 전체 동기화
  // =========================================================================
  function readCopyCategoryCheckboxes() {
    const b = document.getElementById('chk-copy-beauty');
    const l = document.getElementById('chk-copy-liquify');
    const c = document.getElementById('chk-copy-color');
    const e = document.getElementById('chk-copy-effects');
    state.copyCategories = {
      beauty: b ? b.checked : true,
      liquify: l ? l.checked : true,
      color: c ? c.checked : true,
      effects: e ? e.checked : true
    };
  }

  function buildCopyPayload(photo) {
    readCopyCategoryCheckboxes();
    const payload = {
      version: 'EVOTOLITE_V1',
      timestamp: new Date().toISOString(),
      sourceTitle: photo.title,
      categories: { ...state.copyCategories },
      params: {}
    };

    Object.keys(PARAM_GROUPS).forEach((groupName) => {
      if (state.copyCategories[groupName]) {
        PARAM_GROUPS[groupName].forEach((key) => {
          payload.params[key] = photo.params[key];
        });
      }
    });

    return payload;
  }

  function encodeSettingsCode(payload) {
    return 'EVOTOLITE1:' + JSON.stringify(payload);
  }

  function decodeSettingsCode(rawText) {
    if (!rawText || typeof rawText !== 'string') return null;
    const trimmed = rawText.trim();
    const jsonPart = trimmed.startsWith('EVOTOLITE1:') ? trimmed.slice('EVOTOLITE1:'.length) : trimmed;
    const parsed = JSON.parse(jsonPart);
    if (!parsed || typeof parsed !== 'object' || !parsed.params) {
      throw new Error('유효한 EvotoLite 보정 수치 코드가 아닙니다.');
    }
    return parsed;
  }

  function copySettingsFromActivePhoto() {
    const photo = getActivePhoto();
    if (!photo) return null;
    const payload = buildCopyPayload(photo);
    state.clipboardSettings = payload;

    const codeStr = encodeSettingsCode(payload);
    try {
      localStorage.setItem('evoto_lite_clipboard', codeStr);
    } catch (_) {}

    const codeArea = document.getElementById('settings-code-textarea');
    if (codeArea) {
      codeArea.value = codeStr;
    }

    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(codeStr).catch(() => {});
    }

    const btnPaste = document.getElementById('btn-paste-settings');
    if (btnPaste) btnPaste.disabled = false;

    const btnCopy = document.getElementById('btn-copy-settings');
    if (btnCopy) {
      btnCopy.classList.add('copied-pulse');
      setTimeout(() => btnCopy.classList.remove('copied-pulse'), 900);
    }

    showToast(`'${photo.title}'의 인물·리퀴파이·색감 보정 수치를 복사했습니다! 다른 사진에서 [붙여넣기]를 누르세요.`);
    return payload;
  }

  function applyPayloadToPhoto(photo, payload) {
    if (!photo || !payload || !payload.params) return false;
    pushUndoSnapshot(photo);
    Object.keys(payload.params).forEach((key) => {
      if (key in photo.params) {
        photo.params[key] = payload.params[key];
      }
    });
    return true;
  }

  function pasteSettingsToActivePhoto() {
    const photo = getActivePhoto();
    if (!photo) return false;

    let payload = state.clipboardSettings;
    if (!payload) {
      try {
        const stored = localStorage.getItem('evoto_lite_clipboard');
        if (stored) payload = decodeSettingsCode(stored);
      } catch (_) {}
    }

    if (!payload) {
      showToast('먼저 [수치 복사] 버튼을 눌러 보정 수치를 복사해 주세요.');
      return false;
    }

    applyPayloadToPhoto(photo, payload);
    syncUIFromActivePhoto();
    renderFilmstrip();
    scheduleRender();
    showToast(`복사해 둔 보정 수치를 '${photo.title}' 사진에 그대로 붙여넣었습니다!`);
    return true;
  }

  function syncSettingsToAllPhotos() {
    const sourcePhoto = getActivePhoto();
    if (!sourcePhoto) return 0;
    const payload = copySettingsFromActivePhoto();
    let count = 0;

    state.photos.forEach((p, idx) => {
      if (idx !== state.activePhotoIndex) {
        applyPayloadToPhoto(p, payload);
        count++;
      }
    });

    renderFilmstrip();
    scheduleRender();
    showToast(`현재 사진의 보정 수치를 나머지 ${count}장의 사진 모두에 일괄 동기화했습니다!`);
    return count;
  }

  // =========================================================================
  // 7. 리퀴파이 변위 필드 엔진 (슬라이더 성형 + 터치 브러시 + 고정 마스크 통합)
  // =========================================================================
  function evaluateCombinedDisplacement(photo, normX, normY) {
    const p = photo.params;
    const fg = photo.faceGuide;
    const fcx = fg.cx;
    const fcy = fg.cy;
    const frx = Math.max(0.06, fg.rx);
    const fry = Math.max(0.06, fg.ry);

    // normX, normY에서 원본 이미지를 샘플링할 역변위 (srcX = normX + offsetX, srcY = normY + offsetY)
    let ox = 0;
    let oy = 0;

    // 1) 수동 터치 리퀴파이 그리드 보간
    const gx = normX * (GRID_W - 1);
    const gy = normY * (GRID_H - 1);
    const ix = Math.max(0, Math.min(GRID_W - 2, Math.floor(gx)));
    const iy = Math.max(0, Math.min(GRID_H - 2, Math.floor(gy)));
    const fx = gx - ix;
    const fy = gy - iy;

    const i00 = iy * GRID_W + ix;
    const i10 = i00 + 1;
    const i01 = i00 + GRID_W;
    const i11 = i01 + 1;

    const mdx =
      (1 - fx) * (1 - fy) * photo.manualDx[i00] +
      fx * (1 - fy) * photo.manualDx[i10] +
      (1 - fx) * fy * photo.manualDx[i01] +
      fx * fy * photo.manualDx[i11];
    const mdy =
      (1 - fx) * (1 - fy) * photo.manualDy[i00] +
      fx * (1 - fy) * photo.manualDy[i10] +
      (1 - fx) * fy * photo.manualDy[i01] +
      fx * fy * photo.manualDy[i11];
    const freezeVal =
      (1 - fx) * (1 - fy) * photo.freezeMask[i00] +
      fx * (1 - fy) * photo.freezeMask[i10] +
      (1 - fx) * fy * photo.freezeMask[i01] +
      fx * fy * photo.freezeMask[i11];

    const protectFactor = Math.max(0, 1 - freezeVal);
    ox += mdx * protectFactor;
    oy += mdy * protectFactor;

    // 얼굴 기준 상대 좌표 (dx, dy normalized by face radius)
    const relX = (normX - fcx) / frx;
    const relY = (normY - fcy) / fry;
    const distSq = relX * relX + relY * relY;

    // 2) 얼굴 작게 (소두 효과 - Face Slim)
    if (p.faceSlim !== 0 && distSq < 2.6) {
      const r = Math.sqrt(distSq);
      const falloff = Math.pow(Math.max(0, 1 - r / 1.6), 2);
      const strength = (p.faceSlim / 100) * 0.14 * falloff * protectFactor;
      ox += (normX - fcx) * strength;
      oy += (normY - fcy) * strength * 0.85;
    }

    // 3) 얼굴 좌우 비대칭 보정 (Face Symmetry)
    if (p.faceSymmetry !== 0 && distSq < 2.0) {
      const falloff = Math.pow(Math.max(0, 1 - Math.sqrt(distSq) / 1.4), 2);
      const sym = (p.faceSymmetry / 100) * 0.032 * falloff * protectFactor;
      if (relY > -0.2 && relY < 1.05) {
        ox += sym * (1 - Math.abs(relX) * 0.4);
        oy += sym * relX * 0.35;
      }
    }

    // 4) 턱선 V라인 (V-Line Jaw Sculpt)
    if (p.vLine !== 0) {
      const jawY = fcy + fry * 0.56;
      const dyJaw = (normY - jawY) / (fry * 0.65);
      const dxJaw = (normX - fcx) / (frx * 1.15);
      const rJawSq = dxJaw * dxJaw + dyJaw * dyJaw;
      if (rJawSq < 1.4) {
        const w = Math.pow(1 - rJawSq / 1.4, 2) * protectFactor;
        const vStr = (p.vLine / 100) * 0.16 * w;
        // 양쪽 턱을 중심 쪽으로 모아주고 턱끝을 살짝 위로 당김
        ox += (normX - fcx) * vStr;
        if (normY > jawY) {
          oy += (normY - jawY) * vStr * 0.45;
        }
      }
    }

    // 5) 볼살 · 광대 정리 (Cheek Slim)
    if (p.cheekSlim !== 0) {
      const cheekY = fcy + fry * 0.18;
      const dyC = (normY - cheekY) / (fry * 0.52);
      const dxC = (normX - fcx) / (frx * 1.18);
      const rCSq = dxC * dxC + dyC * dyC;
      if (rCSq < 1.3) {
        const w = Math.pow(1 - rCSq / 1.3, 2) * protectFactor;
        ox += (normX - fcx) * (p.cheekSlim / 100) * 0.13 * w;
      }
    }

    // 6) 중안부 축소 (Mid-face Shorten: 코~윗입술 간격 축소)
    if (p.midfaceShorten !== 0) {
      const midY = fcy + fry * 0.25;
      const dyM = (normY - midY) / (fry * 0.65);
      const dxM = (normX - fcx) / (frx * 0.95);
      const rMSq = dxM * dxM + dyM * dyM;
      if (rMSq < 1.0) {
        const w = Math.pow(1 - rMSq, 2) * protectFactor;
        oy -= (p.midfaceShorten / 100) * fry * 0.14 * w;
      }
    }

    // 7) 이마 볼륨·길이 (Forehead Height) & 정수리 뿌리 볼륨 (Hair Volume)
    const topHeadEffect = (p.foreheadHeight * 0.6 + p.hairVolume * 0.9);
    if (topHeadEffect !== 0) {
      const topY = fcy - fry * 0.92;
      const dyT = (normY - topY) / (fry * 0.72);
      const dxT = (normX - fcx) / (frx * 1.25);
      const rTSq = dxT * dxT + dyT * dyT;
      if (rTSq < 1.2) {
        const w = Math.pow(1 - rTSq / 1.2, 2) * protectFactor;
        oy += (topHeadEffect / 100) * fry * 0.18 * w;
      }
    }

    // 8) 턱끝 길이 조절 (Chin Length)
    if (p.chinLength !== 0) {
      const chinY = fcy + fry * 0.95;
      const dyCh = (normY - chinY) / (fry * 0.48);
      const dxCh = (normX - fcx) / (frx * 0.75);
      const rChSq = dxCh * dxCh + dyCh * dyCh;
      if (rChSq < 1.0) {
        const w = Math.pow(1 - rChSq, 2) * protectFactor;
        oy -= (p.chinLength / 100) * fry * 0.14 * w;
      }
    }

    // 9) 눈 크기 / 가로 트임 / 미간 거리 / 눈꼬리 각도
    if (p.eyeSize !== 0 || p.eyeWidth !== 0 || p.eyeDistance !== 0 || p.eyeTilt !== 0) {
      const eyeY = fcy - fry * 0.12;
      const eyeOffsetX = frx * 0.35;
      const eyeRadX = frx * 0.32;
      const eyeRadY = fry * 0.26;

      [-1, 1].forEach((dir) => {
        const ecx = fcx + dir * eyeOffsetX;
        const edx = (normX - ecx) / eyeRadX;
        const edy = (normY - eyeY) / eyeRadY;
        const erSq = edx * edx + edy * edy;
        if (erSq < 1.0) {
          const w = Math.pow(1 - erSq, 2) * protectFactor;
          // 눈 확대
          if (p.eyeSize !== 0) {
            const es = (p.eyeSize / 100) * 0.26 * w;
            ox -= (normX - ecx) * es;
            oy -= (normY - eyeY) * es;
          }
          // 눈 가로 트임
          if (p.eyeWidth !== 0) {
            ox -= (normX - ecx) * (p.eyeWidth / 100) * 0.22 * w;
          }
          // 미간 거리
          if (p.eyeDistance !== 0) {
            ox -= dir * (p.eyeDistance / 100) * frx * 0.08 * w;
          }
          // 눈꼬리 각도 (바깥쪽 끝 위아래)
          if (p.eyeTilt !== 0 && dir * edx > 0) {
            oy += Math.abs(edx) * (p.eyeTilt / 100) * fry * 0.11 * w;
          }
        }
      });
    }

    // 10) 코 날렵하게 (콧볼 축소 - Nose Slim)
    if (p.noseSlim !== 0) {
      const noseY = fcy + fry * 0.16;
      const ndx = (normX - fcx) / (frx * 0.34);
      const ndy = (normY - noseY) / (fry * 0.32);
      const nrSq = ndx * ndx + ndy * ndy;
      if (nrSq < 1.0) {
        const w = Math.pow(1 - nrSq, 2) * protectFactor;
        ox += (normX - fcx) * (p.noseSlim / 100) * 0.28 * w;
      }
    }

    // 11) 입술 도톰하게 (Lip Plump) & 입꼬리 스마일 (Smile Lift)
    if (p.lipPlump !== 0 || p.smileLift !== 0) {
      const mouthY = fcy + fry * 0.50;
      const mdxLip = (normX - fcx) / (frx * 0.42);
      const mdyLip = (normY - mouthY) / (fry * 0.26);
      const mrSq = mdxLip * mdxLip + mdyLip * mdyLip;
      if (mrSq < 1.0) {
        const w = Math.pow(1 - mrSq, 2) * protectFactor;
        if (p.lipPlump !== 0) {
          const lp = (p.lipPlump / 100) * 0.25 * w;
          ox -= (normX - fcx) * lp * 0.7;
          oy -= (normY - mouthY) * lp * 1.15;
        }
        if (p.smileLift !== 0) {
          const edgeFactor = Math.min(1, Math.abs(mdxLip) * 1.3);
          oy += (p.smileLift / 100) * fry * 0.14 * w * edgeFactor;
        }
      }
    }

    // 12) 승모근 정리 · 목 길게 (Neck Lengthen / Trapezius)
    if (p.neckLengthen !== 0) {
      const neckY = fcy + fry * 1.25;
      const dyN = (normY - neckY) / (fry * 0.65);
      const dxN = (normX - fcx) / (frx * 1.85);
      const nrSq = dxN * dxN + dyN * dyN;
      if (nrSq < 1.0 && Math.abs(dxN) > 0.22) {
        const w = Math.pow(1 - nrSq, 2) * protectFactor;
        oy -= (p.neckLengthen / 100) * fry * 0.22 * w;
      }
    }

    // 13) 직각 어깨 · 어깨 너비 (Shoulder Width)
    if (p.shoulderWidth !== 0) {
      const shY = fcy + fry * 1.55;
      const dyS = (normY - shY) / (fry * 0.75);
      const dxS = (normX - fcx) / (frx * 2.5);
      const srSq = dxS * dxS + dyS * dyS;
      if (srSq < 1.0) {
        const w = Math.pow(1 - srSq, 2) * protectFactor;
        ox -= (normX - fcx) * (p.shoulderWidth / 100) * 0.12 * w;
      }
    }

    // 14) 팔뚝살 슬림 (Arm Slim) & 허리 슬림 (Waist Slim) & 골반 볼륨 (Hip Volume)
    if (p.armSlim !== 0 || p.waistSlim !== 0) {
      const waistY = Math.min(0.82, fcy + fry * 2.5);
      const dyW = (normY - waistY) / (fry * 1.35);
      const dxW = (normX - fcx) / (frx * 2.4);
      const wrSq = dxW * dxW + dyW * dyW;
      if (wrSq < 1.0) {
        const w = Math.pow(1 - wrSq, 2) * protectFactor;
        const combinedSlim = ((p.waistSlim * 0.65 + p.armSlim * 0.45) / 100) * 0.15 * w;
        ox += (normX - fcx) * combinedSlim;
      }
    }

    if (p.hipVolume !== 0) {
      const hipY = Math.min(0.88, fcy + fry * 3.6);
      const dyH = (normY - hipY) / (fry * 1.0);
      const dxH = (normX - fcx) / (frx * 2.2);
      const hrSq = dxH * dxH + dyH * dyH;
      if (hrSq < 1.0) {
        const w = Math.pow(1 - hrSq, 2) * protectFactor;
        ox -= (normX - fcx) * (p.hipVolume / 100) * 0.14 * w;
      }
    }

    // 15) 키 · 다리 길게 (Leg Lengthen - 하체 비율 연장)
    if (p.legLength > 0) {
      const hipLine = Math.min(0.65, fcy + fry * 2.2);
      if (normY > hipLine) {
        const t = (normY - hipLine) / Math.max(0.1, 1 - hipLine);
        const stretch = (p.legLength / 100) * 0.13 * Math.sin(t * Math.PI) * protectFactor;
        oy -= stretch * (1 - hipLine);
      }
    }

    return {
      sx: Math.max(0, Math.min(0.9999, normX + ox)),
      sy: Math.max(0, Math.min(0.9999, normY + oy))
    };
  }

  // =========================================================================
  // 8. 핵심 픽셀 보정 파이프라인 (피부·주름·치아·배경·색감·디헤이즈·그레인)
  // =========================================================================
  function clampByte(v) {
    return v < 0 ? 0 : v > 255 ? 255 : v | 0;
  }

  function hslToRgb(hDeg, s, l) {
    const h = ((hDeg % 360) + 360) % 360 / 360;
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue2rgb = (t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    return [hue2rgb(h + 1 / 3) * 255, hue2rgb(h) * 255, hue2rgb(h - 1 / 3) * 255];
  }

  function computeEffectiveParams(photo) {
    const base = photo.params;
    const intensity = (photo.presetIntensity !== undefined ? photo.presetIntensity : 100) / 100;
    if (intensity === 1) return base;

    const defaults = createDefaultParams();
    const out = {};
    Object.keys(base).forEach((k) => {
      if (typeof base[k] === 'number') {
        out[k] = defaults[k] + (base[k] - defaults[k]) * intensity;
      } else {
        out[k] = base[k];
      }
    });
    return out;
  }

  function renderPhotoToCanvas(photo, targetCanvas, targetWidth, targetHeight) {
    const srcCanvas = photo.sourceCanvas;
    const w = targetWidth || srcCanvas.width;
    const h = targetHeight || srcCanvas.height;

    if (targetCanvas.width !== w) targetCanvas.width = w;
    if (targetCanvas.height !== h) targetCanvas.height = h;

    const ctx = targetCanvas.getContext('2d', { willReadFrequently: true });

    // 0) 수평 회전 / 거울 반전 및 원본 픽셀 준비
    const workSrc = document.createElement('canvas');
    workSrc.width = w;
    workSrc.height = h;
    const wctx = workSrc.getContext('2d', { willReadFrequently: true });

    const p = computeEffectiveParams(photo);
    wctx.save();
    wctx.translate(w / 2, h / 2);
    if (p.flipH) {
      wctx.scale(-1, 1);
    }
    if (p.straighten !== 0) {
      const rad = (p.straighten * Math.PI) / 180;
      const zoomComp = 1 + Math.abs(p.straighten) * 0.012;
      wctx.rotate(rad);
      wctx.scale(zoomComp, zoomComp);
    }
    wctx.drawImage(srcCanvas, -w / 2, -h / 2, w, h);
    wctx.restore();

    // 잡티 콕 찍어 지우기 (Spot Heals) 적용
    if (photo.spotHeals && photo.spotHeals.length > 0) {
      photo.spotHeals.forEach((spot) => {
        const sx = spot.x * w;
        const sy = spot.y * h;
        const sr = Math.max(4, spot.r * w);
        const offsetX = sx > w * 0.5 ? -sr * 1.45 : sr * 1.45;
        wctx.save();
        wctx.beginPath();
        wctx.arc(sx, sy, sr, 0, Math.PI * 2);
        wctx.clip();
        wctx.drawImage(workSrc, sx + offsetX - sr, sy - sr, sr * 2, sr * 2, sx - sr, sy - sr, sr * 2, sr * 2);
        wctx.restore();
      });
    }

    const srcImageData = wctx.getImageData(0, 0, w, h);
    const srcPixels = srcImageData.data;

    // 1) 리퀴파이 변위 샘플링 (Bilinear Interpolation)
    const warpedData = ctx.createImageData(w, h);
    const dstPixels = warpedData.data;

    const dispSubW = 64;
    const dispSubH = 80;
    const subSx = new Float32Array(dispSubW * dispSubH);
    const subSy = new Float32Array(dispSubW * dispSubH);

    for (let gy = 0; gy < dispSubH; gy++) {
      const ny = gy / (dispSubH - 1);
      for (let gx = 0; gx < dispSubW; gx++) {
        const nx = gx / (dispSubW - 1);
        const mapped = evaluateCombinedDisplacement(photo, nx, ny);
        const idx = gy * dispSubW + gx;
        subSx[idx] = mapped.sx * (w - 1);
        subSy[idx] = mapped.sy * (h - 1);
      }
    }

    for (let y = 0; y < h; y++) {
      const gy = (y / (h - 1)) * (dispSubH - 1);
      const iy = Math.min(dispSubH - 2, gy | 0);
      const fy = gy - iy;
      const row0 = iy * dispSubW;
      const row1 = row0 + dispSubW;

      for (let x = 0; x < w; x++) {
        const gx = (x / (w - 1)) * (dispSubW - 1);
        const ix = Math.min(dispSubW - 2, gx | 0);
        const fx = gx - ix;

        const w00 = (1 - fx) * (1 - fy);
        const w10 = fx * (1 - fy);
        const w01 = (1 - fx) * fy;
        const w11 = fx * fy;

        const sampleX = w00 * subSx[row0 + ix] + w10 * subSx[row0 + ix + 1] + w01 * subSx[row1 + ix] + w11 * subSx[row1 + ix + 1];
        const sampleY = w00 * subSy[row0 + ix] + w10 * subSy[row0 + ix + 1] + w01 * subSy[row1 + ix] + w11 * subSy[row1 + ix + 1];

        const sx0 = Math.max(0, Math.min(w - 2, sampleX | 0));
        const sy0 = Math.max(0, Math.min(h - 2, sampleY | 0));
        const sfx = sampleX - sx0;
        const sfy = sampleY - sy0;

        const p00 = (sy0 * w + sx0) * 4;
        const p10 = p00 + 4;
        const p01 = p00 + w * 4;
        const p11 = p01 + 4;

        const sw00 = (1 - sfx) * (1 - sfy);
        const sw10 = sfx * (1 - sfy);
        const sw01 = (1 - sfx) * sfy;
        const sw11 = sfx * sfy;

        const outIdx = (y * w + x) * 4;
        dstPixels[outIdx] = sw00 * srcPixels[p00] + sw10 * srcPixels[p10] + sw01 * srcPixels[p01] + sw11 * srcPixels[p11];
        dstPixels[outIdx + 1] = sw00 * srcPixels[p00 + 1] + sw10 * srcPixels[p10 + 1] + sw01 * srcPixels[p01 + 1] + sw11 * srcPixels[p11 + 1];
        dstPixels[outIdx + 2] = sw00 * srcPixels[p00 + 2] + sw10 * srcPixels[p10 + 2] + sw01 * srcPixels[p01 + 2] + sw11 * srcPixels[p11 + 2];
        dstPixels[outIdx + 3] = 255;
      }
    }

    // 2) 스무딩/블러 버퍼 생성 (피부 매끈, 옷주름 제거, 배경 아웃포커싱, 클래리티, 샤프닝, 할레이션용)
    const needsBlur =
      p.skinSmooth > 0 || p.clothesDewrinkle > 0 || p.bgBlur > 0 ||
      p.clarity !== 0 || p.sharpness > 0 || p.halation > 0;

    let blurPixels = null;
    if (needsBlur) {
      const tempC = document.createElement('canvas');
      tempC.width = w;
      tempC.height = h;
      const tctx = tempC.getContext('2d');
      tctx.putImageData(warpedData, 0, 0);

      const blurC = document.createElement('canvas');
      const downW = Math.max(64, (w * 0.25) | 0);
      const downH = Math.max(64, (h * 0.25) | 0);
      blurC.width = downW;
      blurC.height = downH;
      const bctx = blurC.getContext('2d');
      bctx.drawImage(tempC, 0, 0, downW, downH);

      tctx.clearRect(0, 0, w, h);
      tctx.drawImage(blurC, 0, 0, downW, downH, 0, 0, w, h);
      blurPixels = tctx.getImageData(0, 0, w, h).data;
    }

    // 3) 픽셀 단위 인물 디테일 + 배경 + 색감 + 디헤이즈 + 필름그레인 처리
    const fg = photo.faceGuide;
    const fcx = fg.cx;
    const fcy = fg.cy;
    const frx = Math.max(0.06, fg.rx);
    const fry = Math.max(0.06, fg.ry);

    const expFactor = Math.pow(2, p.exposure / 65);
    const dehazeVal = p.dehaze / 100;
    const contrastRaw = (p.contrast + p.dehaze * 0.32) / 100;
    const contrastFactor = Math.pow((contrastRaw + 1), 2);
    const tempShift = p.temperature * 0.72;
    const tintShift = p.tint * 0.55;
    const satFactor = 1 + (p.saturation / 100) + (dehazeVal > 0 ? dehazeVal * 0.22 : dehazeVal * 0.15);
    const vibFactor = p.vibrance / 100;

    const hiRgb = p.splitHighlightAmount > 0 ? hslToRgb(p.splitHighlightHue, 0.75, 0.58) : [0, 0, 0];
    const shRgb = p.splitShadowAmount > 0 ? hslToRgb(p.splitShadowHue, 0.7, 0.42) : [0, 0, 0];
    const hiStr = (p.splitHighlightAmount / 100) * 0.38;
    const shStr = (p.splitShadowAmount / 100) * 0.42;

    const BG_TINT_COLORS = {
      white: [248, 249, 252],
      ivory: [244, 236, 222],
      coolgray: [188, 196, 208],
      skyblue: [195, 222, 246],
      charcoal: [42, 46, 54]
    };
    const bgTargetRgb = BG_TINT_COLORS[p.bgTintMode] || null;

    const grainAmt = (p.grainAmount / 100) * 48;
    const grainBlock = Math.max(1, Math.round(p.grainSize));

    for (let y = 0; y < h; y++) {
      const ny = y / h;
      for (let x = 0; x < w; x++) {
        const nx = x / w;
        const i = (y * w + x) * 4;

        let r = dstPixels[i];
        let g = dstPixels[i + 1];
        let b = dstPixels[i + 2];

        const br = blurPixels ? blurPixels[i] : r;
        const bg = blurPixels ? blurPixels[i + 1] : g;
        const bb = blurPixels ? blurPixels[i + 2] : b;

        // 얼굴/인물 영역 거리 계산
        const fdx = (nx - fcx) / frx;
        const fdy = (ny - fcy) / fry;
        const faceDistSq = fdx * fdx + fdy * fdy;

        // 인물 실루엣 영역 추정 (머리 + 몸통)
        const bodyDx = (nx - fcx) / (frx * 2.15);
        const bodyDy = (ny - (fcy + fry * 1.9)) / (fry * 2.2);
        const inSubjectMask = Math.min(1, Math.max(
          faceDistSq < 1.35 ? Math.pow(1 - faceDistSq / 1.35, 1.4) : 0,
          (bodyDx * bodyDx + bodyDy * bodyDy) < 1.15 ? Math.pow(1 - (bodyDx * bodyDx + bodyDy * bodyDy) / 1.15, 1.2) : 0
        ));
        const bgMask = 1 - inSubjectMask;

        // 피부톤 감지 (따뜻한 살색 비율)
        const isSkinPixel = r > 75 && g > 45 && b > 30 && r > g && g >= b * 0.82 && (r - b) > 14;
        const skinWeight = isSkinPixel ? Math.min(1, (r - b) / 65) : 0;

        // --- A. 이보토 배경 아웃포커싱 & 배경지 클린 & 배경색 변경 ---
        if (bgMask > 0.05) {
          if (p.bgBlur > 0 && blurPixels) {
            const bw = (p.bgBlur / 100) * bgMask * 0.88;
            r = r + (br - r) * bw;
            g = g + (bg - g) * bw;
            b = b + (bb - b) * bw;
          }
          if (p.bgClean > 0) {
            const cleanW = (p.bgClean / 100) * bgMask * 0.55;
            r = r + (br - r) * cleanW + cleanW * 18;
            g = g + (bg - g) * cleanW + cleanW * 18;
            b = b + (bb - b) * cleanW + cleanW * 18;
          }
          if (bgTargetRgb && p.bgTintStrength > 0) {
            const tw = (p.bgTintStrength / 100) * bgMask * 0.78;
            r = r * (1 - tw) + bgTargetRgb[0] * tw;
            g = g * (1 - tw) + bgTargetRgb[1] * tw;
            b = b * (1 - tw) + bgTargetRgb[2] * tw;
          }
        }

        // --- B. 주파수 분리형 피부결 매끈하게 & 의상 주름 다림질 ---
        if (p.skinSmooth > 0 && skinWeight > 0 && blurPixels) {
          const edgeDiff = (Math.abs(r - br) + Math.abs(g - bg) + Math.abs(b - bb)) / 3;
          // 눈·입술·머리카락 경계선(edgeDiff 큰 곳)은 보존하고 피부 얼룩만 매끈하게
          const edgePreserve = Math.max(0, 1 - edgeDiff / 48);
          const sw = (p.skinSmooth / 100) * skinWeight * edgePreserve * 0.78;
          r = r + (br - r) * sw;
          g = g + (bg - g) * sw;
          b = b + (bb - b) * sw;
        }

        if (p.clothesDewrinkle > 0 && ny > fcy + fry * 1.15 && inSubjectMask > 0.2 && skinWeight < 0.3 && blurPixels) {
          const edgeDiff = (Math.abs(r - br) + Math.abs(g - bg) + Math.abs(b - bb)) / 3;
          const wrinkleMask = Math.max(0, 1 - edgeDiff / 60);
          const cw = (p.clothesDewrinkle / 100) * wrinkleMask * inSubjectMask * 0.72;
          r = r + (br - r) * cw;
          g = g + (bg - g) * cw;
          b = b + (bb - b) * cw;
        }

        // --- C. 피부 백옥 톤업 / 유분기 제거 / 홍조 진정 / 3D 윤곽 ---
        if (skinWeight > 0) {
          if (p.skinBrighten > 0) {
            const sb = (p.skinBrighten / 100) * skinWeight * 24;
            r += sb * 1.05;
            g += sb * 0.98;
            b += sb * 0.95;
          }
          if (p.shineRemove > 0) {
            const lumaNow = 0.299 * r + 0.587 * g + 0.114 * b;
            if (lumaNow > 195) {
              const shineExcess = (lumaNow - 195) * (p.shineRemove / 100) * skinWeight * 0.65;
              r -= shineExcess * 0.9;
              g -= shineExcess;
              b -= shineExcess * 1.05;
            }
          }
          if (p.skinRednessRemove > 0) {
            const redExcess = Math.max(0, (r - g) - 22);
            const rr = (p.skinRednessRemove / 100) * skinWeight * redExcess * 0.45;
            r -= rr * 0.6;
            g += rr * 0.4;
          }
        }

        // 얼굴 내부 주름·다크서클·눈·치아·입술·헤어 영역별 정밀 보정
        if (faceDistSq < 2.2) {
          // 1) 다크서클 지우기 (양쪽 눈 밑 영역)
          if (p.darkCircle > 0) {
            const dcY = fcy - fry * 0.01;
            const dyl = (ny - dcY) / (fry * 0.14);
            const dxl1 = (nx - (fcx - frx * 0.35)) / (frx * 0.28);
            const dxl2 = (nx - (fcx + frx * 0.35)) / (frx * 0.28);
            const dcMask = Math.max(
              dxl1 * dxl1 + dyl * dyl < 1 ? 1 - (dxl1 * dxl1 + dyl * dyl) : 0,
              dxl2 * dxl2 + dyl * dyl < 1 ? 1 - (dxl2 * dxl2 + dyl * dyl) : 0
            );
            if (dcMask > 0) {
              const lift = (p.darkCircle / 100) * dcMask * 28;
              r += lift * 1.05;
              g += lift * 0.95;
              b += lift * 0.88;
            }
          }

          // 2) 팔자주름 완화 (코 옆~입가 영역)
          if (p.nasolabialFold > 0) {
            const nfY = fcy + fry * 0.38;
            const dyn = (ny - nfY) / (fry * 0.25);
            const dxn1 = (nx - (fcx - frx * 0.3)) / (frx * 0.22);
            const dxn2 = (nx - (fcx + frx * 0.3)) / (frx * 0.22);
            const nfMask = Math.max(
              dxn1 * dxn1 + dyn * dyn < 1 ? 1 - (dxn1 * dxn1 + dyn * dyn) : 0,
              dxn2 * dxn2 + dyn * dyn < 1 ? 1 - (dxn2 * dxn2 + dyn * dyn) : 0
            );
            if (nfMask > 0) {
              const lift = (p.nasolabialFold / 100) * nfMask * 24;
              r += lift;
              g += lift * 0.94;
              b += lift * 0.9;
            }
          }

          // 3) 목주름 & 이중턱 그늘 정리
          if (p.neckWrinkle > 0 || p.doubleChin > 0) {
            const chinBelowY = fcy + fry * 1.02;
            const dyc = (ny - chinBelowY) / (fry * 0.38);
            const dxc = (nx - fcx) / (frx * 0.65);
            if (dxc * dxc + dyc * dyc < 1) {
              const m = 1 - (dxc * dxc + dyc * dyc);
              const lift = ((p.neckWrinkle * 0.55 + p.doubleChin * 0.65) / 100) * m * 25;
              r += lift;
              g += lift * 0.95;
              b += lift * 0.92;
            }
          }

          // 4) 3D 입체 윤곽 (T존 하이라이트 & 턱 외곽 쉐딩)
          if (p.faceContour > 0 && faceDistSq < 1.1) {
            const fcStr = (p.faceContour / 100) * 18;
            const tZone = Math.max(0, 1 - Math.pow(fdx / 0.28, 2) - Math.pow((fdy + 0.1) / 0.55, 2));
            const jawEdge = faceDistSq > 0.55 ? (faceDistSq - 0.55) * 0.85 : 0;
            const delta = (tZone * 1.15 - jawEdge * 0.8) * fcStr;
            r += delta;
            g += delta;
            b += delta;
          }

          // 5) 눈동자 · 흰자 맑게 (Eye Brighten)
          if (p.eyeBrighten > 0) {
            const ey = fcy - fry * 0.10;
            const edy = (ny - ey) / (fry * 0.14);
            const edx1 = (nx - (fcx - frx * 0.36)) / (frx * 0.24);
            const edx2 = (nx - (fcx + frx * 0.36)) / (frx * 0.24);
            const eMask = Math.max(
              edx1 * edx1 + edy * edy < 1 ? 1 - (edx1 * edx1 + edy * edy) : 0,
              edx2 * edx2 + edy * edy < 1 ? 1 - (edx2 * edx2 + edy * edy) : 0
            );
            if (eMask > 0) {
              const lumaE = 0.299 * r + 0.587 * g + 0.114 * b;
              const eb = (p.eyeBrighten / 100) * eMask;
              if (lumaE > 135) {
                // 흰자 및 캐치라이트 맑게
                r += eb * 22;
                g += eb * 24;
                b += eb * 28;
              } else {
                // 눈동자 또렷하게
                r -= eb * 10;
                g -= eb * 10;
                b -= eb * 10;
              }
            }
          }

          // 6) 치아 미백 & 입술 생기 (Teeth Whiten & Lip Tint)
          if (p.teethWhiten > 0 || p.lipTint > 0) {
            const my = fcy + fry * 0.51;
            const mdy = (ny - my) / (fry * 0.16);
            const mdx = (nx - fcx) / (frx * 0.34);
            if (mdx * mdx + mdy * mdy < 1) {
              const mMask = 1 - (mdx * mdx + mdy * mdy);
              const lumaM = 0.299 * r + 0.587 * g + 0.114 * b;
              const redDiff = r - g;
              if (p.teethWhiten > 0 && lumaM > 145 && redDiff < 38) {
                // 치아 영역 미백 (노란기 제거 + 밝기 상승)
                const tw = (p.teethWhiten / 100) * mMask;
                r += tw * 18;
                g += tw * 22;
                b += tw * 32;
              } else if (p.lipTint > 0 && redDiff >= 20) {
                // 입술 생기 코랄·로즈 컬러
                const lt = (p.lipTint / 100) * mMask;
                r += lt * 22;
                g -= lt * 6;
                b += lt * 4;
              }
            }
          }

          // 7) 빈 헤어라인 채우기 & 머릿결 윤기
          if (p.hairlineFill > 0 && fdy < -0.55 && fdy > -1.15 && faceDistSq > 0.45 && faceDistSq < 1.25) {
            const hl = (p.hairlineFill / 100) * 0.35;
            r *= (1 - hl);
            g *= (1 - hl);
            b *= (1 - hl);
          }
          if (p.hairGloss > 0 && fdy < -0.25 && (r + g + b) < 260) {
            const hg = (p.hairGloss / 100) * 18;
            const ring = Math.max(0, 1 - Math.abs(fdy + 0.72) * 4);
            r += hg * ring;
            g += hg * ring;
            b += hg * ring * 1.1;
          }
        }

        // --- D. 클래리티 / 샤프닝 / 할레이션 글로우 ---
        const detailBoost = (p.clarity * 0.55 + p.sharpness * 0.65) / 100;
        if (detailBoost !== 0 && blurPixels) {
          r += (r - br) * detailBoost;
          g += (g - bg) * detailBoost;
          b += (b - bb) * detailBoost;
        }

        if (p.halation > 0 && blurPixels) {
          const blurLuma = 0.299 * br + 0.587 * bg + 0.114 * bb;
          if (blurLuma > 165) {
            const glow = ((blurLuma - 165) / 90) * (p.halation / 100) * 38;
            r += glow * 1.15;
            g += glow * 0.82;
            b += glow * 0.65;
          }
        }

        // --- E. 디헤이즈 (안개·뿌연 빛 제거 / 역광 복원) ---
        if (dehazeVal !== 0) {
          const minCh = Math.min(r, g, b) / 255;
          if (dehazeVal > 0) {
            const veil = minCh * dehazeVal * 0.44;
            const invT = 1 / Math.max(0.28, 1 - veil);
            r = (r - veil * 240) * invT;
            g = (g - veil * 242) * invT;
            b = (b - veil * 248) * invT;
          } else {
            const mist = -dehazeVal * 0.45;
            r = r + (236 - r) * mist;
            g = g + (240 - g) * mist;
            b = b + (248 - b) * mist;
          }
        }

        // --- F. 노출 / 화이트밸런스 / 명암 / 하이라이트·그림자 ---
        r = r * expFactor + tempShift + tintShift * 0.45;
        g = g * expFactor - tintShift * 0.55;
        b = b * expFactor - tempShift + tintShift * 0.35;

        const normLuma = Math.max(0, Math.min(1, (0.299 * r + 0.587 * g + 0.114 * b) / 255));

        if (p.shadows !== 0 || p.blacks !== 0) {
          const shadowMask = Math.pow(1 - normLuma, 1.75);
          const shDelta = (p.shadows * 0.68 + p.blacks * 0.45) * shadowMask;
          r += shDelta;
          g += shDelta;
          b += shDelta;
        }

        if (p.highlights !== 0 || p.whites !== 0) {
          const hiMask = Math.pow(normLuma, 1.75);
          const hiDelta = (p.highlights * 0.68 + p.whites * 0.45) * hiMask;
          r += hiDelta;
          g += hiDelta;
          b += hiDelta;
        }

        if (contrastFactor !== 1) {
          r = ((r / 255 - 0.5) * contrastFactor + 0.5) * 255;
          g = ((g / 255 - 0.5) * contrastFactor + 0.5) * 255;
          b = ((b / 255 - 0.5) * contrastFactor + 0.5) * 255;
        }

        // --- G. 생동감 (피부 보호 Vibrance) & 전체 채도 & 하늘/수풀 컬러 믹서 ---
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        const curSat = (maxC - minC) / 255;
        const skinProtect = skinWeight > 0 && vibFactor > 0 ? (1 - skinWeight * 0.48) : 1;
        const localSat = Math.max(0, satFactor + vibFactor * (1 - curSat) * skinProtect);

        r = luma + (r - luma) * localSat;
        g = luma + (g - luma) * localSat;
        b = luma + (b - luma) * localSat;

        // 하늘·바다 청량감 (Aqua/Blue Boost)
        if (p.aquaBlueBoost !== 0 && b > r && b > 80) {
          const blueWeight = Math.min(1, (b - r) / 70);
          const ab = (p.aquaBlueBoost / 100) * blueWeight;
          b += ab * 26;
          g += ab * 12;
          r -= ab * 10;
        }

        // 나뭇잎·수풀 싱그러움 (Foliage Green)
        if (p.foliageGreen !== 0 && g > r * 0.92 && g > b) {
          const greenWeight = Math.min(1, (g - b) / 65);
          const fgBoost = (p.foliageGreen / 100) * greenWeight;
          g += fgBoost * 22;
          b += fgBoost * 8;
        }

        // --- H. 스플릿 토닝 (하이라이트·그림자 색감 입히기) ---
        if (hiStr > 0) {
          const wHi = normLuma * hiStr;
          r = r * (1 - wHi) + hiRgb[0] * wHi;
          g = g * (1 - wHi) + hiRgb[1] * wHi;
          b = b * (1 - wHi) + hiRgb[2] * wHi;
        }
        if (shStr > 0) {
          const wSh = (1 - normLuma) * shStr;
          r = r * (1 - wSh) + shRgb[0] * wSh;
          g = g * (1 - wSh) + shRgb[1] * wSh;
          b = b * (1 - wSh) + shRgb[2] * wSh;
        }

        // --- I. 매트 필름 페이드 (Fade) & 비네팅 (Vignette) & 필름 그레인 (Film Grain) ---
        if (p.fade > 0) {
          const lift = (p.fade / 100) * 36;
          r = lift + r * (1 - lift / 255);
          g = lift + g * (1 - lift / 255);
          b = lift + b * (1 - lift / 255);
        }

        if (p.vignette !== 0) {
          const vdx = nx - 0.5;
          const vdy = ny - 0.5;
          const vDist = Math.sqrt(vdx * vdx + vdy * vdy) * 1.42;
          const vMask = Math.pow(Math.max(0, vDist - 0.25), 1.85);
          const vDelta = (p.vignette / 100) * vMask * 135;
          r += vDelta;
          g += vDelta;
          b += vDelta;
        }

        if (grainAmt > 0) {
          const gxSeed = ((x / grainBlock) | 0) * 374761393 + ((y / grainBlock) | 0) * 668265263;
          const hash = ((gxSeed ^ (gxSeed >> 13)) * 1274126177) & 0x7fffffff;
          const noise = (hash / 0x7fffffff - 0.5) * 2;
          const midWeight = 1 - Math.abs(normLuma - 0.5) * 0.75;
          const gDelta = noise * grainAmt * midWeight;
          r += gDelta;
          g += gDelta;
          b += gDelta;
        }

        dstPixels[i] = clampByte(r);
        dstPixels[i + 1] = clampByte(g);
        dstPixels[i + 2] = clampByte(b);
      }
    }

    ctx.putImageData(warpedData, 0, 0);
  }

  // =========================================================================
  // 9. 화면 렌더링 및 오버레이 (전/후 비교, 격자선, 얼굴 가이드)
  // =========================================================================
  function scheduleRender() {
    if (state.renderScheduled) return;
    state.renderScheduled = true;
    requestAnimationFrame(() => {
      state.renderScheduled = false;
      renderMainStage();
    });
  }

  function renderMainStage() {
    const photo = getActivePhoto();
    if (!photo) return;

    const editorCanvas = document.getElementById('editor-canvas');
    const beforeCanvas = document.getElementById('before-canvas');
    const overlayCanvas = document.getElementById('overlay-canvas');
    if (!editorCanvas || !beforeCanvas || !overlayCanvas) return;

    const w = photo.sourceCanvas.width;
    const h = photo.sourceCanvas.height;

    if (beforeCanvas.width !== w || beforeCanvas.height !== h) {
      beforeCanvas.width = w;
      beforeCanvas.height = h;
    }
    const bctx = beforeCanvas.getContext('2d');
    bctx.drawImage(photo.sourceCanvas, 0, 0, w, h);

    if (state.holdOriginal) {
      if (editorCanvas.width !== w) editorCanvas.width = w;
      if (editorCanvas.height !== h) editorCanvas.height = h;
      editorCanvas.getContext('2d').drawImage(photo.sourceCanvas, 0, 0, w, h);
    } else {
      renderPhotoToCanvas(photo, editorCanvas, w, h);
    }

    // 반반 비교 클리핑
    const splitDivider = document.getElementById('split-divider');
    if (state.splitCompare && !state.holdOriginal) {
      beforeCanvas.classList.remove('hidden');
      if (splitDivider) splitDivider.classList.remove('hidden');
      const pct = Math.max(5, Math.min(95, state.splitRatio * 100));
      beforeCanvas.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      if (splitDivider) splitDivider.style.left = `${pct}%`;
    } else {
      beforeCanvas.classList.add('hidden');
      if (splitDivider) splitDivider.classList.add('hidden');
    }

    renderOverlayCanvas(photo, overlayCanvas, w, h);
    positionFaceGuideElement(photo);
  }

  function renderOverlayCanvas(photo, overlayCanvas, w, h) {
    if (overlayCanvas.width !== w) overlayCanvas.width = w;
    if (overlayCanvas.height !== h) overlayCanvas.height = h;
    const octx = overlayCanvas.getContext('2d');
    octx.clearRect(0, 0, w, h);

    // 고정 마스크(빨간 보호막) 시각화
    const cellW = w / (GRID_W - 1);
    const cellH = h / (GRID_H - 1);
    octx.fillStyle = 'rgba(255, 75, 75, 0.35)';
    for (let gy = 0; gy < GRID_H; gy += 2) {
      for (let gx = 0; gx < GRID_W; gx += 2) {
        const fz = photo.freezeMask[gy * GRID_W + gx];
        if (fz > 0.05) {
          octx.fillRect(gx * cellW - cellW, gy * cellH - cellH, cellW * 2.2, cellH * 2.2);
        }
      }
    }

    // 왜곡 확인용 격자선(그리드) 표시
    if (state.showMeshGrid) {
      octx.strokeStyle = 'rgba(0, 229, 255, 0.42)';
      octx.lineWidth = 1;
      const step = 24;
      for (let row = 0; row <= step; row++) {
        const ny = row / step;
        octx.beginPath();
        for (let col = 0; col <= step; col++) {
          const nx = col / step;
          const m = evaluateCombinedDisplacement(photo, nx, ny);
          const px = (nx - (m.sx - nx)) * w;
          const py = (ny - (m.sy - ny)) * h;
          if (col === 0) octx.moveTo(px, py);
          else octx.lineTo(px, py);
        }
        octx.stroke();
      }
      for (let col = 0; col <= step; col++) {
        const nx = col / step;
        octx.beginPath();
        for (let row = 0; row <= step; row++) {
          const ny = row / step;
          const m = evaluateCombinedDisplacement(photo, nx, ny);
          const px = (nx - (m.sx - nx)) * w;
          const py = (ny - (m.sy - ny)) * h;
          if (row === 0) octx.moveTo(px, py);
          else octx.lineTo(px, py);
        }
        octx.stroke();
      }
    }
  }

  function positionFaceGuideElement(photo) {
    const box = document.getElementById('face-guide-box');
    if (!box) return;
    if (!state.showFaceGuide) {
      box.classList.add('hidden');
      return;
    }
    box.classList.remove('hidden');
    const fg = photo.faceGuide;
    box.style.left = `${(fg.cx - fg.rx) * 100}%`;
    box.style.top = `${(fg.cy - fg.ry) * 100}%`;
    box.style.width = `${fg.rx * 200}%`;
    box.style.height = `${fg.ry * 200}%`;
  }

  // =========================================================================
  // 10. 터치 / 마우스 리퀴파이 & 잡티 지우개 인터랙션
  // =========================================================================
  function applyBrushStroke(photo, normX0, normY0, normX1, normY1) {
    const radiusNorm = state.brushRadius / 720;
    const rSq = radiusNorm * radiusNorm;
    const strength = (state.brushStrength / 100) * 0.42;
    const moveX = normX1 - normX0;
    const moveY = normY1 - normY0;

    for (let gy = 0; gy < GRID_H; gy++) {
      const ny = gy / (GRID_H - 1);
      const dy = ny - normY0;
      if (Math.abs(dy) > radiusNorm) continue;

      for (let gx = 0; gx < GRID_W; gx++) {
        const nx = gx / (GRID_W - 1);
        const dx = nx - normX0;
        const dSq = dx * dx + dy * dy;
        if (dSq >= rSq) continue;

        const idx = gy * GRID_W + gx;
        const falloff = Math.pow(1 - dSq / rSq, 2);

        if (state.brushMode === 'freeze') {
          photo.freezeMask[idx] = Math.min(1, photo.freezeMask[idx] + falloff * 0.55);
          continue;
        }
        if (state.brushMode === 'thaw') {
          photo.freezeMask[idx] = Math.max(0, photo.freezeMask[idx] - falloff * 0.65);
          continue;
        }

        const protect = Math.max(0, 1 - photo.freezeMask[idx]);
        const w = falloff * strength * protect;

        if (state.brushMode === 'push') {
          photo.manualDx[idx] -= moveX * w * 1.45;
          photo.manualDy[idx] -= moveY * w * 1.45;
        } else if (state.brushMode === 'shrink') {
          photo.manualDx[idx] += dx * w * 0.35;
          photo.manualDy[idx] += dy * w * 0.35;
        } else if (state.brushMode === 'expand') {
          photo.manualDx[idx] -= dx * w * 0.35;
          photo.manualDy[idx] -= dy * w * 0.35;
        } else if (state.brushMode === 'restore') {
          photo.manualDx[idx] *= (1 - falloff * 0.45);
          photo.manualDy[idx] *= (1 - falloff * 0.45);
        }
      }
    }
  }

  // =========================================================================
  // 11. UI 동기화, 프리셋 카드, 필름스트립 렌더링
  // =========================================================================
  function getAllPresets() {
    return [...BUILTIN_PRESETS, ...state.customPresets];
  }

  function renderPresetGrid() {
    const gridEl = document.getElementById('preset-grid');
    if (!gridEl) return;
    const photo = getActivePhoto();
    const all = getAllPresets();
    const filtered = state.activePresetCategory === 'all'
      ? all
      : all.filter((p) => p.category === state.activePresetCategory);

    if (filtered.length === 0) {
      gridEl.innerHTML = '<div class="helper-note" style="grid-column:1/-1;padding:12px;">아직 저장된 내 프리셋이 없습니다. 아래 입력창에 이름을 적고 [내 프리셋 저장]을 눌러보세요.</div>';
      return;
    }

    gridEl.innerHTML = filtered.map((preset) => {
      const isActive = photo && photo.activePresetId === preset.id;
      return `
        <button type="button" class="preset-card ${isActive ? 'active' : ''}" data-preset-id="${preset.id}" role="listitem">
          <div class="preset-swatch" style="background: ${preset.gradient || 'linear-gradient(135deg,#ff7a59,#ffd166)'}">
            <span>${preset.badge || '프리셋'}</span>
            ${isActive ? '<span>적용됨</span>' : ''}
          </div>
          <div class="preset-name">${preset.name}</div>
          <div class="preset-desc">${preset.desc}</div>
        </button>
      `;
    }).join('');
  }

  function applyPresetById(presetId) {
    const photo = getActivePhoto();
    if (!photo) return false;
    const preset = getAllPresets().find((item) => item.id === presetId);
    if (!preset) return false;

    pushUndoSnapshot(photo);
    const nextParams = createDefaultParams();
    // 기존에 설정해둔 스튜디오 배경이나 리퀴파이 중 프리셋에 없는 항목은 유지할지 여부:
    // 올인원('liquify')이 아닌 순수 색감 프리셋은 기존 얼굴/체형 리퀴파이 수치를 보존!
    if (preset.category !== 'liquify') {
      PARAM_GROUPS.liquify.forEach((k) => {
        nextParams[k] = photo.params[k];
      });
    }
    Object.keys(preset.params).forEach((k) => {
      if (k in nextParams) {
        nextParams[k] = preset.params[k];
      }
    });

    photo.params = nextParams;
    photo.activePresetId = preset.id;
    syncUIFromActivePhoto();
    renderPresetGrid();
    renderFilmstrip();
    scheduleRender();
    showToast(`'${preset.name}' 프리셋을 적용했습니다.`);
    return true;
  }

  function renderFilmstrip() {
    const listEl = document.getElementById('filmstrip-list');
    if (!listEl) return;

    listEl.innerHTML = state.photos.map((item, idx) => {
      const isEdited = Object.keys(item.params).some((k) => {
        const def = createDefaultParams()[k];
        return item.params[k] !== def;
      });
      return `
        <button type="button" class="filmstrip-item ${idx === state.activePhotoIndex ? 'active' : ''}" data-photo-idx="${idx}" role="listitem">
          <img src="${item.thumbDataUrl}" alt="${item.title}" class="filmstrip-thumb">
          <div class="filmstrip-meta">
            <span class="filmstrip-title">${item.title}</span>
            <span class="filmstrip-badge">${isEdited ? '보정됨 · 복붙 가능' : item.badge}</span>
          </div>
        </button>
      `;
    }).join('');
  }

  function syncUIFromActivePhoto() {
    const photo = getActivePhoto();
    if (!photo) return;

    document.querySelectorAll('input[type="range"][data-param]').forEach((slider) => {
      const param = slider.getAttribute('data-param');
      if (param in photo.params) {
        slider.value = photo.params[param];
        const valEl = document.getElementById(`val-${param}`);
        if (valEl) {
          if (param === 'splitHighlightHue' || param === 'splitShadowHue' || param === 'straighten') {
            valEl.textContent = `${photo.params[param]}°`;
          } else {
            valEl.textContent = `${photo.params[param]}`;
          }
        }
      }
    });

    const presetIntSlider = document.getElementById('sl-presetIntensity');
    const presetIntVal = document.getElementById('val-presetIntensity');
    if (presetIntSlider) presetIntSlider.value = photo.presetIntensity;
    if (presetIntVal) presetIntVal.textContent = `${photo.presetIntensity}%`;

    const flipBtn = document.getElementById('btn-flip-h');
    if (flipBtn) {
      flipBtn.setAttribute('aria-pressed', String(Boolean(photo.params.flipH)));
      flipBtn.classList.toggle('active', Boolean(photo.params.flipH));
    }

    document.querySelectorAll('[data-bg-mode]').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-bg-mode') === photo.params.bgTintMode);
    });

    updateUndoRedoButtons();
    renderPresetGrid();
  }

  function showToast(msg) {
    const toast = document.getElementById('status-toast');
    if (toast) {
      toast.textContent = msg;
    }
  }

  // =========================================================================
  // 12. 고화질 JPEG 내보내기 & 일괄 JPEG 저장
  // =========================================================================
  function getExportTargetDimensions(photo) {
    const scaleSelect = document.getElementById('export-scale');
    const mode = scaleSelect ? scaleSelect.value : 'original';
    const sw = photo.sourceCanvas.width;
    const sh = photo.sourceCanvas.height;
    if (mode === 'original') return { width: sw, height: sh };

    const maxEdge = Number(mode) || 2048;
    const longest = Math.max(sw, sh);
    if (longest <= maxEdge) return { width: sw, height: sh };
    const ratio = maxEdge / longest;
    return {
      width: Math.round(sw * ratio),
      height: Math.round(sh * ratio)
    };
  }

  function buildExportJpegDataUrl(photo, qualityPercent, customScale) {
    const targetPhoto = photo || getActivePhoto();
    const q = Math.max(0.5, Math.min(1, (qualityPercent || 95) / 100));
    const dims = customScale || getExportTargetDimensions(targetPhoto);
    const outCanvas = document.createElement('canvas');
    outCanvas.width = dims.width;
    outCanvas.height = dims.height;
    renderPhotoToCanvas(targetPhoto, outCanvas, dims.width, dims.height);
    const dataUrl = outCanvas.toDataURL('image/jpeg', q);
    const base64Length = dataUrl.split(',')[1]?.length || 0;
    const byteSize = Math.round((base64Length * 3) / 4);
    return {
      dataUrl,
      width: dims.width,
      height: dims.height,
      quality: q,
      byteSize,
      mimeType: 'image/jpeg'
    };
  }

  function updateExportModalInfo() {
    const photo = getActivePhoto();
    if (!photo) return;
    const qualitySlider = document.getElementById('export-quality');
    const qVal = qualitySlider ? Number(qualitySlider.value) : 95;
    const valLabel = document.getElementById('val-export-quality');
    if (valLabel) {
      valLabel.textContent = qVal >= 92 ? `${qVal}% (초고화질)` : `${qVal}%`;
    }

    const res = buildExportJpegDataUrl(photo, qVal);
    const resEl = document.getElementById('export-resolution-info');
    const sizeEl = document.getElementById('export-size-info');
    if (resEl) resEl.textContent = `${res.width} x ${res.height} px`;
    if (sizeEl) {
      const kb = (res.byteSize / 1024).toFixed(1);
      sizeEl.textContent = res.byteSize > 1024 * 1024
        ? `약 ${(res.byteSize / (1024 * 1024)).toFixed(2)} MB`
        : `약 ${kb} KB`;
    }
  }

  function triggerJpegDownload(dataUrl, rawName) {
    const cleanName = (rawName || 'EvotoLite_보정본').replace(/\.(jpg|jpeg)$/i, '');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${cleanName}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // =========================================================================
  // 13. 이벤트 바인딩 및 초기화
  // =========================================================================
  function initSamplePhotos() {
    state.photos = [
      createPhotoSlot('sample-portrait', '샘플 1: 스튜디오 인물', '클로즈업 샘플', createSamplePortraitCanvas('portrait'), { cx: 0.5, cy: 0.36, rx: 0.17, ry: 0.17 }),
      createPhotoSlot('sample-hazy', '샘플 2: 역광·안개 인물', '디헤이즈 체험', createSamplePortraitCanvas('hazy'), { cx: 0.5, cy: 0.34, rx: 0.15, ry: 0.15 }),
      createPhotoSlot('sample-fullbody', '샘플 3: 전신 비율 샘플', '전신·다리길이', createSamplePortraitCanvas('fullbody'), { cx: 0.5, cy: 0.19, rx: 0.08, ry: 0.08 })
    ];
    state.activePhotoIndex = 0;
  }

  function bindEvents() {
    // 탭 전환
    document.querySelectorAll('.tool-tab').forEach((tabBtn) => {
      tabBtn.addEventListener('click', () => {
        const targetTab = tabBtn.getAttribute('data-tab');
        state.activeTab = targetTab;
        document.querySelectorAll('.tool-tab').forEach((b) => {
          const active = b === tabBtn;
          b.classList.toggle('active', active);
          b.setAttribute('aria-selected', String(active));
        });
        document.querySelectorAll('.tool-panel').forEach((panel) => {
          panel.classList.toggle('hidden', panel.id !== `panel-${targetTab}`);
        });
      });
    });

    // 모든 보정 슬라이더 실시간 반영
    document.querySelectorAll('input[type="range"][data-param]').forEach((slider) => {
      const param = slider.getAttribute('data-param');
      slider.addEventListener('pointerdown', () => {
        pushUndoSnapshot();
      });
      slider.addEventListener('input', () => {
        const photo = getActivePhoto();
        if (!photo) return;
        const val = Number(slider.value);
        photo.params[param] = val;
        const valEl = document.getElementById(`val-${param}`);
        if (valEl) {
          if (param === 'splitHighlightHue' || param === 'splitShadowHue' || param === 'straighten') {
            valEl.textContent = `${val}°`;
          } else {
            valEl.textContent = `${val}`;
          }
        }
        scheduleRender();
      });
      slider.addEventListener('change', () => {
        renderFilmstrip();
      });
    });

    // 이보토 핵심: 보정 수치 복사 / 붙여넣기 / 전체 동기화 / 옵션 모달
    const btnCopy = document.getElementById('btn-copy-settings');
    const btnPaste = document.getElementById('btn-paste-settings');
    const btnSyncAll = document.getElementById('btn-sync-all-photos');
    const btnCopyOpts = document.getElementById('btn-copy-options');
    const modalCopySync = document.getElementById('modal-copy-sync');

    if (btnCopy) btnCopy.addEventListener('click', () => copySettingsFromActivePhoto());
    if (btnPaste) btnPaste.addEventListener('click', () => pasteSettingsToActivePhoto());
    if (btnSyncAll) btnSyncAll.addEventListener('click', () => syncSettingsToAllPhotos());

    if (btnCopyOpts && modalCopySync) {
      btnCopyOpts.addEventListener('click', () => {
        const photo = getActivePhoto();
        if (photo) {
          const codeArea = document.getElementById('settings-code-textarea');
          if (codeArea) codeArea.value = encodeSettingsCode(buildCopyPayload(photo));
        }
        modalCopySync.classList.remove('hidden');
      });
    }

    const btnCopySyncClose = document.getElementById('btn-copy-sync-close');
    if (btnCopySyncClose && modalCopySync) {
      btnCopySyncClose.addEventListener('click', () => modalCopySync.classList.add('hidden'));
    }

    const btnApplyCodeText = document.getElementById('btn-apply-code-text');
    if (btnApplyCodeText) {
      btnApplyCodeText.addEventListener('click', () => {
        const codeArea = document.getElementById('settings-code-textarea');
        try {
          const decoded = decodeSettingsCode(codeArea ? codeArea.value : '');
          state.clipboardSettings = decoded;
          const btnP = document.getElementById('btn-paste-settings');
          if (btnP) btnP.disabled = false;
          pasteSettingsToActivePhoto();
          if (modalCopySync) modalCopySync.classList.add('hidden');
        } catch (err) {
          showToast(err.message || '보정 수치 코드 형식을 확인해 주세요.');
        }
      });
    }

    const btnCopyCodeClip = document.getElementById('btn-copy-code-clipboard');
    if (btnCopyCodeClip) {
      btnCopyCodeClip.addEventListener('click', () => {
        copySettingsFromActivePhoto();
        if (modalCopySync) modalCopySync.classList.add('hidden');
      });
    }

    // 필름스트립 사진 클릭 전환
    const filmstripList = document.getElementById('filmstrip-list');
    if (filmstripList) {
      filmstripList.addEventListener('click', (e) => {
        const item = e.target.closest('[data-photo-idx]');
        if (!item) return;
        const idx = Number(item.getAttribute('data-photo-idx'));
        if (!Number.isNaN(idx) && state.photos[idx]) {
          state.activePhotoIndex = idx;
          syncUIFromActivePhoto();
          renderFilmstrip();
          scheduleRender();
          showToast(`'${state.photos[idx].title}' 사진을 선택했습니다. [붙여넣기]를 누르면 복사한 보정값이 바로 적용됩니다.`);
        }
      });
    }

    // 인물 패키지 버튼 (탭 1)
    document.querySelectorAll('[data-beauty-pack]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const packKey = btn.getAttribute('data-beauty-pack');
        const pack = BEAUTY_PACKS[packKey];
        const photo = getActivePhoto();
        if (!pack || !photo) return;
        pushUndoSnapshot(photo);
        Object.keys(pack.values).forEach((k) => {
          photo.params[k] = pack.values[k];
        });
        syncUIFromActivePhoto();
        renderFilmstrip();
        scheduleRender();
        showToast(`'${pack.name}' 인물 피부·디테일 패키지를 적용했습니다.`);
      });
    });

    // 리퀴파이 원클릭 콤보 버튼 (탭 2)
    document.querySelectorAll('[data-liquify-combo]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const comboKey = btn.getAttribute('data-liquify-combo');
        const combo = LIQUIFY_COMBOS[comboKey];
        const photo = getActivePhoto();
        if (!combo || !photo) return;
        pushUndoSnapshot(photo);
        PARAM_GROUPS.liquify.forEach((k) => {
          photo.params[k] = 0;
        });
        Object.keys(combo.values).forEach((k) => {
          photo.params[k] = combo.values[k];
        });
        syncUIFromActivePhoto();
        renderFilmstrip();
        scheduleRender();
        showToast(`'${combo.name}' 슬라이더 성형을 적용했습니다.`);
      });
    });

    // 배경 톤 변경 버튼 (탭 5)
    document.querySelectorAll('[data-bg-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-bg-mode');
        const photo = getActivePhoto();
        if (!photo) return;
        pushUndoSnapshot(photo);
        photo.params.bgTintMode = mode;
        if (mode !== 'none' && photo.params.bgTintStrength === 0) {
          photo.params.bgTintStrength = 65;
        } else if (mode === 'none') {
          photo.params.bgTintStrength = 0;
        }
        syncUIFromActivePhoto();
        scheduleRender();
        showToast('스튜디오 배경 톤을 변경했습니다.');
      });
    });

    // 디헤이즈 빠른 버튼 & 그레인 빠른 버튼 (탭 6)
    document.querySelectorAll('[data-dehaze-quick]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const photo = getActivePhoto();
        if (!photo) return;
        pushUndoSnapshot(photo);
        photo.params.dehaze = Number(btn.getAttribute('data-dehaze-quick'));
        syncUIFromActivePhoto();
        scheduleRender();
      });
    });

    document.querySelectorAll('[data-grain-quick]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const photo = getActivePhoto();
        if (!photo) return;
        pushUndoSnapshot(photo);
        const mode = btn.getAttribute('data-grain-quick');
        if (mode === 'none') {
          photo.params.grainAmount = 0;
        } else if (mode === 'fine') {
          photo.params.grainAmount = 24;
          photo.params.grainSize = 1.3;
        } else if (mode === 'cinema') {
          photo.params.grainAmount = 38;
          photo.params.grainSize = 1.6;
        } else if (mode === 'rough') {
          photo.params.grainAmount = 58;
          photo.params.grainSize = 2.3;
        }
        syncUIFromActivePhoto();
        scheduleRender();
      });
    });

    // 프리셋 카테고리 및 프리셋 클릭
    document.querySelectorAll('[data-preset-cat]').forEach((pill) => {
      pill.addEventListener('click', () => {
        state.activePresetCategory = pill.getAttribute('data-preset-cat');
        document.querySelectorAll('[data-preset-cat]').forEach((p) => p.classList.toggle('active', p === pill));
        renderPresetGrid();
      });
    });

    const presetGrid = document.getElementById('preset-grid');
    if (presetGrid) {
      presetGrid.addEventListener('click', (e) => {
        const card = e.target.closest('[data-preset-id]');
        if (!card) return;
        applyPresetById(card.getAttribute('data-preset-id'));
      });
    }

    const slPresetInt = document.getElementById('sl-presetIntensity');
    if (slPresetInt) {
      slPresetInt.addEventListener('input', () => {
        const photo = getActivePhoto();
        if (!photo) return;
        photo.presetIntensity = Number(slPresetInt.value);
        const valEl = document.getElementById('val-presetIntensity');
        if (valEl) valEl.textContent = `${photo.presetIntensity}%`;
        scheduleRender();
      });
    }

    const btnSaveCustomPreset = document.getElementById('btn-save-custom-preset');
    if (btnSaveCustomPreset) {
      btnSaveCustomPreset.addEventListener('click', () => {
        const photo = getActivePhoto();
        const nameInput = document.getElementById('custom-preset-name');
        const customName = (nameInput && nameInput.value.trim()) || `내 프리셋 ${state.customPresets.length + 1}`;
        const newPreset = {
          id: `custom-${Date.now()}`,
          name: customName,
          category: 'custom',
          badge: '내 프리셋',
          desc: '현재 인물·리퀴파이·색감 보정값 저장본',
          gradient: 'linear-gradient(135deg, #38d9a9, #20c997)',
          params: JSON.parse(JSON.stringify(photo.params))
        };
        state.customPresets.push(newPreset);
        photo.activePresetId = newPreset.id;
        if (nameInput) nameInput.value = '';
        renderPresetGrid();
        showToast(`'${customName}' 프리셋을 저장했습니다.`);
      });
    }

    // 얼굴 위치 가이드 토글 및 드래그
    const btnToggleGuide = document.getElementById('btn-toggle-face-guide');
    if (btnToggleGuide) {
      btnToggleGuide.addEventListener('click', () => {
        state.showFaceGuide = !state.showFaceGuide;
        btnToggleGuide.setAttribute('aria-pressed', String(state.showFaceGuide));
        btnToggleGuide.classList.toggle('active', state.showFaceGuide);
        scheduleRender();
      });
    }

    const btnAutoFace = document.getElementById('btn-auto-detect-face');
    if (btnAutoFace) {
      btnAutoFace.addEventListener('click', () => {
        const photo = getActivePhoto();
        if (!photo) return;
        photo.faceGuide = photo.id === 'sample-fullbody'
          ? { cx: 0.5, cy: 0.19, rx: 0.08, ry: 0.08 }
          : { cx: 0.5, cy: 0.36, rx: 0.17, ry: 0.17 };
        state.showFaceGuide = true;
        if (btnToggleGuide) {
          btnToggleGuide.setAttribute('aria-pressed', 'true');
          btnToggleGuide.classList.add('active');
        }
        scheduleRender();
        showToast('얼굴 중심 가이드를 사진 중앙 인물 위치에 자동으로 맞추었습니다.');
      });
    }

    // 각 섹션별 초기화 버튼
    const bindGroupReset = (btnId, groupName, label) => {
      const btn = document.getElementById(btnId);
      if (!btn) return;
      btn.addEventListener('click', () => {
        const photo = getActivePhoto();
        if (!photo) return;
        pushUndoSnapshot(photo);
        const defs = createDefaultParams();
        PARAM_GROUPS[groupName].forEach((k) => {
          photo.params[k] = defs[k];
        });
        syncUIFromActivePhoto();
        renderFilmstrip();
        scheduleRender();
        showToast(`${label} 수치를 초기화했습니다.`);
      });
    };
    bindGroupReset('btn-reset-beauty', 'beauty', '인물 피부·디테일');
    bindGroupReset('btn-reset-easy-liquify', 'liquify', '슬라이더 리퀴파이');
    bindGroupReset('btn-reset-color', 'color', '색감·배경');
    bindGroupReset('btn-reset-effects', 'effects', '디헤이즈·효과');

    const btnResetAll = document.getElementById('btn-reset-all');
    if (btnResetAll) {
      btnResetAll.addEventListener('click', () => {
        const photo = getActivePhoto();
        if (!photo) return;
        pushUndoSnapshot(photo);
        photo.params = createDefaultParams();
        photo.activePresetId = null;
        photo.presetIntensity = 100;
        photo.manualDx.fill(0);
        photo.manualDy.fill(0);
        photo.freezeMask.fill(0);
        photo.spotHeals = [];
        syncUIFromActivePhoto();
        renderFilmstrip();
        scheduleRender();
        showToast('현재 사진의 모든 보정을 처음 상태로 초기화했습니다.');
      });
    }

    // 터치 브러시 도구 선택 & 슬라이더
    document.querySelectorAll('[data-brush-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.brushMode = btn.getAttribute('data-brush-mode');
        document.querySelectorAll('[data-brush-mode]').forEach((b) => b.classList.toggle('active', b === btn));
      });
    });

    const slBrushRadius = document.getElementById('sl-brushRadius');
    if (slBrushRadius) {
      slBrushRadius.addEventListener('input', () => {
        state.brushRadius = Number(slBrushRadius.value);
        const v = document.getElementById('val-brushRadius');
        if (v) v.textContent = `${state.brushRadius}px`;
      });
    }

    const slBrushStrength = document.getElementById('sl-brushStrength');
    if (slBrushStrength) {
      slBrushStrength.addEventListener('input', () => {
        state.brushStrength = Number(slBrushStrength.value);
        const v = document.getElementById('val-brushStrength');
        if (v) v.textContent = `${state.brushStrength}%`;
      });
    }

    const btnToggleGrid = document.getElementById('btn-toggle-grid');
    if (btnToggleGrid) {
      btnToggleGrid.addEventListener('click', () => {
        state.showMeshGrid = !state.showMeshGrid;
        btnToggleGrid.setAttribute('aria-pressed', String(state.showMeshGrid));
        btnToggleGrid.classList.toggle('active', state.showMeshGrid);
        scheduleRender();
      });
    }

    const applyZoomTransform = () => {
      const layer = document.getElementById('canvas-transform-layer');
      const zoomFitBtn = document.getElementById('btn-zoom-fit');
      if (layer) {
        layer.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`;
      }
      if (zoomFitBtn) {
        zoomFitBtn.textContent = `${Math.round(state.zoom * 100)}% 맞춤`;
      }
    };

    const btnZoomFit = document.getElementById('btn-zoom-fit');
    if (btnZoomFit) {
      btnZoomFit.addEventListener('click', () => {
        state.zoom = 1;
        state.panX = 0;
        state.panY = 0;
        applyZoomTransform();
        showToast('화면 크기를 100% 정중앙으로 맞추었습니다.');
      });
    }

    const btnPanMode = document.getElementById('btn-pan-mode');
    if (btnPanMode) {
      btnPanMode.addEventListener('click', () => {
        state.panMode = !state.panMode;
        btnPanMode.setAttribute('aria-pressed', String(state.panMode));
        btnPanMode.classList.toggle('active', state.panMode);
        showToast(state.panMode ? '화면 이동 모드: 드래그하여 확대한 사진을 이동합니다.' : '성형 브러시 모드로 전환했습니다.');
      });
    }

    const stageViewport = document.getElementById('stage-viewport');
    if (stageViewport) {
      stageViewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.12 : -0.12;
        state.zoom = Math.max(0.6, Math.min(3.2, Number((state.zoom + delta).toFixed(2))));
        if (state.zoom === 1) {
          state.panX = 0;
          state.panY = 0;
        }
        applyZoomTransform();
      }, { passive: false });
    }

    const btnClearSpots = document.getElementById('btn-clear-spots');
    if (btnClearSpots) {
      btnClearSpots.addEventListener('click', () => {
        const photo = getActivePhoto();
        if (!photo) return;
        pushUndoSnapshot(photo);
        photo.spotHeals = [];
        scheduleRender();
        showToast('잡티 지우개 흔적을 초기화했습니다.');
      });
    }

    const btnClearFreeze = document.getElementById('btn-clear-freeze');
    if (btnClearFreeze) {
      btnClearFreeze.addEventListener('click', () => {
        const photo = getActivePhoto();
        if (!photo) return;
        pushUndoSnapshot(photo);
        photo.freezeMask.fill(0);
        scheduleRender();
        showToast('고정 마스크 보호 영역을 해제했습니다.');
      });
    }

    const btnResetBrush = document.getElementById('btn-reset-brush');
    if (btnResetBrush) {
      btnResetBrush.addEventListener('click', () => {
        const photo = getActivePhoto();
        if (!photo) return;
        pushUndoSnapshot(photo);
        photo.manualDx.fill(0);
        photo.manualDy.fill(0);
        scheduleRender();
        showToast('터치 리퀴파이 성형을 초기화했습니다.');
      });
    }

    // 캔버스 위 터치 / 마우스 드래그 성형 & 잡티 콕 찍기 & 화면 이동
    const editorCanvas = document.getElementById('editor-canvas');
    const brushCursor = document.getElementById('brush-cursor');
    let isDrawing = false;
    let isPanning = false;
    let panStartX = 0;
    let panStartY = 0;
    let lastNormX = 0;
    let lastNormY = 0;

    if (editorCanvas) {
      editorCanvas.addEventListener('pointerdown', (e) => {
        if (state.panMode) {
          isPanning = true;
          panStartX = e.clientX - state.panX;
          panStartY = e.clientY - state.panY;
          editorCanvas.setPointerCapture(e.pointerId);
          return;
        }
        const photo = getActivePhoto();
        if (!photo) return;
        const rect = editorCanvas.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width;
        const ny = (e.clientY - rect.top) / rect.height;
        if (nx < 0 || nx > 1 || ny < 0 || ny > 1) return;

        editorCanvas.setPointerCapture(e.pointerId);
        pushUndoSnapshot(photo);

        if (state.activeTab === 'liquify-touch' && state.brushMode === 'spotHeal') {
          photo.spotHeals.push({
            x: nx,
            y: ny,
            r: (state.brushRadius / 720) * 0.45
          });
          scheduleRender();
          showToast('터치한 부위의 잡티·점을 자연스럽게 지웠습니다.');
          return;
        }

        isDrawing = true;
        lastNormX = nx;
        lastNormY = ny;
        applyBrushStroke(photo, nx, ny, nx, ny);
        scheduleRender();
      });

      editorCanvas.addEventListener('pointermove', (e) => {
        if (isPanning) {
          state.panX = e.clientX - panStartX;
          state.panY = e.clientY - panStartY;
          applyZoomTransform();
          return;
        }
        const rect = editorCanvas.getBoundingClientRect();
        if (brushCursor) {
          brushCursor.classList.remove('hidden');
          brushCursor.style.left = `${e.clientX - rect.left + editorCanvas.offsetLeft}px`;
          brushCursor.style.top = `${e.clientY - rect.top + editorCanvas.offsetTop}px`;
          const displayRadius = (state.brushRadius / 720) * rect.width;
          brushCursor.style.width = `${displayRadius * 2}px`;
          brushCursor.style.height = `${displayRadius * 2}px`;
        }

        if (!isDrawing) return;
        const photo = getActivePhoto();
        if (!photo) return;
        const nx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const ny = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
        applyBrushStroke(photo, lastNormX, lastNormY, nx, ny);
        lastNormX = nx;
        lastNormY = ny;
        scheduleRender();
      });

      const stopDrawing = () => {
        isDrawing = false;
        isPanning = false;
      };
      editorCanvas.addEventListener('pointerup', stopDrawing);
      editorCanvas.addEventListener('pointercancel', stopDrawing);
      editorCanvas.addEventListener('pointerleave', () => {
        if (brushCursor) brushCursor.classList.add('hidden');
      });
    }

    // 얼굴 가이드 박스 드래그 & 크기 조절
    const faceBox = document.getElementById('face-guide-box');
    const faceResize = document.getElementById('face-guide-resize');
    if (faceBox) {
      let guideMode = null;
      let startX = 0;
      let startY = 0;
      let startFg = null;

      faceBox.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        const photo = getActivePhoto();
        if (!photo) return;
        guideMode = e.target === faceResize ? 'resize' : 'move';
        startX = e.clientX;
        startY = e.clientY;
        startFg = { ...photo.faceGuide };
        faceBox.setPointerCapture(e.pointerId);
      });

      faceBox.addEventListener('pointermove', (e) => {
        if (!guideMode || !startFg) return;
        const photo = getActivePhoto();
        const layer = document.getElementById('canvas-transform-layer');
        if (!photo || !layer) return;
        const rect = layer.getBoundingClientRect();
        const dx = (e.clientX - startX) / rect.width;
        const dy = (e.clientY - startY) / rect.height;

        if (guideMode === 'move') {
          photo.faceGuide.cx = Math.max(0.15, Math.min(0.85, startFg.cx + dx));
          photo.faceGuide.cy = Math.max(0.12, Math.min(0.85, startFg.cy + dy));
        } else {
          photo.faceGuide.rx = Math.max(0.06, Math.min(0.42, startFg.rx + dx * 0.5));
          photo.faceGuide.ry = Math.max(0.06, Math.min(0.42, startFg.ry + dy * 0.5));
        }
        scheduleRender();
      });

      faceBox.addEventListener('pointerup', () => {
        guideMode = null;
      });
    }

    // 전/후 비교 & Undo/Redo & 거울 반전
    const btnUndo = document.getElementById('btn-undo');
    const btnRedo = document.getElementById('btn-redo');
    if (btnUndo) btnUndo.addEventListener('click', undoAction);
    if (btnRedo) btnRedo.addEventListener('click', redoAction);

    const btnSplit = document.getElementById('btn-split-compare');
    if (btnSplit) {
      btnSplit.addEventListener('click', () => {
        state.splitCompare = !state.splitCompare;
        btnSplit.setAttribute('aria-pressed', String(state.splitCompare));
        btnSplit.classList.toggle('active', state.splitCompare);
        scheduleRender();
      });
    }

    const splitDivider = document.getElementById('split-divider');
    if (splitDivider) {
      let draggingSplit = false;
      splitDivider.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        draggingSplit = true;
        splitDivider.setPointerCapture(e.pointerId);
      });
      splitDivider.addEventListener('pointermove', (e) => {
        if (!draggingSplit) return;
        const layer = document.getElementById('canvas-transform-layer');
        if (!layer) return;
        const rect = layer.getBoundingClientRect();
        state.splitRatio = Math.max(0.05, Math.min(0.95, (e.clientX - rect.left) / rect.width));
        scheduleRender();
      });
      splitDivider.addEventListener('pointerup', () => {
        draggingSplit = false;
      });
    }

    const btnHoldOrig = document.getElementById('btn-hold-original');
    if (btnHoldOrig) {
      const startHold = () => {
        state.holdOriginal = true;
        btnHoldOrig.classList.add('active');
        scheduleRender();
      };
      const endHold = () => {
        state.holdOriginal = false;
        btnHoldOrig.classList.remove('active');
        scheduleRender();
      };
      btnHoldOrig.addEventListener('pointerdown', startHold);
      btnHoldOrig.addEventListener('pointerup', endHold);
      btnHoldOrig.addEventListener('pointerleave', endHold);
    }

    const btnFlipH = document.getElementById('btn-flip-h');
    if (btnFlipH) {
      btnFlipH.addEventListener('click', () => {
        const photo = getActivePhoto();
        if (!photo) return;
        pushUndoSnapshot(photo);
        photo.params.flipH = !photo.params.flipH;
        syncUIFromActivePhoto();
        scheduleRender();
      });
    }

    // 다중 사진 업로드 (스마트폰 갤러리 / PC 파일)
    const fileInput = document.getElementById('file-upload-input');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        files.forEach((file, idx) => {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
              const maxDim = 1600;
              let iw = img.naturalWidth || img.width;
              let ih = img.naturalHeight || img.height;
              if (Math.max(iw, ih) > maxDim) {
                const scale = maxDim / Math.max(iw, ih);
                iw = Math.round(iw * scale);
                ih = Math.round(ih * scale);
              }
              const c = document.createElement('canvas');
              c.width = iw;
              c.height = ih;
              c.getContext('2d').drawImage(img, 0, 0, iw, ih);

              const slot = createPhotoSlot(
                `user-${Date.now()}-${idx}`,
                file.name.replace(/\.[^.]+$/, ''),
                `${iw}x${ih}`,
                c
              );
              state.photos.push(slot);
              state.activePhotoIndex = state.photos.length - 1;
              syncUIFromActivePhoto();
              renderFilmstrip();
              scheduleRender();
              showToast(`'${file.name}' 사진을 불러왔습니다. [붙여넣기]로 이전 보정값을 바로 입힐 수 있습니다.`);
            };
            img.src = ev.target.result;
          };
          reader.readAsDataURL(file);
        });
      });
    }

    // 키보드 단축키 (Ctrl+C 수치 복사, Ctrl+V 수치 붙여넣기, Ctrl+Z 실행 취소)
    window.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT')) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        copySettingsFromActivePhoto();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        pasteSettingsToActivePhoto();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undoAction();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redoAction();
      }
    });

    // JPEG 내보내기 모달
    const modalExport = document.getElementById('modal-export');
    const btnExportOpen = document.getElementById('btn-export-open');
    const btnExportClose = document.getElementById('btn-export-close');
    const exportQuality = document.getElementById('export-quality');
    const exportScale = document.getElementById('export-scale');

    if (btnExportOpen && modalExport) {
      btnExportOpen.addEventListener('click', () => {
        modalExport.classList.remove('hidden');
        updateExportModalInfo();
      });
    }
    if (btnExportClose && modalExport) {
      btnExportClose.addEventListener('click', () => modalExport.classList.add('hidden'));
    }
    if (exportQuality) exportQuality.addEventListener('input', updateExportModalInfo);
    if (exportScale) exportScale.addEventListener('change', updateExportModalInfo);

    const btnExportDownload = document.getElementById('btn-export-download');
    if (btnExportDownload) {
      btnExportDownload.addEventListener('click', () => {
        const photo = getActivePhoto();
        if (!photo) return;
        const q = exportQuality ? Number(exportQuality.value) : 95;
        const fnInput = document.getElementById('export-filename');
        const res = buildExportJpegDataUrl(photo, q);
        triggerJpegDownload(res.dataUrl, fnInput ? fnInput.value : photo.title);
        showToast('고화질 JPEG(.jpg) 사진 파일을 저장했습니다!');
      });
    }

    const btnExportBatch = document.getElementById('btn-export-batch');
    if (btnExportBatch) {
      btnExportBatch.addEventListener('click', () => {
        const q = exportQuality ? Number(exportQuality.value) : 95;
        const fnInput = document.getElementById('export-filename');
        const prefix = (fnInput && fnInput.value.trim()) || 'EvotoLite';
        state.photos.forEach((p, idx) => {
          const res = buildExportJpegDataUrl(p, q);
          triggerJpegDownload(res.dataUrl, `${prefix}_${idx + 1}_${p.title}`);
        });
        showToast(`목록의 전체 사진 ${state.photos.length}장을 JPEG(.jpg)로 일괄 저장했습니다!`);
      });
    }

    const btnExportShare = document.getElementById('btn-export-share');
    if (btnExportShare) {
      btnExportShare.addEventListener('click', async () => {
        const photo = getActivePhoto();
        if (!photo) return;
        const q = exportQuality ? Number(exportQuality.value) : 95;
        const res = buildExportJpegDataUrl(photo, q);
        try {
          const blob = await (await fetch(res.dataUrl)).blob();
          const file = new File([blob], 'EvotoLite_보정사진.jpg', { type: 'image/jpeg' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: 'EvotoLite 보정 사진',
              files: [file]
            });
            return;
          }
        } catch (_) {}
        triggerJpegDownload(res.dataUrl, 'EvotoLite_보정사진');
        showToast('현재 기기에서 바로 JPEG 다운로드로 저장했습니다.');
      });
    }

    // 스마트폰 연결 안내 모달
    const modalMobile = document.getElementById('modal-mobile');
    const btnMobileGuide = document.getElementById('btn-mobile-guide');
    const btnMobileClose = document.getElementById('btn-mobile-close');
    if (btnMobileGuide && modalMobile) {
      btnMobileGuide.addEventListener('click', () => {
        modalMobile.classList.remove('hidden');
        fetch('/api/network-info')
          .then((r) => r.json())
          .then((info) => {
            const box = document.getElementById('wifi-address-list');
            if (box && info.mobileUrls && info.mobileUrls.length > 0) {
              box.innerHTML = info.mobileUrls
                .map((u) => `<div class="wifi-url-item">${u.url} (${u.name})</div>`)
                .join('');
            }
          })
          .catch(() => {});
      });
    }
    if (btnMobileClose && modalMobile) {
      btnMobileClose.addEventListener('click', () => modalMobile.classList.add('hidden'));
    }
  }

  // =========================================================================
  // 14. WebMCP 에이전트 도구 등록 & 전역 API 노출 (law.md 제6원칙 준수)
  // =========================================================================
  const publicApi = {
    getState() {
      const photo = getActivePhoto();
      return {
        photoCount: state.photos.length,
        activePhotoIndex: state.activePhotoIndex,
        activePhotoTitle: photo ? photo.title : null,
        activePresetId: photo ? photo.activePresetId : null,
        presetCount: getAllPresets().length,
        hasClipboardSettings: Boolean(state.clipboardSettings),
        params: photo ? { ...photo.params } : {}
      };
    },
    getPresets() {
      return getAllPresets();
    },
    selectPhoto(index) {
      if (index >= 0 && index < state.photos.length) {
        state.activePhotoIndex = index;
        syncUIFromActivePhoto();
        renderFilmstrip();
        renderMainStage();
        return true;
      }
      return false;
    },
    setParams(partial) {
      const photo = getActivePhoto();
      if (!photo || !partial) return false;
      pushUndoSnapshot(photo);
      Object.keys(partial).forEach((k) => {
        if (k in photo.params) {
          photo.params[k] = partial[k];
        }
      });
      syncUIFromActivePhoto();
      renderFilmstrip();
      renderMainStage();
      return true;
    },
    applyPreset(presetId) {
      return applyPresetById(presetId);
    },
    copySettings() {
      return copySettingsFromActivePhoto();
    },
    pasteSettings() {
      return pasteSettingsToActivePhoto();
    },
    syncAllPhotos() {
      return syncSettingsToAllPhotos();
    },
    exportJpeg(qualityPercent) {
      const photo = getActivePhoto();
      return buildExportJpegDataUrl(photo, qualityPercent || 92, { width: 360, height: 450 });
    }
  };

  window.EvotoLiteApp = publicApi;

  function registerWebMcpTools() {
    const mc = typeof document !== 'undefined' ? document.modelContext : null;
    if (!mc || typeof mc.registerTool !== 'function') return;

    const tools = [
      {
        name: 'get_evoto_state',
        description: '현재 EvotoLite 사진 편집기의 상태, 프리셋 수, 보정 파라미터를 조회합니다.',
        inputSchema: { type: 'object', properties: {} },
        annotations: { readOnlyHint: true },
        async execute() {
          return {
            content: [{ type: 'text', text: JSON.stringify(publicApi.getState()) }]
          };
        }
      },
      {
        name: 'copy_paste_retouch_settings',
        description: '이보토 스타일 인물·리퀴파이·색감 보정 수치를 복사하거나 다른 사진에 붙여넣습니다.',
        inputSchema: {
          type: 'object',
          properties: {
            action: { type: 'string', enum: ['copy', 'paste', 'syncAll'] },
            targetPhotoIndex: { type: 'number' }
          },
          required: ['action']
        },
        annotations: { readOnlyHint: false },
        async execute(args) {
          if (typeof args?.targetPhotoIndex === 'number') {
            publicApi.selectPhoto(args.targetPhotoIndex);
          }
          if (args?.action === 'copy') publicApi.copySettings();
          else if (args?.action === 'paste') publicApi.pasteSettings();
          else if (args?.action === 'syncAll') publicApi.syncAllPhotos();
          return {
            content: [{ type: 'text', text: JSON.stringify(publicApi.getState()) }]
          };
        }
      }
    ];

    tools.forEach((tool) => {
      try {
        mc.registerTool(tool);
      } catch (_) {}
    });
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator && (location.protocol === 'http:' || location.protocol === 'https:')) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  }

  function bootstrap() {
    initSamplePhotos();
    bindEvents();
    renderPresetGrid();
    renderFilmstrip();
    syncUIFromActivePhoto();
    renderMainStage();
    registerWebMcpTools();
    registerServiceWorker();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
