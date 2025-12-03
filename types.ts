
export interface BuildingUse {
  main: string;
  sub: string[];
}

export interface UserInput {
  address: string;
  landArea: string; // Changed to required string (parsed to number later)
  mainUse: string;
  subUse: string;
  userZoning?: string; // Optional: User provided zoning
  userDistrict?: string; // Optional: User provided district
}

export enum ImportanceLevel {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  INFO = 'INFO'
}

export interface CheckPoint {
  text: string;
  isChecked: boolean;
}

export interface RegulationItem {
  title: string;
  codeReference: string;
  description: string;
  importance: ImportanceLevel;
  checkPoints: string[];
}

export interface RegulationCategory {
  categoryName: string;
  items: RegulationItem[];
}

export interface QuantitativeInfo {
  legalBCR: number; // 법정 건폐율 (%)
  planBCR: number; // 계획(가능) 건폐율 (%)
  legalFAR: number; // 법정 용적률 (%)
  planFAR: number; // 계획(가능) 용적률 (%)
  legalMaxFloors: string; // 법정 층수 제한
  planMaxFloors: string; // 계획 가능 층수
  requiredParking: string; // 주차대수 산정 기준 및 대수
  requiredLandscaping: string; // 조경 의무 면적
}

export interface SpecialZone {
  name: string;      // 구역명 (예: 개발제한구역, 토지거래허가구역)
  isApplied: boolean; // 해당 여부
  status: string;    // 상태 요약 (예: "해당없음", "전역 포함", "일부 저촉")
  relatedLaw: string; // 관련 근거 법령
  description: string; // 상세 규제 내용 (모달 표시용)
}

export interface PermitStep {
  stepName: string; // 단계명 (예: 1단계 기획 및 대지분석)
  items: string[]; // 체크 항목 리스트
}

export interface OverviewInfo {
  address: string;
  zoning: string; // 용도지역
  district: string; // 지구/구역 (미관지구, 방화지구 등 - 기타 일반 지구)
  landArea: string; // 공부상 면적
  possibleUses: string[]; // 해당 지역에서 건축 가능한 다른 용도들
  specialZones: SpecialZone[]; // 개발제한구역, 토지거래허가구역 등 특수 규제
}

export interface AnalysisResult {
  summary: string;
  overview: OverviewInfo;
  quantitative: QuantitativeInfo;
  categories: RegulationCategory[];
  permitChecklist: PermitStep[]; // 인허가 체크리스트
}
