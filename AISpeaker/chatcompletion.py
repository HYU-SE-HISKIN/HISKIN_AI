import time, os
import speech_recognition as sr
from gtts import gTTS
from playsound import playsound
# 추가
import openai
from dotenv import load_dotenv

# Load the environment variables
load_dotenv()

# settings and keys
openai.api_key = os.getenv("OPENAI_API_KEY")

# 음성인식 (듣기, STT)
def listen(recognizer, audio):
    try:
        text = recognizer.recognize_google(audio, language='ko')
        print('[사용자]' + text)
        chatgpt_response(text)
    except sr.UnknownValueError:
        print('인식 실패')
    except sr.RequestError as e:
        print('요청 실패 : {0}'.format(e))

# 대답
def chatgpt_response(prompt):
    # send the converted audio text to chatgpt
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "친절하고 자상한 피부 관리사"},
            {"role": "assistant", "content": "안녕하세요, 오늘도 좋은 하루입니다! 오늘 기분은 어떠신가요?"},
            {"role": "user", "content": prompt}
        ],
        max_tokens=200,
        temperature=0.7,
    )
    speak(response.choices[-1].message['content'])

# 소리내어 읽기(TTS)
def speak(text):
    print('[인공지능]' + text)
    file_name = 'voice.mp3'
    tts = gTTS(text=text, lang='ko')
    tts.save(file_name)
    playsound(file_name)
    if os.path.exists(file_name): # voice.mp3 파일 삭제
        os.remove(file_name)

r = sr.Recognizer()
m = sr.Microphone()
speak('안녕하세요! 오늘 기분은 어떠신가요?')

while True:
    time.sleep(0.1)
    print("말씀하세요...")
    with m as source:
        try:
            audio = r.listen(source, timeout=5)
            user_input = listen(r, audio)
            if user_input:
                response_text = chatgpt_response(user_input)
                speak(response_text)
        except sr.WaitTimeoutError:
            print("말씀이 없습니다. 다시 시도하세요.")
        except Exception as e:
            print(f"에러 발생: {e}")