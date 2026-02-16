
# !   WAP in Python to generate random temperature and humidity values between 1 and 100 every second continuously, and stop the program gracefully when the user presses Ctrl + C

import random
from time import sleep
try:
    while True:
        temperature = random.randint(1, 100)
        sleep(1)
        humidity = random.randint(1, 100)
        print(f"Temperature: {temperature}°C, Humidity: {humidity}%")
except KeyboardInterrupt:
    print("\nStopped by user.")