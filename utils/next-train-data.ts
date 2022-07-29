import { ILine, IStation } from '@store/slices/trainSlice'

const AEL_COLOR = '#1c7670'
const TCL_COLOR = '#fe7f1d'
const TML_COLOR = '#9a3b26'
const TKL_COLOR = '#6b208b'
const EAL_COLOR = '#5eb6e4'

export interface ILineStation {
  line: ILine
  stations: IStation[]
}

export const DATA: ILineStation[] = [
  {
    line: {
      code: 'AEL',
      label: { en: 'Airport Express', tc: '機場快綫' },
      color: AEL_COLOR,
    },
    stations: [
      {
        code: 'HOK',
        label: { en: 'Hong Kong', tc: '香港' },
        location: { lat: 22.284654109599554, lng: 114.15824513908593 },
        related: [{ lineCode: 'TCL', color: TCL_COLOR }],
      },
      {
        code: 'KOW',
        label: { en: 'Kowloon', tc: '九龍' },
        location: { lat: 22.304314573300715, lng: 114.1613895953227 },
        related: [{ lineCode: 'TCL', color: TCL_COLOR }],
      },
      {
        code: 'TSY',
        label: { en: 'Tsing Yi', tc: '青衣' },
        location: { lat: 22.358508172423235, lng: 114.10768242620871 },
        related: [{ lineCode: 'TCL', color: TCL_COLOR }],
      },
      {
        code: 'AIR',
        label: { en: 'Airport', tc: '機場' },
        location: { lat: 22.31585557451253, lng: 113.93656428430972 },
      },
      {
        code: 'AWE',
        label: { en: 'AsiaWorld-Expo', tc: '博覽館' },
        location: { lat: 22.32087881389577, lng: 113.94181208198415 },
      },
    ],
  },
  {
    line: {
      code: 'TCL',
      label: { en: 'Tung Chung Line', tc: '東涌綫' },
      color: TCL_COLOR,
    },
    stations: [
      {
        code: 'HOK',
        label: { en: 'Hong Kong', tc: '香港' },
        location: { lat: 22.284654109599554, lng: 114.15824513908593 },
        related: [{ lineCode: 'AEL', color: AEL_COLOR }],
      },
      {
        code: 'KOW',
        label: { en: 'Kowloon', tc: '九龍' },
        location: { lat: 22.304314573300715, lng: 114.1613895953227 },
        related: [{ lineCode: 'AEL', color: AEL_COLOR }],
      },
      {
        code: 'OLY',
        label: { en: 'Olympic', tc: '奧運' },
        location: { lat: 22.317809046575164, lng: 114.16018390269836 },
      },
      {
        code: 'NAC',
        label: { en: 'Nam Cheong', tc: '南昌' },
        location: { lat: 22.32681844121303, lng: 114.15367056315998 },
        related: [{ lineCode: 'TML', color: TML_COLOR }],
      },
      {
        code: 'LAK',
        label: { en: 'Lai King', tc: '荔景' },
        location: { lat: 22.348387078565278, lng: 114.12616746216915 },
      },
      {
        code: 'TSY',
        label: { en: 'Tsing Yi', tc: '青衣' },
        location: { lat: 22.358508172423235, lng: 114.10768242620871 },
        related: [{ lineCode: 'AEL', color: AEL_COLOR }],
      },
      {
        code: 'SUN',
        label: { en: 'Sunny Bay', tc: '欣澳' },
        location: { lat: 22.331734796626517, lng: 114.02889408640976 },
      },
      {
        code: 'TUC',
        label: { en: 'Tung Chung', tc: '東涌' },
        location: { lat: 22.289282798320432, lng: 113.94145810300658 },
      },
    ],
  },
  {
    line: {
      code: 'TML',
      label: { en: 'Tuen Ma Line', tc: '屯馬綫' },
      color: TML_COLOR,
    },
    stations: [
      {
        code: 'WKS',
        label: { en: 'Wu Kai Sha', tc: '烏溪沙' },
        location: { lat: 22.42918990760702, lng: 114.2439052763061 },
      },
      {
        code: 'MOS',
        label: { en: 'Ma On Shan', tc: '馬鞍山' },
        location: { lat: 22.42478339802693, lng: 114.23171206132076 },
      },
      {
        code: 'HEO',
        label: { en: 'Heng On', tc: '恒安' },
        location: { lat: 22.417304627653657, lng: 114.2257395971058 },
      },
      {
        code: 'TSH',
        label: { en: 'Tai Shui Hang', tc: '大水坑' },
        location: { lat: 22.408416366675173, lng: 114.22269157070565 },
      },
      {
        code: 'SHM',
        label: { en: 'Shek Mun', tc: '石門' },
        location: { lat: 22.38784762623715, lng: 114.20843577738854 },
      },
      {
        code: 'CIO',
        label: { en: 'City One', tc: '第一城' },
        location: { lat: 22.38284966451127, lng: 114.2035340901919 },
      },
      {
        code: 'STW',
        label: { en: 'Sha Tin Wai', tc: '沙田圍' },
        location: { lat: 22.377106443283527, lng: 114.19510721658921 },
      },
      {
        code: 'CKT',
        label: { en: 'Che Kung Temple', tc: '車公廟' },
        location: { lat: 22.37471595167667, lng: 114.18590816008592 },
      },
      {
        code: 'TAW',
        label: { en: 'Tai Wai', tc: '大圍' },
        location: { lat: 22.37269797216996, lng: 114.17842133604134 },
        related: [{ lineCode: 'EAL', color: EAL_COLOR }],
      },
      {
        code: 'HIK',
        label: { en: 'Hin Keng', tc: '顯徑' },
        location: { lat: 22.363818514989298, lng: 114.17093451169414 },
      },
      {
        code: 'DIH',
        label: { en: 'Diamond Hill', tc: '鑽石山' },
        location: { lat: 22.339927842120527, lng: 114.2016697801652 },
      },
      {
        code: 'KAT',
        label: { en: 'Kai Tak', tc: '啟德' },
        location: { lat: 22.33051835461589, lng: 114.19965538877997 },
      },
      {
        code: 'SUW',
        label: { en: 'Sung Wong Toi', tc: '宋皇臺' },
        location: { lat: 22.326015239918544, lng: 114.1912285155099 },
      },
      {
        code: 'TKW',
        label: { en: 'To Kwa Wan', tc: '土瓜灣' },
        location: { lat: 22.31725704206645, lng: 114.18777047521297 },
      },
      {
        code: 'HOM',
        label: { en: 'Ho Man Tin', tc: '何文田' },
        location: { lat: 22.30939904232788, lng: 114.18280164175012 },
      },
      {
        code: 'HUH',
        label: { en: 'Hung Hom', tc: '紅磡' },
        location: { lat: 22.30334217928546, lng: 114.18149228682145 },
        related: [{ lineCode: 'EAL', color: EAL_COLOR }],
      },
      {
        code: 'ETS',
        label: { en: 'East Tsim Sha Tsui', tc: '尖東' },
        location: { lat: 22.29473787652132, lng: 114.17346829228025 },
      },
      {
        code: 'AUS',
        label: { en: 'Austin', tc: '柯士甸' },
        location: { lat: 22.305236918438474, lng: 114.16618290811526 },
      },
      {
        code: 'NAC',
        label: { en: 'Nam Cheong', tc: '南昌' },
        location: { lat: 22.32681844121303, lng: 114.15367056315998 },
        related: [{ lineCode: 'TCL', color: TCL_COLOR }],
      },
      {
        code: 'MEF',
        label: { en: 'Mei Foo', tc: '美孚' },
        location: { lat: 22.337659621530488, lng: 114.13791652051626 },
      },
      {
        code: 'TWW',
        label: { en: 'Tsuen Wan West', tc: '荃灣西' },
        location: { lat: 22.36841498379215, lng: 114.10967964301895 },
      },
      {
        code: 'KSR',
        label: { en: 'Kam Sheung Road', tc: '錦上路' },
        location: { lat: 22.434758870642064, lng: 114.06358236214594 },
      },
      {
        code: 'YUL',
        label: { en: 'Yuen Long', tc: '元朗' },
        location: { lat: 22.44610496067113, lng: 114.03491080872857 },
      },
      {
        code: 'LOP',
        label: { en: 'Long Ping', tc: '朗屏' },
        location: { lat: 22.447778233967018, lng: 114.02554096530206 },
      },
      {
        code: 'TIS',
        label: { en: 'Tin Shui Wai', tc: '天水圍' },
        location: { lat: 22.44824579101542, lng: 114.0048237190232 },
      },
      {
        code: 'SIH',
        label: { en: 'Siu Hong', tc: '兆康' },
        location: { lat: 22.41178763296941, lng: 113.9791590432159 },
      },
      {
        code: 'TUM',
        label: { en: 'Tuen Mun', tc: '屯門' },
        location: { lat: 22.39477794991598, lng: 113.97360195015355 },
      },
    ],
  },
  {
    line: {
      code: 'TKL',
      label: { en: 'Tseung Kwan O Line', tc: '將軍澳綫' },
      color: TKL_COLOR,
    },
    stations: [
      {
        code: 'NOP',
        label: { en: 'North Point', tc: '北角' },
        location: { lat: 22.291358902846948, lng: 114.20059820000797 },
      },
      {
        code: 'QUB',
        label: { en: 'Quarry Bay', tc: '鰂魚涌' },
        location: { lat: 22.287745414523513, lng: 114.20978208372225 },
      },
      {
        code: 'YAT',
        label: { en: 'Yau Tong', tc: '油塘' },
        location: { lat: 22.298076999023717, lng: 114.23695254473539 },
      },
      {
        code: 'TIK',
        label: { en: 'Tiu Keng Leng', tc: '調景嶺' },
        location: { lat: 22.30448910884455, lng: 114.25288816375374 },
      },
      {
        code: 'TKO',
        label: { en: 'Tseung Kwan O', tc: '將軍澳' },
        location: { lat: 22.307497609793792, lng: 114.26012857974864 },
      },
      {
        code: 'LHP',
        label: { en: 'LOHAS Park', tc: '康城' },
        location: { lat: 22.29634569730654, lng: 114.26947563794256 },
      },
      {
        code: 'HAH',
        label: { en: 'Hang Hau', tc: '坑口' },
        location: { lat: 22.315571903429653, lng: 114.26442004948456 },
      },
      {
        code: 'POA',
        label: { en: 'Po Lam', tc: '寶琳' },
        location: { lat: 22.322622415835006, lng: 114.25784016297298 },
      },
    ],
  },
  {
    line: {
      code: 'EAL',
      label: { en: 'East Rail Line', tc: '東鐵綫' },
      color: EAL_COLOR,
    },
    stations: [
      {
        code: 'ADM',
        label: { en: 'Admiralty', tc: '金鐘' },
        location: { lat: 22.279525373568482, lng: 114.16454931115187 },
      },
      {
        code: 'EXC',
        label: { en: 'Exhibition Centre', tc: '會展' },
        location: { lat: 22.282225730141956, lng: 114.175535638521 },
      },
      {
        code: 'HUH',
        label: { en: 'Hung Hom', tc: '紅磡' },
        location: { lat: 22.30334217928546, lng: 114.18149228682145 },
        related: [{ lineCode: 'TML', color: TML_COLOR }],
      },
      {
        code: 'MKK',
        label: { en: 'Mong Kok East', tc: '旺角東' },
        location: { lat: 22.32200342136031, lng: 114.17259835190865 },
      },
      {
        code: 'KOT',
        label: { en: 'Kowloon Tong', tc: '九龍塘' },
        location: { lat: 22.337207473813702, lng: 114.17616943530182 },
      },
      {
        code: 'TAW',
        label: { en: 'Tai Wai', tc: '大圍' },
        location: { lat: 22.37274948018549, lng: 114.17860243588709 },
        related: [{ lineCode: 'TML', color: TML_COLOR }],
      },
      {
        code: 'SHT',
        label: { en: 'Sha Tin', tc: '沙田' },
        location: { lat: 22.381834570775034, lng: 114.18695029918072 },
      },
      {
        code: 'FOT',
        label: { en: 'Fo Tan', tc: '火炭' },
        location: { lat: 22.395099236665178, lng: 114.19811507137004 },
      },
      {
        code: 'RAC',
        label: { en: 'Racecourse', tc: '馬場' },
        location: { lat: 22.40093713473015, lng: 114.20321113623658 },
      },
      {
        code: 'UNI',
        label: { en: 'University', tc: '大學' },
        location: { lat: 22.413130089895965, lng: 114.20992742145448 },
      },
      {
        code: 'TAP',
        label: { en: 'Tai Po Market', tc: '大埔墟' },
        location: { lat: 22.44455012473941, lng: 114.17048384771446 },
      },
      {
        code: 'TWO',
        label: { en: 'Tai Wo', tc: '太和' },
        location: { lat: 22.451011888312937, lng: 114.16122193698556 },
      },
      {
        code: 'FAN',
        label: { en: 'Fanling', tc: '粉嶺' },
        location: { lat: 22.49206780362914, lng: 114.13865977567949 },
      },
      {
        code: 'SHS',
        label: { en: 'Sheung Shui', tc: '上水' },
        location: { lat: 22.501226893606812, lng: 114.1279834674456 },
      },
      {
        code: 'LOW',
        label: { en: 'Lo Wu', tc: '羅湖' },
        location: { lat: 22.52814068878625, lng: 114.11337643579478 },
      },
      {
        code: 'LMC',
        label: { en: 'Lok Ma Chau', tc: '落馬洲' },
        location: { lat: 22.51486441180752, lng: 114.06561777119347 },
      },
    ],
  },
]
