/** Light Rail stations from LR Next Train Data Dictionary appendix. */

export type LrStation = {
  id: string
  label: { en: string; tc: string }
}

export const LR_STATIONS: readonly LrStation[] = [
  { id: '1', label: { en: 'Tuen Mun Ferry Pier', tc: '屯門碼頭' } },
  { id: '10', label: { en: 'Melody Garden', tc: '美樂' } },
  { id: '15', label: { en: 'Butterfly', tc: '蝴蝶' } },
  { id: '20', label: { en: 'Light Rail Depot', tc: '輕鐵車廠' } },
  { id: '30', label: { en: 'Lung Mun', tc: '龍門' } },
  { id: '40', label: { en: 'Tsing Shan Tsuen', tc: '青山村' } },
  { id: '50', label: { en: 'Tsing Wun', tc: '青雲' } },
  { id: '60', label: { en: 'Kin On', tc: '建安' } },
  { id: '70', label: { en: 'Ho Tin', tc: '河田' } },
  { id: '75', label: { en: 'Choy Yee Bridge', tc: '蔡意橋' } },
  { id: '80', label: { en: 'Affluence', tc: '澤豐' } },
  { id: '90', label: { en: 'Tuen Mun Hospital', tc: '屯門醫院' } },
  { id: '100', label: { en: 'Siu Hong', tc: '兆康' } },
  { id: '110', label: { en: 'Kei Lun', tc: '麒麟' } },
  { id: '120', label: { en: 'Ching Chung', tc: '青松' } },
  { id: '130', label: { en: 'Kin Sang', tc: '建生' } },
  { id: '140', label: { en: 'Tin King', tc: '田景' } },
  { id: '150', label: { en: 'Leung King', tc: '良景' } },
  { id: '160', label: { en: 'San Wai', tc: '新圍' } },
  { id: '170', label: { en: 'Shek Pai', tc: '石排' } },
  { id: '180', label: { en: 'Shan King (North)', tc: '山景 (北)' } },
  { id: '190', label: { en: 'Shan King (South)', tc: '山景 (南)' } },
  { id: '200', label: { en: 'Ming Kum', tc: '鳴琴' } },
  { id: '212', label: { en: 'Tai Hing (North)', tc: '大興 (北)' } },
  { id: '220', label: { en: 'Tai Hing (South)', tc: '大興 (南)' } },
  { id: '230', label: { en: 'Ngan Wai', tc: '銀圍' } },
  { id: '240', label: { en: 'Siu Hei', tc: '兆禧' } },
  { id: '250', label: { en: 'Tuen Mun Swimming Pool', tc: '屯門泳池' } },
  { id: '260', label: { en: 'Goodview Garden', tc: '豐景園' } },
  { id: '265', label: { en: 'Siu Lun', tc: '兆麟' } },
  { id: '270', label: { en: 'On Ting', tc: '安定' } },
  { id: '275', label: { en: 'Yau Oi', tc: '友愛' } },
  { id: '280', label: { en: 'Town Centre', tc: '市中心' } },
  { id: '295', label: { en: 'Tuen Mun', tc: '屯門' } },
  { id: '300', label: { en: 'Pui To', tc: '杯渡' } },
  { id: '310', label: { en: 'Hoh Fuk Tong', tc: '何福堂' } },
  { id: '320', label: { en: 'San Hui', tc: '新墟' } },
  { id: '330', label: { en: 'Prime View', tc: '景峰' } },
  { id: '340', label: { en: 'Fung Tei', tc: '鳳地' } },
  { id: '350', label: { en: 'Lam Tei', tc: '藍地' } },
  { id: '360', label: { en: 'Nai Wai', tc: '泥圍' } },
  { id: '370', label: { en: 'Chung Uk Tsuen', tc: '鍾屋村' } },
  { id: '380', label: { en: 'Hung Shui Kiu', tc: '洪水橋' } },
  { id: '390', label: { en: 'Tong Fong Tsuen', tc: '塘坊村' } },
  { id: '400', label: { en: 'Ping Shan', tc: '屏山' } },
  { id: '425', label: { en: 'Hang Mei Tsuen', tc: '坑尾村' } },
  { id: '430', label: { en: 'Tin Shui Wai', tc: '天水圍' } },
  { id: '435', label: { en: 'Tin Tsz', tc: '天慈' } },
  { id: '445', label: { en: 'Tin Yiu', tc: '天耀' } },
  { id: '448', label: { en: 'Locwood', tc: '樂湖' } },
  { id: '450', label: { en: 'Tin Wu', tc: '天湖' } },
  { id: '455', label: { en: 'Ginza', tc: '銀座' } },
  { id: '460', label: { en: 'Tin Shui', tc: '天瑞' } },
  { id: '468', label: { en: 'Chung Fu', tc: '頌富' } },
  { id: '480', label: { en: 'Tin Fu', tc: '天富' } },
  { id: '490', label: { en: 'Chestwood', tc: '翠湖' } },
  { id: '500', label: { en: 'Tin Wing', tc: '天榮' } },
  { id: '510', label: { en: 'Tin Yuet', tc: '天悅' } },
  { id: '520', label: { en: 'Tin Sau', tc: '天秀' } },
  { id: '530', label: { en: 'Wetland Park', tc: '濕地公園' } },
  { id: '540', label: { en: 'Tin Heng', tc: '天恒' } },
  { id: '550', label: { en: 'Tin Yat', tc: '天逸' } },
  { id: '560', label: { en: 'Shui Pin Wai', tc: '水邊圍' } },
  { id: '570', label: { en: 'Fung Nin Road', tc: '豐年路' } },
  { id: '580', label: { en: 'Hong Lok Road', tc: '康樂路' } },
  { id: '590', label: { en: 'Tai Tong Road', tc: '大棠路' } },
  { id: '600', label: { en: 'Yuen Long', tc: '元朗' } },
  { id: '920', label: { en: 'Sam Shing', tc: '三聖' } },
] as const

const KNOWN_LR_STATION = new Set(LR_STATIONS.map((s) => s.id))

export function isKnownLrStation(stationId: string): boolean {
  return KNOWN_LR_STATION.has(stationId)
}

export function getLrStation(stationId: string): LrStation | undefined {
  return LR_STATIONS.find((s) => s.id === stationId)
}
