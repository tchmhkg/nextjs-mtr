import { ILine, IStation } from '@store/slices/trainSlice'

const AEL_COLOR = '#1c7670'
const TCL_COLOR = '#fe7f1d'
const TML_COLOR = '#9a3b26'
const TKL_COLOR = '#6b208b'
const EAL_COLOR = '#5eb6e4'
const SIL_COLOR = '#b5bd00'
const TWL_COLOR = '#FF0000'
const ISL_COLOR = '#0860a8'
const KTL_COLOR = '#1a9431'
const DRL_COLOR = '#f550a6'

export interface ILineStation {
  line: ILine
  stations: IStation[]
}

export const DATA: ILineStation[] = [
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
        related: [{ lineCode: 'KTL', color: KTL_COLOR }],
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
        related: [{ lineCode: 'KTL', color: KTL_COLOR }],
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
        related: [{ lineCode: 'TWL', color: TWL_COLOR, stationCode: 'TST' }],
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
        related: [{ lineCode: 'TWL', color: TWL_COLOR }],
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
      code: 'EAL',
      label: { en: 'East Rail Line', tc: '東鐵綫' },
      color: EAL_COLOR,
    },
    stations: [
      {
        code: 'ADM',
        label: { en: 'Admiralty', tc: '金鐘' },
        location: { lat: 22.279437872105998, lng: 114.16451984982076 },
        related: [
          { lineCode: 'TWL', color: TWL_COLOR },
          { lineCode: 'ISL', color: ISL_COLOR },
          { lineCode: 'SIL', color: SIL_COLOR },
        ],
      },
      {
        code: 'EXC',
        label: { en: 'Exhibition Centre', tc: '會展' },
        location: { lat: 22.28214319269499, lng: 114.1755009105559 },
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
        related: [{ lineCode: 'KTL', color: KTL_COLOR }],
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
  {
    line: {
      code: 'TWL',
      label: { en: 'Tsuen Wan Line', tc: '荃灣綫' },
      color: TWL_COLOR,
    },
    stations: [
      {
        code: 'TSW',
        label: { en: 'Tsuen Wan', tc: '荃灣' },
        location: { lat: 22.373684159195257, lng: 114.11771575657633 },
      },
      {
        code: 'TWH',
        label: { en: 'Tai Wo Hau', tc: '大窩口' },
        location: { lat: 22.370794644055575, lng: 114.12505645843888 },
      },
      {
        code: 'KWH',
        label: { en: 'Kwai Hing', tc: '葵興' },
        location: { lat: 22.363057866796055, lng: 114.13121071712648 },
      },
      {
        code: 'KWF',
        label: { en: 'Kwai Fong', tc: '葵芳' },
        location: { lat: 22.356989290817886, lng: 114.12795087913108 },
      },
      {
        code: 'LAK',
        label: { en: 'Lai King', tc: '茘景' },
        location: { lat: 22.348416575671703, lng: 114.1261675425042 },
        related: [{ lineCode: 'TCL', color: TCL_COLOR }],
      },
      {
        code: 'MEF',
        label: { en: 'Mei Foo', tc: '美孚' },
        location: { lat: 22.337582622733322, lng: 114.13798326234978 },
        related: [{ lineCode: 'TML', color: TML_COLOR }],
      },
      {
        code: 'LCK',
        label: { en: 'Lai Chi Kok', tc: '茘枝角' },
        location: { lat: 22.33725933509118, lng: 114.14803452976578 },
      },
      {
        code: 'CSW',
        label: { en: 'Cheung Sha Wan', tc: '長沙灣' },
        location: { lat: 22.335608624667422, lng: 114.1559945724623 },
      },
      {
        code: 'SSP',
        label: { en: 'Sham Shui Po', tc: '深水埗' },
        location: { lat: 22.330773835318833, lng: 114.16226913522644 },
      },
      {
        code: 'PRE',
        label: { en: 'Prince Edward', tc: '太子' },
        location: { lat: 22.325076640734018, lng: 114.16838400758587 },
        related: [{ lineCode: 'KTL', color: KTL_COLOR }],
      },
      {
        code: 'MOK',
        label: { en: 'Mong Kok', tc: '旺角' },
        location: { lat: 22.31925160088338, lng: 114.16935448989463 },
        related: [{ lineCode: 'KTL', color: KTL_COLOR }],
      },
      {
        code: 'YMT',
        label: { en: 'Yau Ma Tei', tc: '油麻地' },
        location: { lat: 22.31282704700396, lng: 114.17068012034585 },
        related: [{ lineCode: 'KTL', color: KTL_COLOR }],
      },
      {
        code: 'JOR',
        label: { en: 'Jordan', tc: '佐敦' },
        location: { lat: 22.304796803873053, lng: 114.17166066656826 },
      },
      {
        code: 'TST',
        label: { en: 'Tsim Sha Tsui', tc: '尖沙咀' },
        location: { lat: 22.29757137332664, lng: 114.17220789068388 },
        related: [{ lineCode: 'TML', color: TML_COLOR, stationCode: 'ETS' }],
      },
      {
        code: 'ADM',
        label: { en: 'Admiralty', tc: '金鐘' },
        location: { lat: 22.279437872105998, lng: 114.16451984982076 },
        related: [
          { lineCode: 'EAL', color: EAL_COLOR },
          { lineCode: 'SIL', color: SIL_COLOR },
          { lineCode: 'ISL', color: ISL_COLOR },
        ],
      },
      {
        code: 'CEN',
        label: { en: 'Central', tc: '中環' },
        location: { lat: 22.281952496463273, lng: 114.15825203489491 },
        related: [
          { lineCode: 'ISL', color: ISL_COLOR },
          { lineCode: 'TCL', color: TCL_COLOR, stationCode: 'HOK' },
          { lineCode: 'AEL', color: AEL_COLOR, stationCode: 'HOK' },
        ],
      },
    ],
  },
  {
    line: {
      code: 'ISL',
      label: { en: 'Island Line', tc: '港島綫' },
      color: ISL_COLOR,
    },
    stations: [
      {
        code: 'KET',
        label: { en: 'Kennedy Town', tc: '堅尼地城' },
        location: { lat: 22.281245084235884, lng: 114.12888553429799 },
      },
      {
        code: 'HKU',
        label: { en: 'HKU', tc: '香港大學' },
        location: { lat: 22.283982963712745, lng: 114.13504137936995 },
      },
      {
        code: 'SYP',
        label: { en: 'Sai Ying Pun', tc: '西營盤' },
        location: { lat: 22.285532174451383, lng: 114.14273262026643 },
      },
      {
        code: 'SHW',
        label: { en: 'Sheung Wan', tc: '上環' },
        location: { lat: 22.28658737999083, lng: 114.15186938435883 },
      },
      {
        code: 'CEN',
        label: { en: 'Central', tc: '中環' },
        location: { lat: 22.281952496463273, lng: 114.15825203489491 },
        related: [
          { lineCode: 'TWL', color: TWL_COLOR },
          { lineCode: 'TCL', color: TCL_COLOR, stationCode: 'HOK' },
          { lineCode: 'AEL', color: AEL_COLOR, stationCode: 'HOK' },
        ],
      },
      {
        code: 'ADM',
        label: { en: 'Admiralty', tc: '金鐘' },
        location: { lat: 22.279437872105998, lng: 114.16451984982076 },
        related: [
          { lineCode: 'EAL', color: EAL_COLOR },
          { lineCode: 'SIL', color: SIL_COLOR },
          { lineCode: 'TWL', color: TWL_COLOR },
        ],
      },
      {
        code: 'WAC',
        label: { en: 'Wan Chai', tc: '灣仔' },
        location: { lat: 22.277548700740837, lng: 114.17315363198794 },
      },
      {
        code: 'CAB',
        label: { en: 'Causeway Bay', tc: '銅鑼灣' },
        location: { lat: 22.28037664781269, lng: 114.18504197799862 },
      },
      {
        code: 'TIH',
        label: { en: 'Tin Hau', tc: '天后' },
        location: { lat: 22.282418463838578, lng: 114.19172829641676 },
      },
      {
        code: 'FOH',
        label: { en: 'Fortress Hill', tc: '炮台山' },
        location: { lat: 22.287994616922926, lng: 114.19356098402314 },
      },
      {
        code: 'NOP',
        label: { en: 'North Point', tc: '北角' },
        location: { lat: 22.291270130030153, lng: 114.20049321172154 },
        related: [{ lineCode: 'TKL', color: TKL_COLOR }],
      },
      {
        code: 'QUB',
        label: { en: 'Quarry Bay', tc: '鰂魚涌' },
        location: { lat: 22.287884893337832, lng: 114.20975058946789 },
        related: [{ lineCode: 'TKL', color: TKL_COLOR }],
      },
      {
        code: 'TAK',
        label: { en: 'Tai Koo', tc: '太古' },
        location: { lat: 22.2846493141534, lng: 114.21635997362067 },
      },
      {
        code: 'SWH',
        label: { en: 'Sai Wan Ho', tc: '西灣河' },
        location: { lat: 22.282100358518772, lng: 114.22190186563354 },
      },
      {
        code: 'SKW',
        label: { en: 'Shau Kei Wan', tc: '筲箕灣' },
        location: { lat: 22.279240602838502, lng: 114.22887973735025 },
      },
      {
        code: 'HFC',
        label: { en: 'Heng Fa Chuen', tc: '杏花邨' },
        location: { lat: 22.276806535580885, lng: 114.23991330359172 },
      },
      {
        code: 'CHW',
        label: { en: 'Chai Wan', tc: '柴灣' },
        location: { lat: 22.264624576958997, lng: 114.23713759155268 },
      },
    ],
  },
  {
    line: {
      code: 'KTL',
      label: { en: 'Kwun Tong Line', tc: '觀塘綫' },
      color: KTL_COLOR,
    },
    stations: [
      {
        code: 'WHA',
        label: { en: 'Whampoa', tc: '黃埔' },
        location: { lat: 22.305027972320136, lng: 114.1895491302075 },
      },
      {
        code: 'HOM',
        label: { en: 'Ho Man Tin', tc: '何文田' },
        location: { lat: 22.30939904232788, lng: 114.18280164175012 },
        related: [{ lineCode: 'TML', color: TML_COLOR }],
      },
      {
        code: 'YMT',
        label: { en: 'Yau Ma Tei', tc: '油麻地' },
        location: { lat: 22.31282704700396, lng: 114.17068012034585 },
        related: [{ lineCode: 'TWL', color: TWL_COLOR }],
      },
      {
        code: 'MOK',
        label: { en: 'Mong Kok', tc: '旺角' },
        location: { lat: 22.31925160088338, lng: 114.16935448989463 },
        related: [{ lineCode: 'TWL', color: TWL_COLOR }],
      },
      {
        code: 'PRE',
        label: { en: 'Prince Edward', tc: '太子' },
        location: { lat: 22.325076640734018, lng: 114.16838400758587 },
        related: [{ lineCode: 'TWL', color: TWL_COLOR }],
      },
      {
        code: 'SKM',
        label: { en: 'Shek Kip Mei', tc: '石硤尾' },
        location: { lat: 22.332137502978632, lng: 114.16880086621994 },
      },
      {
        code: 'KOT',
        label: { en: 'Kowloon Tong', tc: '九龍塘' },
        location: { lat: 22.337207473813702, lng: 114.17616943530182 },
        related: [{ lineCode: 'EAL', color: EAL_COLOR }],
      },
      {
        code: 'LOF',
        label: { en: 'Lok Fu', tc: '樂富' },
        location: { lat: 22.33804173250202, lng: 114.18703516959667 },
      },
      {
        code: 'WTS',
        label: { en: 'Wong Tai Sin', tc: '黃大仙' },
        location: { lat: 22.341666605176346, lng: 114.19384952609641 },
      },
      {
        code: 'DIH',
        label: { en: 'Diamond Hill', tc: '鑽石山' },
        location: { lat: 22.339927842120527, lng: 114.2016697801652 },
        related: [{ lineCode: 'TML', color: TML_COLOR }],
      },
      {
        code: 'CHH',
        label: { en: 'Choi Hung', tc: '彩虹' },
        location: { lat: 22.33489863657119, lng: 114.20898867026554 },
      },
      {
        code: 'KOB',
        label: { en: 'Kowloon Bay', tc: '九龍灣' },
        location: { lat: 22.323253022081545, lng: 114.21397572795739 },
      },
      {
        code: 'NTK',
        label: { en: 'Ngau Tau Kok', tc: '牛頭角' },
        location: { lat: 22.315573561429513, lng: 114.2190005741596 },
      },
      {
        code: 'KWT',
        label: { en: 'Kwun Tong', tc: '觀塘' },
        location: { lat: 22.312228569409953, lng: 114.22635675739718 },
      },
      {
        code: 'LAT',
        label: { en: 'Lam Tin', tc: '藍田' },
        location: { lat: 22.30686640004163, lng: 114.23274792327112 },
      },
      {
        code: 'YAT',
        label: { en: 'Yau Tong', tc: '油塘' },
        location: { lat: 22.298076999023717, lng: 114.23695254473539 },
        related: [{ lineCode: 'TKL', color: TKL_COLOR }],
      },
      {
        code: 'TIK',
        label: { en: 'Tiu Keng Leng', tc: '調景嶺' },
        location: { lat: 22.30448910884455, lng: 114.25288816375374 },
        related: [{ lineCode: 'TKL', color: TKL_COLOR }],
      },
    ],
  },
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
        related: [
          { lineCode: 'TCL', color: TCL_COLOR },
          { lineCode: 'ISL', color: ISL_COLOR, stationCode: 'CEN' },
          { lineCode: 'TWL', color: TWL_COLOR, stationCode: 'CEN' },
        ],
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
        related: [
          { lineCode: 'AEL', color: AEL_COLOR },
          { lineCode: 'ISL', color: ISL_COLOR, stationCode: 'CEN' },
          { lineCode: 'TWL', color: TWL_COLOR, stationCode: 'CEN' },
        ],
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
        related: [{ lineCode: 'TWL', color: TWL_COLOR }],
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
        related: [{ lineCode: 'DRL', color: DRL_COLOR }],
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
      code: 'TKL',
      label: { en: 'Tseung Kwan O Line', tc: '將軍澳綫' },
      color: TKL_COLOR,
    },
    stations: [
      {
        code: 'NOP',
        label: { en: 'North Point', tc: '北角' },
        location: { lat: 22.291358902846948, lng: 114.20059820000797 },
        related: [{ lineCode: 'ISL', color: ISL_COLOR }],
      },
      {
        code: 'QUB',
        label: { en: 'Quarry Bay', tc: '鰂魚涌' },
        location: { lat: 22.287745414523513, lng: 114.20978208372225 },
        related: [{ lineCode: 'ISL', color: ISL_COLOR }],
      },
      {
        code: 'YAT',
        label: { en: 'Yau Tong', tc: '油塘' },
        location: { lat: 22.298076999023717, lng: 114.23695254473539 },
        related: [{ lineCode: 'KTL', color: KTL_COLOR }],
      },
      {
        code: 'TIK',
        label: { en: 'Tiu Keng Leng', tc: '調景嶺' },
        location: { lat: 22.30448910884455, lng: 114.25288816375374 },
        related: [{ lineCode: 'KTL', color: KTL_COLOR }],
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
      code: 'SIL',
      label: { en: 'South Island Line', tc: '南港島綫' },
      color: SIL_COLOR,
    },
    stations: [
      {
        code: 'ADM',
        label: { en: 'Admiralty', tc: '金鐘' },
        location: { lat: 22.279437872105998, lng: 114.16451984982076 },
        related: [
          { lineCode: 'EAL', color: EAL_COLOR },
          { lineCode: 'TWL', color: TWL_COLOR },
          { lineCode: 'ISL', color: ISL_COLOR },
        ],
      },
      {
        code: 'OCP',
        label: { en: 'Ocean Park', tc: '海洋公園' },
        location: { lat: 22.24871486908183, lng: 114.17444706443838 },
      },
      {
        code: 'WCH',
        label: { en: 'Wong Chuk Hang', tc: '黃竹坑' },
        location: { lat: 22.247991813315792, lng: 114.16802676039767 },
      },
      {
        code: 'LET',
        label: { en: 'Lei Tung', tc: '利東' },
        location: { lat: 22.24193936402401, lng: 114.15609647206259 },
      },
      {
        code: 'SOH',
        label: { en: 'South Horizons', tc: '海怡半島' },
        location: { lat: 22.242859673123597, lng: 114.14874222376356 },
      },
    ],
  },
  {
    line: {
      code: 'DRL',
      label: { en: 'Disneyland Rosort Line', tc: '迪士尼綫' },
      color: DRL_COLOR,
    },
    stations: [
      {
        code: 'SUN',
        label: { en: 'Sunny Bay', tc: '欣澳' },
        location: { lat: 22.331734796626517, lng: 114.02889408640976 },
        related: [
          { lineCode: 'TCL', color: TCL_COLOR },
        ],
      },
      {
        code: 'DIS',
        label: { en: 'Disneyland Resort', tc: '迪士尼' },
        location: { lat: 22.31536553231452, lng: 114.04518448364603 },
      },
    ],
  },
]
