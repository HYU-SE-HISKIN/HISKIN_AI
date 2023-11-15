import time, os
import speech_recognition as sr
from gtts import gTTS
from playsound import playsound
# 추가
import openai
from dotenv import load_dotenv
from pydub import AudioSegment
from pydub.playback import play

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
    tts = gTTS(text=text, lang='ko')
    # 파일을 생성하지 않고 동적으로 음성을 생성
    file_path = 'output.mp3'
    tts.save(file_path)
    # 저장한 MP3 파일을 읽어와서 재생
    audio = AudioSegment.from_mp3(file_path)
    play(audio)

r = sr.Recognizer()
m = sr.Microphone()
speak('안녕하세요! 오늘 기분은 어떠신가요?')
stop_listening = r.listen_in_background(m, listen)

while True:
    time.sleep(0.1)
    