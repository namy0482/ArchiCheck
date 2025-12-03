
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeBuildingRegulations = async (
  address: string,
  landArea: string,
  mainUse: string,
  subUse: string,
  userZoning?: string,
  userDistrict?: string
): Promise<AnalysisResult> => {
  
  const modelId = "gemini-3-pro-preview";
  const areaNum = parseFloat(landArea) || 0;

  // 사용자 입력 정보가 있는지 확인
  const hasUserZoning = !!userZoning && userZoning.trim().length > 0;
  
  const zoningInstruction = hasUserZoning
    ? `사용자가 토지이용계획확인서를 통해 확인한 용도지역('${userZoning}')과 지구('${userDistrict || "해당없음"}')를 제공했습니다. AI 추론을 하지 말고 **반드시 이 정보(Fact)를 기준**으로 건폐율, 용적률 및 규제를 적용하십시오.`
    : `주소를 기반으로 용도지역(예: 제2종일반주거지역), 지구(예: 방화지구)를 추론하십시오. 추론이 불확실할 경우 보수적인 기준을 적용하십시오.`;

  const systemInstruction = `
    당신은 한국의 건축 법규 전문가입니다. 사용자가 대지 위치, 면적, 용도를 입력하면 다음 사항을 정밀하게 분석해야 합니다.
    
    1. **지역/지구 확정**: ${zoningInstruction}
    
    2. **특수 규제 구역 검토 (필수)**:
       - **개발제한구역(Greenbelt)**: 해당 여부를 판단하고, 해당 시 '개발제한구역의 지정 및 관리에 관한 특별조치법'에 따른 행위 제한(신축 금지, 이축권 등)을 상세히 설명하십시오.
       - **토지거래허가구역**: 해당 여부를 판단하고, 해당 시 허가 요건(실거주 의무 등)을 설명하십시오.
    
    3. **정량적 분석**: 확정된 용도지역과 해당 지자체 조례를 바탕으로 법정 건폐율(BCR), 용적률(FAR), 최대 층수 등을 산출하십시오.
       - 개발제한구역일 경우, 건폐율/용적률을 해당 특별법 기준으로 엄격하게 적용하십시오.

    4. **모든 건축 가능 용도**: 해당 용도지역에서 국토의 계획 및 이용에 관한 법률 및 해당 지자체 조례에 따라 건축이 허용되는 **모든** 용도를 나열하십시오.
       - 개발제한구역인 경우, '개발제한구역의 지정 및 관리에 관한 특별조치법'에서 허용하는 극히 제한적인 용도만 나열해야 합니다.

    5. **관계 법규 상세**: 사용자가 선택한 용도(${subUse})에 대해 다음 법령들을 통합 검토하십시오.
       - **최우선 검토**: '개발제한구역의 지정 및 관리에 관한 특별조치법' (해당 시 Importance: CRITICAL)
       - 국토의 계획 및 이용에 관한 법률
       - 건축법
       - 주차장법, 소방법, 장애인등편의법
       - 해당 용도별 개별법 (의료법, 공중위생법, 관광진흥법, 농지법, 산지관리법 등)

    6. **인허가 체크리스트**: 해당 용도의 건축 허가를 위해 필요한 실무적인 행정 절차와 준비 서류를 4단계(기획/설계/허가/착공)로 나누어 상세히 작성하십시오.
    
    분석은 보수적으로 수행하며, 지자체 조례가 불분명할 경우 통상적인 기준을 적용하되 이를 명시하십시오.
  `;

  const prompt = `
    [분석 대상]
    대지 위치: ${address}
    대지 면적: ${areaNum} m²
    계획 용도: ${mainUse} - ${subUse}
    사용자 입력 용도지역: ${userZoning || "입력 없음 (AI 추론 필요)"}
    사용자 입력 지구: ${userDistrict || "입력 없음"}
    
    위 대지에 '${subUse}'를 건축할 때의 법규 검토 결과를 JSON으로 작성해줘.
    
    [필수 요청 사항]
    1. **특수 규제 구역(specialZones) 필드**에 '개발제한구역'과 '토지거래허가구역' 두 가지 항목을 반드시 포함해줘.
       - 해당 구역에 포함된다면 description에 구체적인 제약사항(건축 가능 여부, 허가 조건 등)을 3문장 이상 상세히 적어줘.
       - 해당하지 않는다면 description에 "해당 법규의 규제를 받지 않습니다."라고 적어줘.
    2. 건폐율, 용적률 계산 시 대지면적(${areaNum}m²)을 기준으로 실제 건축 가능한 '계획 면적'을 수치로 계산해서 보여줘.
    3. 이 땅의 용도지역상 건축 가능한 **모든** 건축물의 용도를 빠짐없이 리스트업해줘. (조례상 허용되는 전체 목록)
    4. **인허가 체크리스트**는 실제로 건축사가 업무를 수행할 때 확인하는 구체적인 항목(경계명측량, 지반조사서, 배수설비신고, 정화조필증 등)을 포함해줘.
    5. 사용자가 용도지역을 입력했다면 그 정보를 절대적인 기준으로 삼아 법규를 적용해줘.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: { thinkingBudget: 4096 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "분석 결과 핵심 요약 (개발제한구역 여부 포함, 3문장 이내)"
            },
            overview: {
              type: Type.OBJECT,
              properties: {
                address: { type: Type.STRING },
                zoning: { type: Type.STRING, description: "적용된 용도지역 (사용자 입력값 또는 추론값)" },
                district: { type: Type.STRING, description: "적용된 지구/구역 (사용자 입력값 또는 추론값)" },
                landArea: { type: Type.STRING, description: "입력된 대지면적 (숫자만, 단위 제외)" },
                specialZones: {
                  type: Type.ARRAY,
                  description: "개발제한구역 및 토지거래허가구역 정보 리스트 (최소 2개 항목 필수)",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING, description: "구역명 (개발제한구역, 토지거래허가구역)" },
                      isApplied: { type: Type.BOOLEAN, description: "해당 여부" },
                      status: { type: Type.STRING, description: "상태 요약 (예: 해당없음, 전역포함)" },
                      relatedLaw: { type: Type.STRING, description: "관련 법령 명칭" },
                      description: { type: Type.STRING, description: "상세 규제 내용 및 허가 조건 설명" }
                    },
                    required: ["name", "isApplied", "status", "relatedLaw", "description"]
                  }
                },
                possibleUses: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "해당 용도지역(및 개발제한구역 등) 법규상 건축 가능한 모든 용도 리스트"
                }
              },
              required: ["address", "zoning", "district", "landArea", "specialZones", "possibleUses"]
            },
            quantitative: {
              type: Type.OBJECT,
              properties: {
                legalBCR: { type: Type.NUMBER, description: "법정 건폐율 상한값 (숫자만, %)" },
                planBCR: { type: Type.NUMBER, description: "계획 가능한 최대 건폐율 (규제 적용 후, %)" },
                legalFAR: { type: Type.NUMBER, description: "법정 용적률 상한값 (숫자만, %)" },
                planFAR: { type: Type.NUMBER, description: "계획 가능한 최대 용적률 (규제 적용 후, %)" },
                legalMaxFloors: { type: Type.STRING, description: "법적 층수 제한 설명" },
                planMaxFloors: { type: Type.STRING, description: "현실적 계획 가능 층수 (개발제한구역 시 층수 제한 엄격 적용)" },
                requiredParking: { type: Type.STRING, description: "주차대수 산정" },
                requiredLandscaping: { type: Type.STRING, description: "조경 의무 면적" }
              },
              required: ["legalBCR", "planBCR", "legalFAR", "planFAR", "legalMaxFloors", "planMaxFloors", "requiredParking", "requiredLandscaping"]
            },
            permitChecklist: {
              type: Type.ARRAY,
              description: "건축 인허가 프로세스 체크리스트 (4단계 이상)",
              items: {
                type: Type.OBJECT,
                properties: {
                  stepName: { type: Type.STRING, description: "단계명 (예: 1. 사전준비 및 기획)" },
                  items: { type: Type.ARRAY, items: { type: Type.STRING }, description: "해당 단계의 확인 항목들" }
                },
                required: ["stepName", "items"]
              }
            },
            categories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  categoryName: { type: Type.STRING, description: "법규 카테고리 (예: 개발제한구역법, 국토계획법, 건축법, 주차장법, 장애인법, 소방법)" },
                  items: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        codeReference: { type: Type.STRING },
                        description: { type: Type.STRING },
                        importance: { type: Type.STRING, enum: ["CRITICAL", "HIGH", "MEDIUM", "INFO"] },
                        checkPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
                      },
                      required: ["title", "codeReference", "description", "importance", "checkPoints"]
                    }
                  }
                },
                required: ["categoryName", "items"]
              }
            }
          },
          required: ["summary", "overview", "quantitative", "permitChecklist", "categories"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    throw new Error("AI 응답을 받아오지 못했습니다.");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("법규 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
  }
};
