'use strict';

/**
 * [누구 템플레이트 설명]
 * 구글 cloud용으로 만들어진 단독 파일입니다.
 * exports.nugu_template 의 'nugu_template'는 설정된 이름에 맞추어서 바꾸어 주시면 됩니다.
 *
 * req.body는 SK nugu에서 들어오는 json입니다.
 */

exports.nugu_hiskin = (req, res) => {
    const appTitle = 'HISKIN'; // 앱 타이틀을 적어주세요
    const requestBody = req.body; //request의 body부분
    let parameters = '';

    if(requestBody.action.hasOwnProperty('parameters')){
      if(Object.keys(requestBody.action.parameters).length === 0){
        parameters = ''
      }else{
        parameters = requestBody.action.parameters// 파라메터 부분
      }
    }

    const context = requestBody.action.context; //컨텍스트, OAuth연결시 토큰이 들어옵니다
    const actionName = requestBody.action.actionName; // action의 이름
    console.log('requestBody ', JSON.stringify(requestBody));
    
    //마이크 오픈이라고 생각하는 것을 방지하기 위한 사용자 경험용 마지막 물음
    let lastTextArr = ['다음 명령을 말해주세요', '다음 질문이 있으신가요', '이제 어떤 것을 해드릴까요.', '이제 명령을 해 주세요.', '다른 질문이 있으신가요?', '이제 질문해주세요!', '또 궁금하신게 있으신가요?']
    
    //디버그 용, actionName을 표시합니다
    console.log(`request: ${JSON.stringify(actionName)}`);

    let output = {};

    //response json 필드. 여기서 json을 만들어준다.
    function makeJson(jsons) {
      /**
        * [makeJson 설명]
        * @json {jsons}
        * 안에는 누구로 보낼 json들이 있습니다
        * json안에는 파라메터들이 있으며, 각 파라메터는 sk nugu의 play에서 지정한
        * 이름과 동일해야 합니다.
        */
      let jsonReturn = {
        "version": "2.0",
        "resultCode": "OK",
        "directives": {
          "AudioPlayer": {
            "type": "AudioPlayer.Play",
            "audioItem": {
              "stream": {
                "url": "",
                "offsetInMilliseconds": "",
                "progressReport": {
                    "progressReportDelayInMilliseconds": "",
                    "progressReportIntervalInMilliseconds": ""
                },
                "token": "",
                "expectedPreviousToken": ""
              },
              "metadata": {}
          }
        }
      }
      }
      jsonReturn.output = jsons;
      return jsonReturn;
    }


    /**
     * [answername 설명]
     * @answername : json으로 보낼 파라메터 이름을 지정합니다.
     * 여기서는 answername으로 합니다.
    */
    // intent
    import { config } from 'dotenv';
    import { Configuration, OpenAIApi } from 'openai';

    // Load environment variables
    config();

    // Initialize OpenAI API
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    
    async function skinConcern_function() {
        // Call the OpenAI API to generate an answer
        try {
            const skinConcern = parameters.skinConcern.value;
            const ASSISTANT = {"role": "system", "content": "피부 고민을 해결해주는 친절하고 자상한 피부 관리사. 사용자의 피부고민에 대해 2~3문장으로 친절하게 답해줌"};
            const response = await openai.createChatCompletion({    /* 생성된 객체로 openAI의 여러가지 모델 중 하나인 gpt-3.5-turbo에 요청을 보냅니다. */
              model: "gpt-3.5-turbo",
              messages: [ASSISTANT,
                { role: "user", content: skinConcern }], //parameter 제대로 못 받아올 경우, skinConcern -> "여드름 피부 관리방법 알려줘"로 대체
            });
            output.skinSolution = response.data.choices[0].message;
            return res.send(makeJson(output));
        
          } catch (error) {
              console.error('callGpt35() error >>> ', error);
              return null;
          }
        
    }

    async function cosmeticRecom_function() {
        // Call the OpenAI API to generate an answer
        try {
            const cosmeticRequest = parameters.cosmeticRequest.value;
            const ASSISTANT = {"role": "system", "content": "DRPT(Dry, Resistant, Pigmented, Tight) 피부타입에 가장 잘 맞는 화장품을 추천해주는 도우미. 화장품 브랜드와 이름, 간단한 특징에 대해 알려줌"};
            const response = await openai.createChatCompletion({    /* 생성된 객체로 openAI의 여러가지 모델 중 하나인 gpt-3.5-turbo에 요청을 보냅니다. */
              model: "gpt-3.5-turbo",
              messages: [ASSISTANT,
                { role: "user", content: cosmeticRequest }],
            });
            output.cosmeticResponse = response.data.choices[0].message;
            return res.send(makeJson(output));
        
          } catch (error) {
              console.error('callGpt35() error >>> ', error);
              return null;
          }

    }

    async function dailyConversation_function() {
        // Call the OpenAI API to generate an answer
        try {
            const chatInput = parameters.chatInput.value;
            const ASSISTANT = {"role": "system", "content": "사용자의 질문이나 고민에 대한 해결방안이나 따뜻한 조언을 건네는 친구 같은 도우미. 사용자의 질문에 대해 2~3문장으로 친절하게 답해줌."};
            const response = await openai.createChatCompletion({    /* 생성된 객체로 openAI의 여러가지 모델 중 하나인 gpt-3.5-turbo에 요청을 보냅니다. */
              model: "gpt-3.5-turbo",
              messages: [ASSISTANT,
                { role: "user", content: chatInput}],
            });
            output.chatOutput = response.data.choices[0].message;
            return res.send(makeJson(output));
        
          } catch (error) {
              console.error('callGpt35() error >>> ', error);
              return null;
          }
        
    }
    //액션 선언 모음, 여기서 액션을 선언해 줍니다.
    const ACTION_SKINCONCERN = 'action.skinConcern'; // 피부고민
    const ACTION_COSMETICRECOM = 'action.cosmeticRecom'; // 화장품 추천
    const ACTION_DAILYCONVERSATION = 'action.dailyConversation'; // 일상대화

    // Intent가 오는 부분, actionName으로 구분합니다.
    switch (actionName) {
      // 최초 실행시 오는 intent. LaunchRequest만 쓴다.
      case ACTION_SKINCONCERN:
        return skinConcern_function()
        break;
      case ACTION_COSMETICRECOM:
        return cosmeticRecom_function()
        break;
      case ACTION_DAILYCONVERSATION:
        return dailyConversation_function()
        break;
        //INTENT_REQUEST의 경우 하위 function에서 switch로 intent를 처리합니다.

    }
}
